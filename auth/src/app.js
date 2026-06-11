require("dotenv").config()
const express = require("express")
const cookieParser = require("cookie-parser")
const jwt=require("jsonwebtoken")

const app = express()
app.use(express.json())
app.use(cookieParser())

const authRouter = require("./routes/auth")
app.use('/api/auth', authRouter)

module.exports = app