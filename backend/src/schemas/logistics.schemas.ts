import { z } from "zod";

const decimal = z.coerce.number().positive();
const nonNegative = z.coerce.number().min(0);

export const warehouseCreateSchema = z.object({
  code: z.string().trim().min(2).max(30).toUpperCase(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  address: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(2).optional().nullable()
});
export const warehouseUpdateSchema = warehouseCreateSchema.partial();

export const locationCreateSchema = z.object({
  code: z.string().trim().min(1).max(50).toUpperCase(),
  name: z.string().trim().max(120).optional().nullable(),
  aisle: z.string().trim().max(30).optional().nullable(),
  rack: z.string().trim().max(30).optional().nullable(),
  shelf: z.string().trim().max(30).optional().nullable(),
  position: z.string().trim().max(30).optional().nullable()
});
export const locationUpdateSchema = locationCreateSchema.partial();

export const stockListSchema = z.object({
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  lowStock: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const inboundSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: decimal,
  reason: z.enum(["PURCHASE", "RETURN", "INVENTORY", "OTHER"]).default("PURCHASE"),
  document: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional()
});

export const outboundSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: decimal,
  reason: z.enum(["SALE", "DAMAGE", "RETURN", "OTHER"]).default("SALE"),
  document: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional()
});

export const transferSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  fromLocationId: z.string().uuid(),
  toLocationId: z.string().uuid(),
  quantity: decimal,
  document: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional()
}).refine(v => v.fromLocationId !== v.toLocationId, { message: "A localização de origem e destino devem ser diferentes." });

export const adjustmentSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.coerce.number().refine(v => v !== 0, "A quantidade do ajuste não pode ser zero."),
  document: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional()
});
