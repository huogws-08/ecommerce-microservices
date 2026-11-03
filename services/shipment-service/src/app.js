
const express = require("express");

const shipmentRoutes = require("./routes/shipmentRoutes");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        service: "shipment-service",
        status: "UP",
    });
});

app.use("/api/shipments", shipmentRoutes);

module.exports = app;
