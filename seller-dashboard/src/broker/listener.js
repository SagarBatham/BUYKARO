const { subscribeToQueue } = require("../broker/broker")
const productModel = require("../models/product.model")
const userModel = require("../models/user.model")
const orderModel=require("../models/order.model")
const paymentModel=require("../models/payment.model")

module.exports = async function () {
    await subscribeToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", async (user) => {
        await userModel.findOneAndUpdate(
            { $or: [{ username: user.username }, { email: user.email }] },
            {
                $set: {
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    addresses: user.addresses || []
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
    })

    await subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", async (product) => {
        await productModel.findOneAndUpdate(
            { _id: product._id },
            { $set: product },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
    })

    await subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", async (order) => {
        await orderModel.findOneAndUpdate(
            { _id: order._id },
            { $set: order },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
    })

    await subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED", async (payment) => {
        await paymentModel.findOneAndUpdate(
            { _id: payment._id ?? payment.razorpayOrderId ?? payment.order },
            { $set: payment },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
    })

    await subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATED", async (payment) => {
        await paymentModel.findOneAndUpdate(
            { order: payment.order },
            { $set: payment },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
    })
}