import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { adjustmentSchema, inboundSchema, outboundSchema, transferSchema } from "../schemas/logistics.schemas.js";
import { adjustment, inbound, outbound, transfer } from "../services/stock-movement.service.js";

export async function index(req: AuthRequest, res: Response) {
  const take = Math.min(Number(req.query.limit) || 50, 100);
  const items = await prisma.stockMovement.findMany({
    where: {
      ...(typeof req.query.productId === "string" ? { productId: req.query.productId } : {}),
      ...(typeof req.query.warehouseId === "string" ? { warehouseId: req.query.warehouseId } : {}),
      ...(typeof req.query.type === "string" ? { type: req.query.type as any } : {})
    },
    include: { product: true, warehouse: true, fromLocation: true, toLocation: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take
  });
  return res.json({ success: true, items });
}

export async function createInbound(req: AuthRequest, res: Response) {
  const data = inboundSchema.parse(req.body);
  const result = await inbound(data, req.user!.id);
  return res.status(201).json({ success: true, ...result });
}
export async function createOutbound(req: AuthRequest, res: Response) {
  const data = outboundSchema.parse(req.body);
  const result = await outbound(data, req.user!.id);
  return res.status(201).json({ success: true, ...result });
}
export async function createTransfer(req: AuthRequest, res: Response) {
  const data = transferSchema.parse(req.body);
  const result = await transfer(data, req.user!.id);
  return res.status(201).json({ success: true, ...result });
}
export async function createAdjustment(req: AuthRequest, res: Response) {
  const data = adjustmentSchema.parse(req.body);
  const result = await adjustment(data, req.user!.id);
  return res.status(201).json({ success: true, ...result });
}
