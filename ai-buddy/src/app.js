require('dotenv').config()
const cookieParser=require("cookie-parser")
const express=require("express")


const app=express()
app.get("/",(req,res)=>{
    res.status(200).json({message:"AI_BUDDY Service is Running."})
})
app.use(cookieParser())
module.exports=app