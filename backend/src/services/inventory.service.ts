import { prisma } from "../config/prisma.js";
import { Prisma } from "@prisma/client";

const dec = (v: Prisma.Decimal | number | null | undefined) => Number(v ?? 0);

export async function createInventory(warehouseId: string, userId: string, notes?: string) {
  const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
  if (!warehouse) throw new Error("Armazém não encontrado.");

  const open = await prisma.inventory.findFirst({ where: { warehouseId, status: { in: ["OPEN", "COUNTING"] } } });
  if (open) throw new Error("Já existe um inventário aberto para este armazém.");

  const stocks = await prisma.stock.findMany({ where: { warehouseId, quantity: { gt: 0 } }, include: { product: true, location: true } });
  const code = `INV-${new Date().toISOString().slice(0,10).replaceAll("-", "")}-${Math.floor(Math.random()*9000+1000)}`;

  return prisma.inventory.create({
    data: { code, warehouseId, createdById: userId, notes, status: "OPEN", items: { create: stocks.map(s => ({ productId: s.productId, locationId: s.locationId, systemQuantity: s.quantity })) } },
    include: { warehouse: true, items: { include: { product: true, location: true } } }
  });
}

export async function countItem(inventoryId: string, itemId: string, countedQuantity: number, notes?: string) {
  const item = await prisma.inventoryItem.findFirst({ where: { id: itemId, inventoryId }, include: { inventory: true } });
  if (!item) throw new Error("Item de inventário não encontrado.");
  if (!["OPEN", "COUNTING"].includes(item.inventory.status)) throw new Error("Inventário não está aberto para contagem.");
  const difference = new Prisma.Decimal(countedQuantity).minus(item.systemQuantity);
  await prisma.inventory.update({ where: { id: inventoryId }, data: { status: "COUNTING" } });
  return prisma.inventoryItem.update({ where: { id: itemId }, data: { countedQuantity: countedQuantity, difference, countedAt: new Date(), notes } });
}

export async function closeInventory(inventoryId: string, userId: string) {
  return prisma.$transaction(async tx => {
    const inventory = await tx.inventory.findUnique({ where: { id: inventoryId }, include: { items: true } });
    if (!inventory) throw new Error("Inventário não encontrado.");
    if (["CLOSED", "CANCELLED"].includes(inventory.status)) throw new Error("Inventário já finalizado.");
    const uncounted = inventory.items.filter(i => i.countedQuantity === null);
    if (uncounted.length) throw new Error(`Existem ${uncounted.length} itens sem contagem.`);

    for (const item of inventory.items) {
      const diff = dec(item.difference);
      if (!diff) continue;
      const stock = await tx.stock.findFirst({ where: { productId: item.productId, warehouseId: inventory.warehouseId, locationId: item.locationId } });
      if (!stock) throw new Error("Estoque correspondente não encontrado para um item do inventário.");
      const next = dec(stock.quantity) + diff;
      if (next < 0) throw new Error("Ajuste de inventário resultaria em estoque negativo.");
      await tx.stock.update({ where: { id: stock.id }, data: { quantity: next } });
      await tx.stockMovement.create({ data: { type: "ADJUSTMENT", reason: "INVENTORY", status: "COMPLETED", quantity: Math.abs(diff), document: inventory.code, notes: `Ajuste de inventário: ${diff > 0 ? "+" : ""}${diff}`, productId: item.productId, warehouseId: inventory.warehouseId, toLocationId: diff > 0 ? item.locationId : undefined, fromLocationId: diff < 0 ? item.locationId : undefined, userId } });
    }
    return tx.inventory.update({ where: { id: inventoryId }, data: { status: "CLOSED", closedAt: new Date() }, include: { warehouse: true, items: { include: { product: true, location: true } } } });
  });
}
