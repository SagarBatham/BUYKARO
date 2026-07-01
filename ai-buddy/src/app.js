require('dotenv').config()
const cookieParser=require("cookie-parser")
const express=require("express")


const app=express()
app.use(cookieParser())

// Enable CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  const allowAnyOrigin = envOrigins.length === 0;
  const allowedOrigin = allowAnyOrigin ? origin || 'http://localhost:3000' : envOrigins[0];
  const responseOrigin = allowAnyOrigin
    ? origin || allowedOrigin
    : envOrigins.includes(origin)
    ? origin
    : allowedOrigin;

  res.header('Access-Control-Allow-Origin', responseOrigin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get("/",(req,res)=>{
    res.status(200).json({message:"AI_BUDDY Service is Running."})
})
module.exports=app