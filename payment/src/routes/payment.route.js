const express=require("express")
const validator=require("../middleware/auth.middleware")
const controllers=require("../controllers/payment.controller")

const router=express.Router()

router.post("/create/:orderId",validator.createAuthMiddleware(["user","seller"]),controllers.createPayment)
router.post("/razorpay/order",validator.createAuthMiddleware(["user","seller"]),controllers.createPayment)

router.post("/verify",validator.createAuthMiddleware(["user","seller"]),controllers.verifyPayment)
router.post("/razorpay/verify",validator.createAuthMiddleware(["user","seller"]),controllers.verifyPayment)
router.get("/order/:orderId",validator.createAuthMiddleware(["user","seller"]),controllers.getPaymentByOrder)

module.exports=router