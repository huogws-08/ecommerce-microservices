
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

module.exports = { getCustomer, updateCustomer };
