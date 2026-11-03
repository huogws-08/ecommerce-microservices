const express = require("express");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        service: "auth-service",
        status: "UP"
    });
});

// Auth Routes
app.use("/api/auth", authRoutes);

module.exports = app;