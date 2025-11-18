require('dotenv').config();
const { Pool } = require('pg');

// Usa variáveis de ambiente para permitir configuração local e via Docker
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'promessas_db',
  password: process.env.POSTGRES_PASSWORD || 'your_password',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
