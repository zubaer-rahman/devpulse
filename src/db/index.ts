import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connectionString,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
});

export const initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(25) NOT NULL,
        email VARCHAR(30) UNIQUE NOT NULL
        CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        ),
        password TEXT NOT NULL,
        role VARCHAR(15) DEFAULT 'contributor'
        CHECK (role IN ('contributor', 'maintainer')),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL
        CHECK (char_length(description) >= 20),
        type VARCHAR(20) NOT NULL
        CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(20) DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INT REFERENCES users(id) ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )`);
    console.log(`Database connected successfully!`);
  } catch (error: any) {
    console.log(error ?? "");
  }
};
