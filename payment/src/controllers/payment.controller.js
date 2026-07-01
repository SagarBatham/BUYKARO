const paymentModel = require("../model/payment.model");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const{publishToQueue}=require("../broker/broker")
const ORDER_SERVICE_BASE_URL = process.env.ORDER_SERVICE_URL || process.env.NEXT_PUBLIC_ORDER_SERVICE || 'https://order-service-wosw.onrender.com';
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPayment(req, res) {
    try {
        const orderId = req.params.orderId || req.body.orderId;

        const authHeader = req.headers?.authorization;
        const token =
            req.cookies?.token ||
            (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader);

        if (!orderId) {
            return res.status(400).json({
                message: "orderId is required"
            });
        }

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: No Token Provided",
            });
        }

        const fetchOrderResponse = await axios.get(
            `${ORDER_SERVICE_BASE_URL}/api/orders/${orderId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const fetchOrder = fetchOrderResponse.data;
        const orderData = fetchOrder?.data || fetchOrder;
        const totalPrice = orderData?.totalPrice;

        if (!totalPrice) {
            return res.status(404).json({
                message: "Order total price not found",
                order: orderData,
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: totalPrice.amount * 100, // Razorpay uses paise
            currency: totalPrice.currency,
            receipt: orderId,
        });

        const payment = await paymentModel.create({
            order: orderId,
            razorpayOrderId: razorpayOrder.id,
            user: req.user.id,
            price: {
                amount: totalPrice.amount,
                currency: totalPrice.currency,
            },
            status: "PENDING",
        });

        return res.status(201).json({
            message: "Payment Initiated Successfully",
            razorpayOrder,
            payment,
        });
    } catch (error) {
        console.log(error.response?.data || error);

        return res.status(500).json({
            error: error.response?.data || error.message,
        });
    }
}

async function getPaymentByOrder(req, res) {
    const user = req.user;
    const orderId = req.params.orderId;

    try {
        let payment = await paymentModel.findOne({
            order: orderId,
            user: user.id,
            status: 'COMPLETED',
        }).sort({ updatedAt: -1 });

        if (!payment) {
            payment = await paymentModel.findOne({
                order: orderId,
                user: user.id,
                status: 'FAILED',
            }).sort({ updatedAt: -1 });
        }

        if (!payment) {
            payment = await paymentModel.findOne({
                order: orderId,
                user: user.id,
            }).sort({ createdAt: -1 });
        }

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found for this order",
            });
        }

        return res.status(200).json({ data: payment });
    } catch (error) {
        console.error('getPaymentByOrder error', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

async function verifyPayment(req, res) {
    const { razorpayOrderId, paymentId, signature } = req.body;

    try {
        const {
            validatePaymentVerification,
        } = require("razorpay/dist/utils/razorpay-utils");

        const isValid = validatePaymentVerification(
            {
                order_id: razorpayOrderId,
                payment_id: paymentId,
            },
            signature,
            process.env.RAZORPAY_KEY_SECRET
        );

        if (!isValid) {
            const failedPayment = await paymentModel.findOne({ razorpayOrderId });
            if (failedPayment) {
                failedPayment.status = 'FAILED';
                failedPayment.signature = signature;
                failedPayment.paymentId = paymentId;
                await failedPayment.save();
            }

            await publishToQueue(
                "PAYMENT_NOTIFICATION.PAYMENT_FAILED",
                {
                    email: req.user.email,
                    orderId: razorpayOrderId,
                    paymentId,
                    reason: "Invalid Payment Signature",
                }
            );

            return res.status(400).json({
                message: "Invalid Signature",
            });
        }

        const payment = await paymentModel.findOne({
            razorpayOrderId,
            status: "PENDING",
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment Not Found",
            });
        }

        payment.paymentId = paymentId;
        payment.signature = signature;
        payment.status = "COMPLETED";

        await payment.save();

        const authToken = req.headers.authorization || (req.cookies?.token ? `Bearer ${req.cookies.token}` : undefined);

        let orderConfirmed = false;
        let orderConfirmError = null;

        if (!authToken) {
          console.warn('Order confirmation skipped: missing auth token');
          orderConfirmError = 'Missing auth token for order confirmation';
        } else {
          try {
            await axios.patch(
                `${ORDER_SERVICE_BASE_URL}/api/orders/${payment.order}/confirm`,
                {},
                {
                    headers: {
                        Authorization: authToken,
                    },
                }
            );
            orderConfirmed = true;
          } catch (confirmError) {
            console.error('Order confirm failed after payment verification:', {
              status: confirmError.response?.status,
              data: confirmError.response?.data,
              message: confirmError.message,
            });
            orderConfirmError = confirmError.response?.data || confirmError.message;
          }
        }

        await publishToQueue(
            "PAYMENT_NOTIFICATION.PAYMENT_COMPLETED",
            {
                email: req.user.email,
                orderId: payment.order,
                paymentId: payment.paymentId,
                amount: payment.price.amount,
                currency: payment.price.currency,
                userName: req.user.username,
            }
        );

        return res.status(200).json({
            message: "Payment Verified Successfully",
            payment,
            orderConfirmed,
            orderConfirmError,
        });

    } catch (error) {
        console.log(error);

        await publishToQueue(
            "PAYMENT_NOTIFICATION.PAYMENT_FAILED",
            {
                email: req.user.email,
                orderId: razorpayOrderId,
                paymentId,
                reason: error.message,
            }
        );

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

module.exports = {
    createPayment,
    getPaymentByOrder,
    verifyPayment,
};