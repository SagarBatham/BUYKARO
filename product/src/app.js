require("dotenv").config()
const express=require("express")
const cookieParse=require("cookie-parser")
const connectToDb=require("./db/db")
const productRoutes=require("./routes/product.routes")

const app=express()
connectToDb()
app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  res.header('Access-Control-Allow-Origin', req.headers.origin || origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
})
app.use(express.json())
app.use(cookieParse())
app.get("/",(req,res)=>{
    res.status(200).json({message:"Product Service is Running."})
})
app.use(["/api/products", "/api/products/"], productRoutes)

module.exports=app