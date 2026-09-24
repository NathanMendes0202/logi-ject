import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

type Tx = Prisma.TransactionClient;

async function validateProductWarehouse(tx: Tx, productId: string, warehouseId: string) {
  const [product, warehouse] = await Promise.all([
    tx.product.findUnique({ where: { id: productId } }),
    tx.warehouse.findUnique({ where: { id: warehouseId } })
  ]);
  if (!product || product.status !== "ACTIVE") throw new Error("Produto inválido ou inativo.");
  if (!warehouse || !warehouse.active) throw new Error("Armazém inválido ou inativo.");
  return { product, warehouse };
}

async function validateLocation(tx: Tx, locationId: string, warehouseId: string) {
  const location = await tx.location.findUnique({ where: { id: locationId } });
  if (!location || !location.active || location.warehouseId !== warehouseId) throw new Error("Localização inválida para o armazém informado.");
  return location;
}

async function getOrCreateStock(tx: Tx, productId: string, warehouseId: string, locationId: string) {
  return tx.stock.upsert({
    where: { productId_warehouseId_locationId: { productId, warehouseId, locationId } },
    create: { productId, warehouseId, locationId, quantity: 0, reserved: 0 },
    update: {}
  });
}

export async function inbound(data: { productId: string; warehouseId: string; locationId: string; quantity: number; reason: "PURCHASE" | "RETURN" | "INVENTORY" | "OTHER"; document?: string; notes?: string }, userId: string) {
  return prisma.$transaction(async tx => {
    await validateProductWarehouse(tx, data.productId, data.warehouseId);
    await validateLocation(tx, data.locationId, data.warehouseId);
    const stock = await getOrCreateStock(tx, data.productId, data.warehouseId, data.locationId);
    const updated = await tx.stock.update({ where: { id: stock.id }, data: { quantity: { increment: new Prisma.Decimal(data.quantity) } } });
    const movement = await tx.stockMovement.create({ data: { type: "IN", reason: data.reason, quantity: data.quantity, document: data.document, notes: data.notes, productId: data.productId, warehouseId: data.warehouseId, toLocationId: data.locationId, userId } });
    return { movement, stock: updated };
  });
}

export async function outbound(data: { productId: string; warehouseId: string; locationId: string; quantity: number; reason: "SALE" | "DAMAGE" | "RETURN" | "OTHER"; document?: string; notes?: string }, userId: string) {
  return prisma.$transaction(async tx => {
    await validateProductWarehouse(tx, data.productId, data.warehouseId);
    await validateLocation(tx, data.locationId, data.warehouseId);
    const stock = await getOrCreateStock(tx, data.productId, data.warehouseId, data.locationId);
    const available = Number(stock.quantity) - Number(stock.reserved);
    if (available < data.quantity) throw new Error(`Estoque insuficiente. Disponível: ${available}.`);
    const updated = await tx.stock.update({ where: { id: stock.id }, data: { quantity: { decrement: new Prisma.Decimal(data.quantity) } } });
    const movement = await tx.stockMovement.create({ data: { type: "OUT", reason: data.reason, quantity: data.quantity, document: data.document, notes: data.notes, productId: data.productId, warehouseId: data.warehouseId, fromLocationId: data.locationId, userId } });
    return { movement, stock: updated };
  });
}

export async function transfer(data: { productId: string; warehouseId: string; fromLocationId: string; toLocationId: string; quantity: number; document?: string; notes?: string }, userId: string) {
  return prisma.$transaction(async tx => {
    await validateProductWarehouse(tx, data.productId, data.warehouseId);
    await validateLocation(tx, data.fromLocationId, data.warehouseId);
    await validateLocation(tx, data.toLocationId, data.warehouseId);
    const source = await getOrCreateStock(tx, data.productId, data.warehouseId, data.fromLocationId);
    const available = Number(source.quantity) - Number(source.reserved);
    if (available < data.quantity) throw new Error(`Estoque insuficiente na origem. Disponível: ${available}.`);
    const destination = await getOrCreateStock(tx, data.productId, data.warehouseId, data.toLocationId);
    const [updatedSource, updatedDestination] = await Promise.all([
      tx.stock.update({ where: { id: source.id }, data: { quantity: { decrement: new Prisma.Decimal(data.quantity) } } }),
      tx.stock.update({ where: { id: destination.id }, data: { quantity: { increment: new Prisma.Decimal(data.quantity) } } })
    ]);
    const movement = await tx.stockMovement.create({ data: { type: "TRANSFER", reason: "TRANSFER", quantity: data.quantity, document: data.document, notes: data.notes, productId: data.productId, warehouseId: data.warehouseId, fromLocationId: data.fromLocationId, toLocationId: data.toLocationId, userId } });
    return { movement, source: updatedSource, destination: updatedDestination };
  });
}

export async function adjustment(data: { productId: string; warehouseId: string; locationId: string; quantity: number; document?: string; notes?: string }, userId: string) {
  return prisma.$transaction(async tx => {
    await validateProductWarehouse(tx, data.productId, data.warehouseId);
    await validateLocation(tx, data.locationId, data.warehouseId);
    const stock = await getOrCreateStock(tx, data.productId, data.warehouseId, data.locationId);
    if (Number(stock.quantity) + data.quantity < Number(stock.reserved)) throw new Error("O ajuste não pode deixar o estoque abaixo da quantidade reservada.");
    const updated = await tx.stock.update({ where: { id: stock.id }, data: { quantity: { increment: new Prisma.Decimal(data.quantity) } } });
    const movement = await tx.stockMovement.create({ data: { type: "ADJUSTMENT", reason: "INVENTORY", quantity: Math.abs(data.quantity), document: data.document, notes: `${data.quantity > 0 ? "Aumento" : "Redução"}. ${data.notes ?? ""}`.trim(), productId: data.productId, warehouseId: data.warehouseId, ...(data.quantity > 0 ? { toLocationId: data.locationId } : { fromLocationId: data.locationId }), userId } });
    return { movement, stock: updated };
  });
}
