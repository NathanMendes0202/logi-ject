import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().nullable();

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: optionalText
});
export const categoryUpdateSchema = categoryCreateSchema.partial();

export const supplierCreateSchema = z.object({
  name: z.string().trim().min(2).max(150),
  document: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email().max(150).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable()
});
export const supplierUpdateSchema = supplierCreateSchema.partial();

const productBaseSchema = z.object({
  sku: z.string().trim().min(1).max(60),
  barcode: z.string().trim().max(50).optional().nullable(),
  name: z.string().trim().min(2).max(180),
  description: optionalText,
  unit: z.string().trim().min(1).max(10).default("UN"),
  weightGrams: z.number().int().positive().optional().nullable(),
  lengthCm: z.number().nonnegative().optional().nullable(),
  widthCm: z.number().nonnegative().optional().nullable(),
  heightCm: z.number().nonnegative().optional().nullable(),
  minimumStock: z.number().nonnegative().default(0),
  maximumStock: z.number().nonnegative().optional().nullable(),
  costPrice: z.number().nonnegative().default(0),
  salePrice: z.number().nonnegative().optional().nullable(),
  categoryId: z.string().uuid(),
  supplierId: z.string().uuid().optional().nullable()
});

const stockRefinement = (data: { minimumStock?: number | null; maximumStock?: number | null }) =>
  data.maximumStock == null || data.minimumStock == null || data.maximumStock >= data.minimumStock;

export const productCreateSchema = productBaseSchema.refine(stockRefinement, {
  message: "O estoque máximo deve ser maior ou igual ao estoque mínimo.",
  path: ["maximumStock"]
});
export const productUpdateSchema = productBaseSchema.partial().refine(stockRefinement, {
  message: "O estoque máximo deve ser maior ou igual ao estoque mínimo.",
  path: ["maximumStock"]
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  active: z.enum(["true", "false"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional()
});