const mongoose = require("mongoose");

async function ConnectToDB() {
    try {
        const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;
        if (!mongoUrl) {
            throw new Error("MONGODB_URL or MONGO_URI is not set");
        }

        await mongoose.connect(mongoUrl);
        console.log("DB Connected Successfully");
    } catch (error) {
        console.log("DB Connection Error:", error)
    }
}

module.exports = ConnectToDB;