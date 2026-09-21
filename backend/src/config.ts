import dotenv from "dotenv";

dotenv.config();

const DEFAULT_SECRET = "change-me-in-production";
const jwtSecret = process.env.JWT_SECRET ?? DEFAULT_SECRET;
if (process.env.NODE_ENV === "production" && (jwtSecret === DEFAULT_SECRET || jwtSecret.length < 32)) {
  throw new Error("JWT_SECRET must be set to a random value of at least 32 characters when NODE_ENV=production");
}

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "postgres://healthos:healthos@localhost:5432/healthos",
  jwtSecret,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  loginRateLimit: Number(process.env.LOGIN_RATE_LIMIT ?? 10)
};
