
const express = require("express");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        service: "product-service",
        status: "UP",
    });
});

app.use("/api/products", productRoutes);

module.exports = app;
