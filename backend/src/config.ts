import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "postgres://healthos:healthos@localhost:5432/healthos",
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000"
};

