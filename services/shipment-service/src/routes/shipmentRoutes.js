
const express = require("express");

const {
    getShipments,
    getShipmentById,
    updateShipmentStatus,
} = require("../controllers/shipmentController");

const router = express.Router();

router.get("/", getShipments);

router.patch("/:shipid/status", updateShipmentStatus);

router.get("/:shipid", getShipmentById);

module.exports = router;
