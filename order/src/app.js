require('dotenv').config()
const connectToDB=require("./db/db")
const express=require("express")
const cookieParser=require("cookie-parser")
const{connect}=require("./broker/broker")
const orderRoutes=require("./routes/order.routes")

connectToDB()
connect()
const app=express()
app.use(express.json())
app.use(cookieParser())
app.get("/",(req,res)=>{
    res.status(200).json({message:"Order Service is Running."})
})
app.use("/api/orders",orderRoutes)

module.exports=app