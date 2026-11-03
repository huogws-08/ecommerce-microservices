
require("dotenv").config();

const app = require("./app");
const mongoose = require("mongoose");
const { connectDB } = require("./config/db");

const {
    startOrderConsumer,
    stopOrderConsumer,
} = require("./kafka/orderConsumer");

const PORT = process.env.PORT || 3005;

let server;

async function startServer() {
    await connectDB();

    await ShipmentIndexes();

    await startOrderConsumer();

    server = app.listen(PORT, "0.0.0.0", () => {
        console.log(
            `Shipment REST API listening on port ${PORT}`
        );
    });
}

async function ShipmentIndexes() {
    const Shipment = require("./models/Shipment");
    await Shipment.init();
}

async function shutdown() {
    console.log("Shutting down Shipment Service");

    await stopOrderConsumer();

    if (server) {
        await new Promise((resolve) => {
            server.close(resolve);
        });
    }

    await mongoose.disconnect();

    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer().catch((error) => {
    console.error(
        "Failed to start Shipment Service:",
        error
    );

    process.exit(1);
});
