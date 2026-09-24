import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { comparePassword, hashPassword, hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/auth.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(["ADMIN", "SUPERVISOR", "OPERATOR"]).default("OPERATOR")
});

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax" as const,
    maxAge: env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
    path: "/api/auth"
  };
}

async function issueSession(user: { id: string; name: string; email: string; role: "ADMIN" | "SUPERVISOR" | "OPERATOR" }, res: Response) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000)
    }
  });
  res.cookie("refreshToken", refreshToken, refreshCookieOptions());
  return { accessToken, user };
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "E-mail ou senha inválidos." });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !user.active || !(await comparePassword(parsed.data.password, user.password))) {
    return res.status(401).json({ success: false, message: "E-mail ou senha inválidos." });
  }

  const session = await issueSession({ id: user.id, name: user.name, email: user.email, role: user.role }, res);
  return res.json({ success: true, ...session });
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Dados de cadastro inválidos.", errors: parsed.error.flatten() });

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ success: false, message: "E-mail já cadastrado." });

  const user = await prisma.user.create({
    data: { name: parsed.data.name, email, password: await hashPassword(parsed.data.password), role: parsed.data.role }
  });

  return res.status(201).json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "Refresh token não informado." });

  try {
    const payload = verifyRefreshToken(token);
    if (payload.type !== "refresh") throw new Error("Invalid token type");
    const stored = await prisma.refreshToken.findFirst({ where: { tokenHash: hashToken(token), userId: payload.sub, revokedAt: null } });
    if (!stored || stored.expiresAt < new Date()) return res.status(401).json({ success: false, message: "Sessão expirada." });

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.active) return res.status(401).json({ success: false, message: "Usuário inválido." });

    const session = await issueSession({ id: user.id, name: user.name, email: user.email, role: user.role }, res);
    return res.json({ success: true, ...session });
  } catch {
    return res.status(401).json({ success: false, message: "Refresh token inválido ou expirado." });
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (token) await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
  res.clearCookie("refreshToken", { path: "/api/auth" });
  return res.json({ success: true, message: "Logout realizado com sucesso." });
}
