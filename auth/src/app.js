require("dotenv").config()
const express = require("express")
const cookieParser = require("cookie-parser")
const jwt=require("jsonwebtoken")

const app = express()
app.use(express.json({ limit: '10mb', strict: false }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204)
    }
    next()
})

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload', error: err.message })
    }
    next(err)
})

const authRouter = require("./routes/auth")
app.get("/",(req,res)=>{
    res.status(200).json({message:"Auth Service is Running."})
})
app.use('/api/auth', authRouter)

module.exports = app