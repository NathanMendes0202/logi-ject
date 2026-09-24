import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { locationCreateSchema, locationUpdateSchema } from "../schemas/logistics.schemas.js";
import { paramId } from "../utils/params.js";


export async function index(req: AuthRequest, res: Response) {
  const warehouseId = typeof req.query.warehouseId === "string" ? req.query.warehouseId : undefined;
  const items = await prisma.location.findMany({
    where: { active: true, ...(warehouseId ? { warehouseId } : {}) },
    include: { warehouse: true, _count: { select: { stocks: true } } },
    orderBy: [{ warehouseId: "asc" }, { code: "asc" }]
  });
  return res.json({ success: true, items });
}

export async function show(req: AuthRequest, res: Response) {
  const item = await prisma.location.findUnique({ where: { id: paramId(req.params.id) }, include: { warehouse: true, _count: { select: { stocks: true } } } });
  if (!item) return res.status(404).json({ success: false, message: "Localização não encontrada." });
  return res.json({ success: true, item });
}

export async function create(req: AuthRequest, res: Response) {
  const data = locationCreateSchema.parse(req.body);
  const warehouseId = paramId(req.params.warehouseId);
  const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
  if (!warehouse || !warehouse.active) return res.status(400).json({ success: false, message: "Armazém inválido ou inativo." });
  const item = await prisma.location.create({ data: { ...data, warehouseId } });
  return res.status(201).json({ success: true, item });
}

export async function update(req: AuthRequest, res: Response) {
  const data = locationUpdateSchema.parse(req.body);
  const item = await prisma.location.update({ where: { id: paramId(req.params.id) }, data });
  return res.json({ success: true, item });
}

export async function remove(req: AuthRequest, res: Response) {
  const item = await prisma.location.update({ where: { id: paramId(req.params.id) }, data: { active: false } });
  return res.json({ success: true, item, message: "Localização desativada." });
}
