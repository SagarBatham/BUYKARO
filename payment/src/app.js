require("dotenv").config()
const express=require("express")
const cookieParser=require("cookie-parser")
const connectToDB=require("./db/db")
const paymentRoutes=require("./routes/payment.route")
const{connect}=require("./broker/broker")
const app=express()
connectToDB()
connect()
app.use(express.json())
app.use(cookieParser())
app.use("/api/payments",paymentRoutes)

module.exports=app