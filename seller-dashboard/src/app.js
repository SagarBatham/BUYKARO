const express=require("express")
const cookieParser=require("cookie-parser")
const connectToDB=require("./db/db")
const listener=require("./broker/listener")
const{connect}=require("./broker/broker")
const sellerRoutes=require("./routes/seller.route")
const app=express()
connectToDB()

connect().then(()=>{
    listener()
})
app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.status(200).json({message:"Seller Dashboard Service is Running."})
})

app.use("/api/seller/dashboard",sellerRoutes)



module.exports=app