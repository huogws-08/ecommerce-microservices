
const express = require("express");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        service: "order-service",
        status: "UP",
    });
});

app.use("/api/orders", orderRoutes);

module.exports = app;
