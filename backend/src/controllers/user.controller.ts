import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { paramId } from "../utils/params.js";

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }
  });
  if (!user) return res.status(404).json({ success: false, message: "Usuário não encontrado." });
  return res.json({ success: true, user });
}
