import { prisma } from "./prisma";

// One Bag Inventory row per process, product and bag size.
// Bags Made = quantity + adjustment from bagging records; Units Sold comes from bag_sales.
// Inventory and Inventory lbs are calculated here so they can never go stale.
export async function getBagInventory() {
  const groupKeys = ["process_id", "sale_item_id", "size_lbs"];

  const [bagged, sold, processes, products] = await Promise.all([
    prisma.bagging_records.groupBy({
      by: groupKeys,
      _sum: { quantity: true, adjustment: true },
    }),
    prisma.bag_sales.groupBy({
      by: groupKeys,
      _sum: { units_sold: true },
    }),
    prisma.processes.findMany({ select: { id: true, process_number: true } }),
    prisma.sale_items.findMany({ select: { id: true, item_code: true, name: true } }),
  ]);

  const processById = new Map(processes.map((process) => [process.id, process]));
  const productById = new Map(products.map((product) => [product.id, product]));
  const rows = new Map();

  function rowFor(group) {
    const key = `${group.process_id}-${group.sale_item_id}-${group.size_lbs}`;

    if (!rows.has(key)) {
      rows.set(key, { key, group, bagsMade: 0, unitsSold: 0 });
    }

    return rows.get(key);
  }

  for (const group of bagged) {
    rowFor(group).bagsMade += (group._sum.quantity ?? 0) + (group._sum.adjustment ?? 0);
  }

  for (const group of sold) {
    rowFor(group).unitsSold += group._sum.units_sold ?? 0;
  }

  return [...rows.values()]
    .map(({ key, group, bagsMade, unitsSold }) => {
      const process = processById.get(group.process_id);
      const product = productById.get(group.sale_item_id);
      const inventory = bagsMade - unitsSold;

      return {
        id: key,
        proc: process.process_number,
        type: product.name,
        factor: group.size_lbs,
        bagsMade,
        unitsSold,
        inventory,
        inventoryLbs: group.size_lbs * inventory,
        saleItemId: product.item_code,
      };
    })
    .sort(
      (a, b) =>
        a.proc - b.proc ||
        a.saleItemId.localeCompare(b.saleItemId) ||
        a.factor - b.factor,
    );
}
