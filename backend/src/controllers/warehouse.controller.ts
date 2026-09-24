import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { warehouseCreateSchema, warehouseUpdateSchema } from "../schemas/logistics.schemas.js";
import { paramId } from "../utils/params.js";

export async function index(_req: AuthRequest, res: Response) {
  const items = await prisma.warehouse.findMany({
    where: { active: true },
    include: { _count: { select: { locations: true, stocks: true } } },
    orderBy: { name: "asc" }
  });
  return res.json({ success: true, items });
}

export async function show(req: AuthRequest, res: Response) {
  const item = await prisma.category.findUnique({ where: { id: paramId(req.params.id) }, include: { _count: { select: { products: true } } } });
  if (!item) return res.status(404).json({ success: false, message: "Categoria não encontrada." });
  return res.json({ success: true, item });
}

export async function create(req: AuthRequest, res: Response) {
  const data = warehouseCreateSchema.parse(req.body);
  const item = await prisma.warehouse.create({ data });
  return res.status(201).json({ success: true, item });
}

export async function update(req: AuthRequest, res: Response) {
  const data = warehouseUpdateSchema.parse(req.body);
  const item = await prisma.category.update({ where: { id: paramId(req.params.id) }, data });
  return res.json({ success: true, item });
}

export async function remove(req: AuthRequest, res: Response) {
  const item = await prisma.category.update({ where: { id: paramId(req.params.id) }, data: { active: false } });
  return res.json({ success: true, item, message: "Categoria desativada." });
}