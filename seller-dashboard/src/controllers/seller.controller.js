const mongoose = require("mongoose")
const productModel = require("../models/product.model")
const orderModel = require("../models/order.model")

async function getOrders(req, res) {
    try {
        const sellerId = req.user?.id || req.user?._id || req.user

        if (!sellerId) {
            return res.status(400).json({ message: "Seller information missing" })
        }

        const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
            ? new mongoose.Types.ObjectId(sellerId)
            : sellerId

        const products = await productModel.find({ seller: sellerObjectId }).select("_id title")
        const productIds = products.map((product) => product._id)

        if (!productIds.length) {
            return res.status(200).json({ orders: [] })
        }

        const orders = await orderModel.find({
            "items.product": { $in: productIds }
        })
            .populate("user", "fullName email")
            .sort({ createdAt: -1 })
            .lean()

        const formattedOrders = orders.map((order) => ({
            _id: order._id,
            customer: order.user?.fullName || order.user?.email || "Unknown Customer",
            status: order.status,
            totalAmount: order.totalPrice?.amount || 0,
            currency: order.totalPrice?.currency || "INR",
            createdAt: order.createdAt,
            items: (order.items || []).filter((item) =>
                productIds.some((id) => id.toString() === item.product?.toString())
            )
        }))

        return res.status(200).json({ orders: formattedOrders })
    } catch (error) {
        console.log("Error fetching Orders", error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

async function getProducts(req, res) {
    try {
        const sellerId = req.user?.id || req.user?._id || req.user

        if (!sellerId) {
            return res.status(400).json({ message: "Seller information missing" })
        }

        const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
            ? new mongoose.Types.ObjectId(sellerId)
            : sellerId

        const products = await productModel.find({ seller: sellerObjectId })
            .sort({ createdAt: -1 })
            .lean()

        return res.status(200).json({ products })
    } catch (error) {
        console.log("Error fetching Products", error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

async function getMetrics(req, res) {
    try {
        const sellerId = req.user?.id || req.user?._id || req.user

        if (!sellerId) {
            return res.status(400).json({ message: "Seller information missing" })
        }

        const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerId)
            ? new mongoose.Types.ObjectId(sellerId)
            : sellerId

        const products = await productModel.find({ seller: sellerObjectId }).select("_id title")
        const productIds = products.map((product) => product._id)

        if (!productIds.length) {
            return res.status(200).json({ sales: 0, revenue: 0, topProducts: [] })
        }

        const orders = await orderModel.find({
            status: { $in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
            "items.product": { $in: productIds }
        }).lean()

        let revenue = 0
        const productStats = new Map()

        for (const order of orders) {
            revenue += Number(order.totalPrice?.amount || 0)

            for (const item of order.items || []) {
                const itemProductId = item.product?.toString()
                if (!itemProductId || !productIds.some((id) => id.toString() === itemProductId)) {
                    continue
                }

                const product = products.find((entry) => entry._id.toString() === itemProductId)
                const current = productStats.get(itemProductId) || {
                    title: product?.title || "Unknown Product",
                    unitsSold: 0,
                    revenue: 0
                }

                current.unitsSold += Number(item.quantity || 1)
                current.revenue += Number(item.price?.amount || 0) * Number(item.quantity || 1)
                productStats.set(itemProductId, current)
            }
        }

        const topProducts = Array.from(productStats.values())
            .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
            .slice(0, 5)

        return res.status(200).json({
            sales: orders.length,
            revenue,
            topProducts
        })
    } catch (error) {
        console.log("Error fetching Metrics", error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

module.exports = {
    getMetrics,
    getOrders,
    getProducts
}