const { subscribeToQueue } = require("../broker/broker")
const productModel = require("../models/product.model")
const userModel = require("../models/user.model")
const orderModel=require("../models/order.model")
const paymentModel=require("../models/payment.model")

module.exports = async function () {
    await subscribeToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", async (user) => {
        await userModel.create(user)
    })

    await subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED",async (product) => {
        await productModel.create(product)
    })

    await subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED",async (order) => {
        await orderModel.create(order)
    })

    await subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED",async (payment) => {
        await paymentModel.create(payment)
    })

    await subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATED",async (payment) => {
        await paymentModel.findOneAndUpdate({order:payment.order})
    })
}