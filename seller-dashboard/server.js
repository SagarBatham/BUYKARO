require("dotenv").config()
const app=require("./src/app")

app.listen(3007,()=>{
    console.log("Seller Server running on Port 3007");
})