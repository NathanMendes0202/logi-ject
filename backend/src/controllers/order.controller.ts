import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { createOrderSchema, listOrdersSchema, updateOrderStatusSchema } from "../schemas/order.schemas.js";
import * as service from "../services/order.service.js";
import { paramId } from "../utils/params.js";

export async function index(req: AuthRequest, res: Response) {
  const params = listOrdersSchema.parse(req.query);
  return res.json({ success: true, ...await service.listOrders(params) });
}
export async function show(req: AuthRequest, res: Response) { return res.json({ success: true, data: await service.getOrder(paramId(req.params.id)) }); }
export async function create(req: AuthRequest, res: Response) { const data = createOrderSchema.parse(req.body); return res.status(201).json({ success: true, data: await service.createOrder(data, req.user!.id) }); }
export async function updateStatus(req: AuthRequest, res: Response) { const { status } = updateOrderStatusSchema.parse(req.body); return res.json({ success: true, data: await service.changeStatus(paramId(req.params.id), status, req.user!.id) }); }