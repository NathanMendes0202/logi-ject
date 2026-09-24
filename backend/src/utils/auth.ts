import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: "ADMIN" | "SUPERVISOR" | "OPERATOR";
  type: "access";
};

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "type">) {
  return jwt.sign({ ...payload, type: "access" }, env.jwtSecret, {
    expiresIn: env.accessTokenExpiresIn as jwt.SignOptions["expiresIn"]
  });
}

export function signRefreshToken(userId: string) {
  return jwt.sign(
    { sub: userId, type: "refresh", jti: crypto.randomUUID() },
    env.jwtRefreshSecret,
    { expiresIn: `${env.refreshTokenExpiresInDays}d` as jwt.SignOptions["expiresIn"] }
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string; type: "refresh"; jti: string };
}