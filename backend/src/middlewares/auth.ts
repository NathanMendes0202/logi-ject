import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/auth.js";

export type AuthRequest = Request & {
  user?: { id: string; email: string; role: "ADMIN" | "SUPERVISOR" | "OPERATOR" };
};

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token de acesso não informado." });
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    if (payload.type !== "access") throw new Error("Invalid token type");
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Token inválido ou expirado." });
  }
}

export function authorize(...roles: NonNullable<AuthRequest["user"]>["role"][]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Você não possui permissão para esta ação." });
    }
    return next();
  };
} 
