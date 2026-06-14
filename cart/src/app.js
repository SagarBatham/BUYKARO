require("dotenv").config()
const express=require("express")
const cookieParser=require("cookie-parser")
const connectToDb=require("./db/db")
const cartRoutes=require("./routes/cart.route")

const app=express()
connectToDb()
app.use(express.json())
app.use(cookieParser())

app.use("/api/cart",cartRoutes)

module.exports=app