
const Shipment = require("../models/Shipment");

// Lấy thông tin user đã được Gateway xác thực
function getAuthUser(req) {
    const uid = Number(req.headers["x-user-id"]);
    const role = req.headers["x-user-role"];

    if (!Number.isInteger(uid) || uid <= 0) {
        return null;
    }

    if (!["ADMIN", "CUSTOMER"].includes(role)) {
        return null;
    }

    return { uid, role };
}

// GET /api/shipments
async function getShipments(req, res) {
    const user = getAuthUser(req);

    if (!user) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    try {
        // ADMIN xem tất cả, CUSTOMER chỉ xem shipment của mình
        const filter =
            user.role === "ADMIN"
                ? {}
                : { uid: user.uid };

        const shipments = await Shipment.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json(shipments);
    } catch (error) {
        console.error("Get shipments error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

// GET /api/shipments/:shipid
async function getShipmentById(req, res) {
    const user = getAuthUser(req);

    if (!user) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    try {
        const { shipid } = req.params;

        const shipment = await Shipment.findOne({
            shipid,
        }).lean();

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found",
            });
        }

        // CUSTOMER không được xem shipment của người khác
        if (
            user.role !== "ADMIN" &&
            Number(shipment.uid) !== user.uid
        ) {
            return res.status(403).json({
                message: "Cannot access another customer's shipment",
            });
        }

        return res.status(200).json(shipment);
    } catch (error) {
        console.error("Get shipment error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}


// PATCH /api/shipments/:shipid/status
async function updateShipmentStatus(req, res) {
    const user = getAuthUser(req);

    if (!user) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    // Chỉ ADMIN được cập nhật trạng thái
    if (user.role !== "ADMIN") {
        return res.status(403).json({
            message: "Only ADMIN can update shipment status",
        });
    }

    try {
        const { shipid } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "PENDING",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid shipment status",
                allowedStatuses,
            });
        }

        const shipment = await Shipment.findOneAndUpdate(
            { shipid },
            { $set: { status } },
            { new: true, runValidators: true }
        ).lean();

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found",
            });
        }

        return res.status(200).json({
            message: "Shipment status updated successfully",
            shipment,
        });
    } catch (error) {
        console.error("Update shipment status error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

module.exports = {
    getShipments,
    getShipmentById,
    updateShipmentStatus,
};
