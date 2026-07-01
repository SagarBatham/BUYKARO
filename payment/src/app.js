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

// Enable CORS
app.use((req, res, next) => {
    const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    res.header('Access-Control-Allow-Origin', req.headers.origin || origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});
app.get("/",(req,res)=>{
    res.status(200).json({message:"Payment Service is Running."})
})
app.use("/api/payments",paymentRoutes)

module.exports=app