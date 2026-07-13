import dotenv from "dotenv";
import path from "path";

// Load standard .env (fallback)
dotenv.config();

// Determine current environment mode
const nodeEnv = process.env.NODE_ENV || "development";

// Load environment-specific file (.env.development or .env.production)
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${nodeEnv}`),
});

const splitCsv = (value, fallback = []) =>
  (value ? value.split(",") : fallback)
    .map((item) => item.trim())
    .filter(Boolean);

export const config = {
  port: process.env.PORT || 8002,
  mongodbUrl: process.env.MONGODB_URL,
  jwtSecret: process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || "fallback_secret",
  corsOrigins: splitCsv(process.env.CORS_ORIGINS, [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://ceylon-cargo-server.vercel.app",
    "https://www.ceyloncargo-int.com",
  ]),
};

export function requireEnv(value, name) {
  if (!value) {
    throw new Error(`${name} is missing in .env`);
  }
  return value;
}

