import { z } from "zod";

export const createInventorySchema = z.object({
  warehouseId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const countInventoryItemSchema = z.object({
  countedQuantity: z.coerce.number().min(0),
  notes: z.string().max(500).optional(),
});

export const reportQuerySchema = z.object({
  warehouseId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  type: z.enum(["IN", "OUT", "TRANSFER", "ADJUSTMENT"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
