import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

if (!process.env.DATABASE_URL) {
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = encodeURIComponent(process.env.POSTGRES_PASSWORD || 'your_password');
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = process.env.POSTGRES_PORT || '5432';
  const database = process.env.POSTGRES_DB || 'promessas_db';
  process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

const prisma = new PrismaClient();

export default prisma;
