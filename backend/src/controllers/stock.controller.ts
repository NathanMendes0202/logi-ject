import { Response } from "express";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { stockListSchema } from "../schemas/logistics.schemas.js";
import { paramId } from "../utils/params.js";

export async function index(req: AuthRequest, res: Response) {
  const q = stockListSchema.parse(req.query);
  const where: Prisma.StockWhereInput = {
    ...(q.productId ? { productId: q.productId } : {}),
    ...(q.warehouseId ? { warehouseId: q.warehouseId } : {}),
    ...(q.locationId ? { locationId: q.locationId } : {})
  };
  const items = await prisma.stock.findMany({
    where,
    include: { product: { include: { category: true } }, warehouse: true, location: true },
    orderBy: { updatedAt: "desc" },
    skip: (q.page - 1) * q.limit,
    take: q.limit
  });
  const filtered = q.lowStock ? items.filter(s => Number(s.quantity) - Number(s.reserved) <= Number(s.product.minimumStock)) : items;
  const total = await prisma.stock.count({ where });
  return res.json({ success: true, items: filtered, pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } });
}

export async function summary(req: AuthRequest, res: Response) {
  const warehouseId = typeof req.query.warehouseId === "string" ? req.query.warehouseId : undefined;
  const stocks = await prisma.stock.findMany({ where: warehouseId ? { warehouseId } : {}, include: { product: true, warehouse: true } });
  const totalUnits = stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
  const reservedUnits = stocks.reduce((sum, s) => sum + Number(s.reserved), 0);
  const stockValue = stocks.reduce((sum, s) => sum + Number(s.quantity) * Number(s.product.costPrice), 0);
  const lowStock = stocks.filter(s => Number(s.quantity) - Number(s.reserved) <= Number(s.product.minimumStock)).length;
  return res.json({ success: true, summary: { totalUnits, reservedUnits, availableUnits: totalUnits - reservedUnits, stockValue, lowStockItems: lowStock, stockLines: stocks.length } });
}
