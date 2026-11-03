
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const startGrpcServer = require("./grpc/productServer");

const PORT = process.env.PORT || 3003;

async function startServer() {
    await connectDB();

    await startGrpcServer();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Product REST API listening on port ${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("Failed to start Product Service:", error);
    process.exit(1);
});
