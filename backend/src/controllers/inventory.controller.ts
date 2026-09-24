import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { countInventoryItemSchema, createInventorySchema } from "../schemas/inventory.schemas.js";
import { closeInventory, countItem, createInventory } from "../services/inventory.service.js";
import { paramId } from "../utils/params.js";

export async function index(req: AuthRequest, res: Response) {
  const items = await prisma.inventory.findMany({ include: { warehouse: true, createdBy: { select: { id: true, name: true } }, _count: { select: { items: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  res.json({ success: true, items });
}
export async function show(req: AuthRequest, res: Response) {
  const item = await prisma.inventory.findUnique({ where: { id: paramId(req.params.id) }, include: { warehouse: true, items: true } });
  if (!item) return res.status(404).json({ success: false, message: "Inventário não encontrado." });
  return res.json({ success: true, item });
}

export async function create(req: AuthRequest, res: Response) { const data = createInventorySchema.parse(req.body); res.status(201).json({ success: true, item: await createInventory(data.warehouseId, req.user!.id, data.notes) }); }
export async function count(req: AuthRequest, res: Response) { const data = countInventoryItemSchema.parse(req.body); res.json({ success: true, item: await countItem(paramId(req.params.id), paramId(req.params.itemId), data.countedQuantity, data.notes) }); }
export async function close(req: AuthRequest, res: Response) { res.json({ success: true, item: await closeInventory(paramId(req.params.id), req.user!.id) }); }