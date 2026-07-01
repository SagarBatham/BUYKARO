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
    res.status(200).json({message:"Seller Dashboard Service is Running."})
})

app.use("/api/seller/dashboard",sellerRoutes)



module.exports=app