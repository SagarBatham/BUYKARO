const mongoose = require("mongoose");

async function ConnectToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("DB Connected Successfully");
    } catch (error) {
        console.log("DB Connection Error:", error)
    }
}

module.exports = ConnectToDB;