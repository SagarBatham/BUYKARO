const mongoose=require("mongoose")

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB is Connected");
    } catch (error) {
        console.log("Error ",error.message);
    }
}

module.exports=connectToDB