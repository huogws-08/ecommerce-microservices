
require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const {
    startOutboxPublisher,
    stopOutboxPublisher,
} = require("./outbox/outboxPublisher");

const PORT = process.env.PORT || 3004;

async function startServer() {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(
            `Order REST API listening on port ${PORT}`
        );
    });

    try {
        await startOutboxPublisher();
    } catch (error) {
        console.error(
            "Cannot start Outbox Publisher:",
            error.message
        );
    }
}

async function shutdown() {
    console.log("Shutting down Order Service");

    await stopOutboxPublisher();

    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer().catch((error) => {
    console.error(
        "Failed to start Order Service:",
        error
    );

    process.exit(1);
});
