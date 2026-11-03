
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function connectDB() {
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT NOW()");
        console.log(
            "Order PostgreSQL connected successfully"
        );
        return result.rows[0];
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    connectDB,
};
