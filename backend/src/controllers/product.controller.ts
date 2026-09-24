import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { listQuerySchema, productCreateSchema, productUpdateSchema } from "../schemas/catalog.schemas.js";
import { listProducts } from "../services/catalog.service.js";
import { paramId } from "../utils/params.js";

export async function index(req: AuthRequest, res: Response) {
  const q = listQuerySchema.parse(req.query);
  const result = await listProducts(q);
  return res.json({ success: true, ...result });
}

export async function show(req: AuthRequest, res: Response) {
  const item = await prisma.category.findUnique({ where: { id: paramId(req.params.id) }, include: { _count: { select: { products: true } } } });
  if (!item) return res.status(404).json({ success: false, message: "Categoria não encontrada." });
  return res.json({ success: true, item });
}

export async function create(req: AuthRequest, res: Response) {
  const data = productCreateSchema.parse(req.body);
  const [category, supplier] = await Promise.all([
    prisma.category.findUnique({ where: { id: data.categoryId } }),
    data.supplierId ? prisma.supplier.findUnique({ where: { id: data.supplierId } }) : null
  ]);
  if (!category || !category.active) return res.status(400).json({ success: false, message: "Categoria inválida ou inativa." });
  if (data.supplierId && (!supplier || !supplier.active)) return res.status(400).json({ success: false, message: "Fornecedor inválido ou inativo." });
  const item = await prisma.product.create({ data });
  return res.status(201).json({ success: true, item });
}

export async function update(req: AuthRequest, res: Response) {
  const data = productUpdateSchema.parse(req.body);
  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category || !category.active) return res.status(400).json({ success: false, message: "Categoria inválida ou inativa." });
  }
  if (data.supplierId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
    if (!supplier || !supplier.active) return res.status(400).json({ success: false, message: "Fornecedor inválido ou inativo." });
  }
  const item = await prisma.product.update({ where: { id: paramId(req.params.id) }, data });
  return res.json({ success: true, item });
}

export async function remove(req: AuthRequest, res: Response) {
  const item = await prisma.product.update({ where: { id: paramId(req.params.id) }, data: { status: "INACTIVE" } });
  return res.json({ success: true, item, message: "Produto desativado." });
}

