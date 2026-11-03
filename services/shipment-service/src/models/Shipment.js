
const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
    {
        shipid: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        oid: {
            type: Number,
            required: true,
            unique: true,
        },

        uid: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
            ],
            default: "PENDING",
        },

        created_from_event_id: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Shipment",
    shipmentSchema
);
