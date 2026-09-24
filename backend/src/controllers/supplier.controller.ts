import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { listQuerySchema, supplierCreateSchema, supplierUpdateSchema } from "../schemas/catalog.schemas.js";
import { listSuppliers } from "../services/catalog.service.js";
import { paramId } from "../utils/params.js";

export async function index(req: AuthRequest, res: Response) {
  const q = listQuerySchema.parse(req.query);
  const result = await listSuppliers(q.page, q.limit, q.search, q.active === undefined ? undefined : q.active === "true");
  return res.json({ success: true, ...result });
}

export async function show(req: AuthRequest, res: Response) {
  const item = await prisma.category.findUnique({ where: { id: paramId(req.params.id) }, include: { _count: { select: { products: true } } } });
  if (!item) return res.status(404).json({ success: false, message: "Categoria não encontrada." });
  return res.json({ success: true, item });
}

export async function create(req: AuthRequest, res: Response) {
  const data = supplierCreateSchema.parse(req.body);
  const item = await prisma.supplier.create({ data });
  return res.status(201).json({ success: true, item });
}

export async function update(req: AuthRequest, res: Response) {
  const data = supplierUpdateSchema.parse(req.body);
  const item = await prisma.category.update({ where: { id: paramId(req.params.id) }, data });
  return res.json({ success: true, item });
}

export async function remove(req: AuthRequest, res: Response) {
  const item = await prisma.category.update({ where: { id: paramId(req.params.id) }, data: { active: false } });
  return res.json({ success: true, item, message: "Categoria desativada." });
}
