
const express = require("express");
const {
    createOrder,
    getOrders,
    getOrderById,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:oid", getOrderById);

module.exports = router;
