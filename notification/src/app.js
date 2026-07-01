require("dotenv").config()
const express=require("express")
const{connect,subscribeToQueue}=require("./broker/broker")
const setListeners=require("./broker/listener")
const app=express()
connect().then(()=>{
    setListeners()
})

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
    res.send("Notification Service is Up and Running")
})



module.exports=app