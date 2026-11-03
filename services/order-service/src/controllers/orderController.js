
const { pool } = require("../config/db");
const { getCustomer } = require("../grpc/customerClient");
const {
    getProduct,
    checkAndDecreaseStock,
} = require("../grpc/productClient");

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

async function createOrder(req, res) {
    const user = getAuthUser(req);

    if (!user) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    const { uid, items } = req.body;

    if (user.role !== "ADMIN" && Number(uid) !== user.uid) {
        return res.status(403).json({
            message: "Cannot create an order for another customer",
        });
    }

    if (
        !Number.isInteger(uid) ||
        uid <= 0 ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return res.status(400).json({
            message: "Invalid order data",
        });
    }

    const client = await pool.connect().catch(() => null);

    if (!client) {
        return res.status(500).json({
            message: "Database connection failed",
        });
    }

    try {
        // 1. Lấy khách hàng
        const customer = await getCustomer(uid);

        // 2. Lấy sản phẩm và tính tiền
        const details = [];
        let totalAmount = 0;

        for (const item of items) {
            if (
                typeof item.pid !== "string" ||
                !item.pid.trim() ||
                !Number.isInteger(item.quantity) ||
                item.quantity <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid product or quantity",
                });
            }

            const product = await getProduct(item.pid);

            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${item.pid}`,
                });
            }

            const subtotal = product.price * item.quantity;

            details.push({
                pid: item.pid,
                quantity: item.quantity,
                unit_price: product.price,
                subtotal,
            });

            totalAmount += subtotal;
        }

        // 3. Áp dụng giảm giá theo điểm khách hàng
        const discountRate = customer.score >= 100 ? 0.1 : 0;
        const discountAmount = totalAmount * discountRate;
        const finalAmount = totalAmount - discountAmount;

        // 4. Giảm tồn kho
        for (const item of details) {
            await checkAndDecreaseStock(item.pid, item.quantity);
        }

        // 5. Transaction PostgreSQL
        await client.query("BEGIN");

        const orderResult = await client.query(
            `INSERT INTO orders
        (uid, total_amount, discount_amount, final_amount, status)
       VALUES ($1, $2, $3, $4, 'CREATED')
       RETURNING *`,
            [uid, totalAmount, discountAmount, finalAmount]
        );

        const order = orderResult.rows[0];

        for (const item of details) {
            await client.query(
                `INSERT INTO order_details
          (oid, pid, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
                [
                    order.oid,
                    item.pid,
                    item.quantity,
                    item.unit_price,
                    item.subtotal,
                ]
            );
        }

        // 6. Transactional Outbox
        const eventPayload = {
            oid: order.oid,
            uid,
            total_amount: totalAmount,
            discount_amount: discountAmount,
            final_amount: finalAmount,
            items: details,
        };

        await client.query(
            `INSERT INTO outbox_events
        (aggregate_type, aggregate_id, event_type, payload)
       VALUES ($1, $2, $3, $4)`,
            [
                "ORDER",
                String(order.oid),
                "ORDER_CREATED",
                JSON.stringify(eventPayload),
            ]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            message: "Order created successfully",
            order,
            items: details,
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => { });

        console.error("Create order error:", error);

        return res.status(500).json({
            message: "Failed to create order",
            error: error.message,
        });
    } finally {
        client.release();
    }
}

async function getOrders(req, res) {
    const user = getAuthUser(req);

    if (!user) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    try {
        const result =
            user.role === "ADMIN"
                ? await pool.query(
                    "SELECT * FROM orders ORDER BY oid DESC"
                )
                : await pool.query(
                    "SELECT * FROM orders WHERE uid = $1 ORDER BY oid DESC",
                    [user.uid]
                );

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("getOrders error:", error);
        return res.status(500).json({
            message: "Failed to get orders",
        });
    }
}

async function getOrderById(req, res) {
    const user = getAuthUser(req);

    if (!user) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    const oid = Number(req.params.oid);

    if (!Number.isInteger(oid) || oid <= 0) {
        return res.status(400).json({
            message: "Invalid order ID",
        });
    }

    try {
        const orderResult = await pool.query(
            "SELECT * FROM orders WHERE oid = $1",
            [oid]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        const order = orderResult.rows[0];

        if (
            user.role !== "ADMIN" &&
            Number(order.uid) !== user.uid
        ) {
            return res.status(403).json({
                message: "Cannot access another customer's order",
            });
        }

        const detailsResult = await pool.query(
            "SELECT * FROM order_details WHERE oid = $1",
            [oid]
        );

        return res.status(200).json({
            ...order,
            items: detailsResult.rows,
        });
    } catch (error) {
        console.error("getOrderById error:", error);
        return res.status(500).json({
            message: "Failed to get order",
        });
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
};
