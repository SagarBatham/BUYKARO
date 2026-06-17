const paymentModel = require("../model/payment.model");
const axios = require("axios");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPayment(req, res) {
    try {
        const orderId = req.params.orderId;

        const token =
            req.cookies?.token ||
            req.headers?.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: No Token Provided",
            });
        }

        const fetchOrder = (
            await axios.get(
                `http://localhost:3003/api/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
        ).data;

        const totalPrice = fetchOrder.Orders.totalPrice;

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

async function verifyPayment(req, res) {
    try {
        const {
            razorpayOrderId,
            paymentId,
            signature,
        } = req.body;

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

        return res.status(200).json({
            message: "Payment Verified Successfully",
            payment,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

module.exports = {
    createPayment,
    verifyPayment,
};