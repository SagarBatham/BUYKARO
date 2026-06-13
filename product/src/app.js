require("dotenv").config()
const express=require("express")
const cookieParse=require("cookie-parser")
const connectToDb=require("./db/db")
const productRoutes=require("./routes/product.routes")

const app=express()
connectToDb()
app.use(express.json())
app.use(cookieParse())
app.use("/api/products",productRoutes)

module.exports=app