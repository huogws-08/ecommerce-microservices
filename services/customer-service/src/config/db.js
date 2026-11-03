
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      uid INTEGER PRIMARY KEY,
      full_name VARCHAR(100),
      phone VARCHAR(20),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS memberships (
      uid INTEGER PRIMARY KEY
        REFERENCES customers(uid) ON DELETE CASCADE,
      score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
      tier VARCHAR(20) NOT NULL DEFAULT 'BRONZE'
        CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND')),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

    console.log("Customer database initialized");
}

module.exports = { pool, initializeDatabase };
