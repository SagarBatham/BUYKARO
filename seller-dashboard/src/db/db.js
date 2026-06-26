const mongoose=require("mongoose")

async function connectToDB() {
    try {
        mongoose.connect(process.env.MONGODB_URL)
        console.log("MONGODB is connected");
    } catch (error) {
        console.log(error.message);
    }
}

module.exports=connectToDB