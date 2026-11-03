
const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Shipment MongoDB connected successfully");
    } catch (error) {
        console.error(
            "Shipment MongoDB connection failed:",
            error.message
        );

        throw error;
    }
}

module.exports = { connectDB };
