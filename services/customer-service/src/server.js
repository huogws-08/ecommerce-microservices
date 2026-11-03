
require("dotenv").config();

const app = require("./app");
const { initializeDatabase } = require("./config/db");
const { startGrpcServer } = require("./grpc/customerServer");

const PORT = process.env.PORT || 3002;

async function startServer() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`Customer REST API listening on port ${PORT}`);
        });

        startGrpcServer();
    } catch (error) {
        console.error("Failed to start Customer Service:", error);
        process.exit(1);
    }
}

startServer();
