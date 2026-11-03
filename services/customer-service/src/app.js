
const express = require("express");
const customerRoutes = require("./routes/customerRoutes");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        service: "customer-service",
        status: "UP",
    });
});

app.use("/api/customers", customerRoutes);

module.exports = app;
