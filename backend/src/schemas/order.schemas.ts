import { z } from "zod";

export const createOrderSchema = z.object({
  type: z.enum(["INBOUND", "OUTBOUND"]),
  warehouseId: z.string().uuid(),
  partnerName: z.string().trim().max(150).optional(),
  document: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(500).optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative().optional(),
    locationId: z.string().uuid().optional()
  })).min(1)
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "SEPARATION", "CONFERENCE", "SHIPPED", "CANCELLED"])
});

export const listOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["PENDING", "SEPARATION", "CONFERENCE", "SHIPPED", "CANCELLED"]).optional(),
  type: z.enum(["INBOUND", "OUTBOUND"]).optional(),
  search: z.string().trim().optional()
});
