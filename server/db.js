const { Pool } = require("pg");

let pool;

function createPool() {
  // important: use DATABASE_URL to avoid hardcoding credentials.
  // note: SSL is optional and can be toggled via env.
  // nota bene: hosted Postgres often requires SSL.
  const connectionString = process.env.DATABASE_URL;
  const useSsl = process.env.DATABASE_SSL === "true";

  return new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
}

async function initDb() {
  if (pool) {
    return pool;
  }

  pool = createPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unverified',
      verify_token TEXT,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users (email);
  `);

  return pool;
}

function getDb() {
  if (!pool) {
    throw new Error("Database not initialized");
  }

  return {
    query: (text, params) => pool.query(text, params),
    get: async (text, ...params) => {
      const result = await pool.query(text, params);
      return result.rows[0] || null;
    },
    all: async (text, ...params) => {
      const result = await pool.query(text, params);
      return result.rows;
    },
    run: (text, ...params) => pool.query(text, params),
  };
}

module.exports = { initDb, getDb };
