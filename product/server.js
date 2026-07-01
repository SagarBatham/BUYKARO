const app=require('./src/app')
const{connect}=require("./src/broker/broker")
const connectToDb=require("./src/db/db")
connect()
connectToDb()
app.listen(3001,()=>{
    console.log("Server running on Port 3001");
    
})