const mongoose=require("mongoose")

async function connectToDB() {
    const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;
    if (!mongoUrl) {
        console.error('Error: Missing MongoDB connection string. Set MONGODB_URL or MONGO_URI.')
        process.exit(1)
    }

    try {
        await mongoose.connect(mongoUrl)
        console.log('Connected to MongoDB successfully')
    } catch (error) {
        console.error('MongoDB connection error:', error)
        process.exit(1)
    }
}

module.exports=connectToDB