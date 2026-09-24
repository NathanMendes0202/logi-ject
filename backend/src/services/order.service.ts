import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

type Tx = Prisma.TransactionClient;

async function validateLocation(tx: Tx, locationId: string | undefined, warehouseId: string) {
  if (!locationId) return null;
  const location = await tx.location.findUnique({ where: { id: locationId } });
  if (!location || !location.active || location.warehouseId !== warehouseId) throw new Error("Localização inválida para o armazém.");
  return location;
}

async function validateItems(tx: Tx, items: Array<{ productId: string; quantity: number; locationId?: string }>, warehouseId: string) {
  for (const item of items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product || product.status !== "ACTIVE") throw new Error(`Produto inválido ou inativo: ${item.productId}`);
    await validateLocation(tx, item.locationId, warehouseId);
  }
}

export async function createOrder(data: { type: "INBOUND" | "OUTBOUND"; warehouseId: string; partnerName?: string; document?: string; notes?: string; items: Array<{ productId: string; quantity: number; unitPrice?: number; locationId?: string }> }, userId: string) {
  return prisma.$transaction(async tx => {
    const warehouse = await tx.warehouse.findUnique({ where: { id: data.warehouseId } });
    if (!warehouse || !warehouse.active) throw new Error("Armazém inválido ou inativo.");
    await validateItems(tx, data.items, data.warehouseId);
    const count = await tx.order.count();
    const code = `PED-${String(count + 1).padStart(6, "0")}`;
    return tx.order.create({
      data: {
        code, type: data.type, warehouseId: data.warehouseId, createdById: userId,
        partnerName: data.partnerName, document: data.document, notes: data.notes,
        items: { create: data.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, locationId: i.locationId })) }
      },
      include: { items: { include: { product: true, location: true } }, warehouse: true }
    });
  });
}

export async function listOrders(params: { page: number; limit: number; status?: string; type?: string; search?: string }) {
  const where: Prisma.OrderWhereInput = {
    ...(params.status ? { status: params.status as any } : {}),
    ...(params.type ? { type: params.type as any } : {}),
    ...(params.search ? { OR: [{ code: { contains: params.search, mode: "insensitive" } }, { partnerName: { contains: params.search, mode: "insensitive" } }] } : {})
  };
  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({ where, include: { warehouse: true, createdBy: { select: { id: true, name: true } }, items: { include: { product: { select: { id: true, sku: true, name: true } }, location: true } } }, orderBy: { createdAt: "desc" }, skip: (params.page - 1) * params.limit, take: params.limit }),
    prisma.order.count({ where })
  ]);
  return { items, pagination: { page: params.page, limit: params.limit, total, pages: Math.ceil(total / params.limit) } };
}

export async function getOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id }, include: { warehouse: true, createdBy: { select: { id: true, name: true } }, items: { include: { product: true, location: true } } } });
  if (!order) throw new Error("Pedido não encontrado.");
  return order;
}

async function getStock(tx: Tx, productId: string, warehouseId: string, locationId: string) {
  return tx.stock.upsert({ where: { productId_warehouseId_locationId: { productId, warehouseId, locationId } }, create: { productId, warehouseId, locationId, quantity: 0, reserved: 0 }, update: {} });
}

export async function changeStatus(id: string, nextStatus: "PENDING" | "SEPARATION" | "CONFERENCE" | "SHIPPED" | "CANCELLED", userId: string) {
  return prisma.$transaction(async tx => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new Error("Pedido não encontrado.");
    if (order.status === "SHIPPED" || order.status === "CANCELLED") throw new Error("Pedido finalizado não pode ser alterado.");
    const allowed: Record<string, string[]> = { PENDING: ["SEPARATION", "CANCELLED"], SEPARATION: ["CONFERENCE", "CANCELLED"], CONFERENCE: ["SHIPPED", "CANCELLED"] };
    if (!allowed[order.status]?.includes(nextStatus)) throw new Error(`Transição inválida: ${order.status} → ${nextStatus}.`);

    if (nextStatus === "SEPARATION" && order.type === "OUTBOUND") {
      for (const item of order.items) {
        if (!item.locationId) throw new Error(`Informe a localização do item ${item.productId} para separar o pedido.`);
        const stock = await getStock(tx, item.productId, order.warehouseId, item.locationId);
        const available = Number(stock.quantity) - Number(stock.reserved);
        if (available < Number(item.quantity)) throw new Error(`Estoque insuficiente para o produto ${item.productId}. Disponível: ${available}.`);
        await tx.stock.update({ where: { id: stock.id }, data: { reserved: { increment: item.quantity } } });
      }
    }

    if (nextStatus === "CANCELLED" && order.status === "SEPARATION" && order.type === "OUTBOUND") {
      for (const item of order.items) {
        if (!item.locationId) continue;
        const stock = await getStock(tx, item.productId, order.warehouseId, item.locationId);
        await tx.stock.update({ where: { id: stock.id }, data: { reserved: { decrement: item.quantity } } });
      }
    }

    if (nextStatus === "SHIPPED") {
      for (const item of order.items) {
        if (!item.locationId) throw new Error(`Informe a localização do item ${item.productId}.`);
        const stock = await getStock(tx, item.productId, order.warehouseId, item.locationId);
        if (order.type === "OUTBOUND") {
          if (Number(stock.reserved) < Number(item.quantity) || Number(stock.quantity) < Number(item.quantity)) throw new Error(`Reserva/estoque insuficiente para o produto ${item.productId}.`);
          await tx.stock.update({ where: { id: stock.id }, data: { quantity: { decrement: item.quantity }, reserved: { decrement: item.quantity } } });
          await tx.stockMovement.create({ data: { type: "OUT", reason: "SALE", quantity: item.quantity, document: order.code, notes: order.notes, productId: item.productId, warehouseId: order.warehouseId, fromLocationId: item.locationId, userId } });
        } else {
          await tx.stock.update({ where: { id: stock.id }, data: { quantity: { increment: item.quantity } } });
          await tx.stockMovement.create({ data: { type: "IN", reason: "PURCHASE", quantity: item.quantity, document: order.code, notes: order.notes, productId: item.productId, warehouseId: order.warehouseId, toLocationId: item.locationId, userId } });
        }
      }
    }

    return tx.order.update({ where: { id }, data: { status: nextStatus }, include: { items: { include: { product: true, location: true } }, warehouse: true } });
  });
}
