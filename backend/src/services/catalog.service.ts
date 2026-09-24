import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function listCategories(page: number, limit: number, search?: string, active?: boolean) {
  const where: Prisma.CategoryWhereInput = {
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(active !== undefined ? { active } : {})
  };
  const [items, total] = await prisma.$transaction([
    prisma.category.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * limit, take: limit, include: { _count: { select: { products: true } } } }),
    prisma.category.count({ where })
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function listSuppliers(page: number, limit: number, search?: string, active?: boolean) {
  const where: Prisma.SupplierWhereInput = {
    ...(search ? { OR: [
      { name: { contains: search, mode: "insensitive" } },
      { document: { contains: search, mode: "insensitive" } }
    ] } : {}),
    ...(active !== undefined ? { active } : {})
  };
  const [items, total] = await prisma.$transaction([
    prisma.supplier.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * limit, take: limit, include: { _count: { select: { products: true } } } }),
    prisma.supplier.count({ where })
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function listProducts(params: { page: number; limit: number; search?: string; status?: "ACTIVE" | "INACTIVE"; categoryId?: string; supplierId?: string }) {
  const { page, limit, search, status, categoryId, supplierId } = params;
  const where: Prisma.ProductWhereInput = {
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(supplierId ? { supplierId } : {}),
    ...(search ? { OR: [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } }
    ] } : {})
  };
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      include: { category: { select: { id: true, name: true } }, supplier: { select: { id: true, name: true } } }
    }),
    prisma.product.count({ where })
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
