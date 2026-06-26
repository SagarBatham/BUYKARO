require("dotenv").config()
const express = require("express")
const cookieParser = require("cookie-parser")
const jwt=require("jsonwebtoken")

const app = express()
app.use(express.json())
app.use(cookieParser())

const authRouter = require("./routes/auth")
app.get("/",(req,res)=>{
    res.status(200).json({message:"Auth Service is Running."})
})
app.use('/api/auth', authRouter)

module.exports = app