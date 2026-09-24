import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { reportQuerySchema } from "../schemas/inventory.schemas.js";
import { paramId } from "../utils/params.js";

export async function dashboard(req: AuthRequest, res: Response) {
  const [products, stocks, movementsToday, lowStock] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.stock.findMany({ include: { product: true } }),
    prisma.stockMovement.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
    prisma.stock.findMany({ where: { quantity: { gt: 0 } }, include: { product: true } })
  ]);
  const lowStockCount = lowStock.filter(s => Number(s.quantity) <= Number(s.product.minimumStock)).length;
  const totalUnits = stocks.reduce((a, s) => a + Number(s.quantity), 0);
  const totalValue = stocks.reduce((a, s) => a + Number(s.quantity) * Number(s.product.costPrice), 0);
  res.json({ success: true, metrics: { products, totalUnits, totalValue, movementsToday, lowStock: lowStockCount } });
}

export async function movements(req: AuthRequest, res: Response) {
  const q = reportQuerySchema.parse(req.query);
  const where: any = {};
  if (q.warehouseId) where.warehouseId = q.warehouseId;
  if (q.productId) where.productId = q.productId;
  if (q.type) where.type = q.type;
  if (q.from || q.to) where.createdAt = { ...(q.from ? { gte: new Date(q.from) } : {}), ...(q.to ? { lte: new Date(q.to) } : {}) };
  const rows = await prisma.stockMovement.findMany({ where, include: { product: { select: { sku: true, name: true } }, warehouse: { select: { code: true, name: true } }, user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 1000 });
  res.json({ success: true, items: rows });
}

export async function stock(req: AuthRequest, res: Response) {
  const rows = await prisma.stock.findMany({ include: { product: { include: { category: true } }, warehouse: true, location: true }, orderBy: { updatedAt: "desc" }, take: 2000 });
  const items = rows.map(s => ({ ...s, available: Number(s.quantity) - Number(s.reserved), value: Number(s.quantity) * Number(s.product.costPrice), lowStock: Number(s.quantity) <= Number(s.product.minimumStock) }));
  res.json({ success: true, items });
}
