require("dotenv").config()
const express=require("express")
const cookieParser=require("cookie-parser")
const connectToDb=require("./db/db")
const cartRoutes=require("./routes/cart.route")

const app=express()
connectToDb()
app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  res.header('Access-Control-Allow-Origin', req.headers.origin || origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
})

app.use(express.json())
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.status(200).json({message:"Cart Service is Running."})
})

app.use("/api/cart",cartRoutes)

module.exports=app