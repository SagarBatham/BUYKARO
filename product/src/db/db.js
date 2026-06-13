const mongoose = require("mongoose");

async function connectToDb() {
    // Skip connecting to real DB in test environment to avoid open handles
    if (process.env.NODE_ENV === 'test') {
        console.log('Skipping DB connect in test')
        return
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to DB successfully")
    } catch (error) {
        console.log("Error:", error)
        process.exit(1)
    }
}

module.exports = connectToDb;