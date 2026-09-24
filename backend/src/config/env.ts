import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: required("JWT_SECRET", "change-this-development-secret"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", "change-this-development-refresh-secret"),
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  refreshTokenExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS ?? 7),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV ?? "development"
};
