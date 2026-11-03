
const { pool } = require("../config/db");

async function getCustomer(req, res) {
    const uid = Number(req.params.uid);

    if (!Number.isInteger(uid) || uid <= 0) {
        return res.status(400).json({ message: "Invalid customer ID" });
    }

    try {
        const result = await pool.query(
            `SELECT c.uid, c.full_name, c.phone, c.address,
                    COALESCE(m.score, 0) AS score,
                    COALESCE(m.tier, 'BRONZE') AS tier
             FROM customers c
             LEFT JOIN memberships m ON c.uid = m.uid
             WHERE c.uid = $1`,
            [uid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("getCustomer error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function updateCustomer(req, res) {
    const uid = Number(req.params.uid);
    const { full_name, phone, address } = req.body;

    if (!Number.isInteger(uid) || uid <= 0) {
        return res.status(400).json({ message: "Invalid customer ID" });
    }

    if (
        typeof full_name !== "string" ||
        !full_name.trim() ||
        typeof phone !== "string" ||
        typeof address !== "string"
    ) {
        return res.status(400).json({
            message: "full_name, phone and address are required",
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `INSERT INTO customers (uid, full_name, phone, address)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (uid)
             DO UPDATE SET
                full_name = EXCLUDED.full_name,
                phone = EXCLUDED.phone,
                address = EXCLUDED.address`,
            [uid, full_name.trim(), phone.trim(), address.trim()]
        );

        await client.query(
            `INSERT INTO memberships (uid)
             VALUES ($1)
             ON CONFLICT (uid) DO NOTHING`,
            [uid]
        );

        await client.query("COMMIT");

        const result = await client.query(
            `SELECT c.uid, c.full_name, c.phone, c.address,
                    m.score, m.tier
             FROM customers c
             JOIN memberships m ON c.uid = m.uid
             WHERE c.uid = $1`,
            [uid]
        );

        return res.status(200).json({
            message: "Customer updated successfully",
            customer: result.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("updateCustomer error:", error);
        return res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
    }
}

// CUSTOMER xem điểm và hạng thành viên của mình.
// ADMIN có thể xem thông tin của mọi khách hàng.
async function getMembership(req, res) {
    const uid = Number(req.params.uid);

    if (!Number.isInteger(uid) || uid <= 0) {
        return res.status(400).json({ message: "Invalid customer ID" });
    }

    try {
        const result = await pool.query(
            `SELECT c.uid, c.full_name, m.score, m.tier, m.updated_at
             FROM customers c
             JOIN memberships m ON c.uid = m.uid
             WHERE c.uid = $1`,
            [uid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Customer or membership not found",
            });
        }

        return res.status(200).json({
            message: "Membership retrieved successfully",
            membership: result.rows[0],
        });
    } catch (error) {
        console.error("getMembership error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ADMIN cập nhật điểm và/hoặc hạng thành viên.
async function updateMembership(req, res) {
    const uid = Number(req.params.uid);
    const { score, tier } = req.body;

    if (!Number.isInteger(uid) || uid <= 0) {
        return res.status(400).json({ message: "Invalid customer ID" });
    }

    const hasScore = Object.prototype.hasOwnProperty.call(req.body, "score");
    const hasTier = Object.prototype.hasOwnProperty.call(req.body, "tier");

    if (!hasScore && !hasTier) {
        return res.status(400).json({
            message: "Provide score or tier to update",
        });
    }

    if (
        hasScore &&
        (!Number.isInteger(score) || score < 0)
    ) {
        return res.status(400).json({
            message: "score must be a non-negative integer",
        });
    }

    const allowedTiers = ["BRONZE", "SILVER", "GOLD", "DIAMOND"];

    if (hasTier && !allowedTiers.includes(tier)) {
        return res.status(400).json({
            message: "tier must be BRONZE, SILVER, GOLD or DIAMOND",
        });
    }

    try {
        const result = await pool.query(
            `UPDATE memberships
             SET score = COALESCE($1, score),
                 tier = COALESCE($2, tier),
                 updated_at = CURRENT_TIMESTAMP
             WHERE uid = $3
             RETURNING uid, score, tier, updated_at`,
            [
                hasScore ? score : null,
                hasTier ? tier : null,
                uid,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Membership not found. Update customer information first.",
            });
        }

        return res.status(200).json({
            message: "Membership updated successfully",
            membership: result.rows[0],
        });
    } catch (error) {
        console.error("updateMembership error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getCustomer,
    updateCustomer,
    getMembership,
    updateMembership,
};
