const mongoose=require("mongoose")

async function connectToDB() {
    
    try {
        mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to DB");
        
    } catch (error) {
        console.log(error.message);
        
    }
}

module.exports=connectToDB