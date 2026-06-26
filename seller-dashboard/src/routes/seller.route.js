const express = require("express")
const middlewares = require("../middleware/auth.middleware")
const { getMetrics , getOrders , getProducts} = require("../controllers/seller.controller")
const router = express.Router()

router.get("/metrics", middlewares.createAuthMiddleware(["seller"]), getMetrics)

router.get("/orders", middlewares.createAuthMiddleware(["seller"]), getOrders)

router.get("/products", middlewares.createAuthMiddleware(["seller"]), getProducts)

module.exports = router