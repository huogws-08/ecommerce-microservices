
const express = require("express");
const {
    register,
    login
} = require("../controllers/authController");

const router = express.Router();

router.get("/health", (req, res) => {
    res.status(200).json({
        service: "auth-service",
        status: "UP"
    });
});

router.post("/register", register);
router.post("/login", login);

module.exports = router;
