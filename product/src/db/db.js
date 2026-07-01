const mongoose = require("mongoose");

async function connectToDb() {
    console.log("MONGODB_URL exists:", !!process.env.MONGODB_URL);
    console.log(process.env.MONGODB_URL);
    
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB successfully");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

module.exports = connectToDb;