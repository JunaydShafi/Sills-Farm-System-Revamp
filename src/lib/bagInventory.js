import { prisma } from "@/lib/prisma";

// Bags Made counts completed bagging records only, including adjustments.
// Inventory and Inventory lbs are calculated here so they can never go stale.
export async function getBagInventory() {
  const [items, bagged, sold] = await Promise.all([
    prisma.bag_inventory_items.findMany({
      select: {
        id: true,
        factor_lbs: true,
        processes: { select: { process_number: true } },
        sale_items: { select: { item_code: true, name: true } },
      },
      orderBy: [
        { processes: { process_number: "asc" } },
        { sale_items: { item_code: "asc" } },
      ],
    }),
    prisma.bagging_records.groupBy({
      by: ["inventory_item_id"],
      where: { status: "Completed" },
      _sum: { quantity: true },
    }),
    prisma.bag_sales.groupBy({
      by: ["inventory_item_id"],
      _sum: { units_sold: true },
    }),
  ]);

  const baggedById = new Map(
    bagged.map((row) => [row.inventory_item_id, row._sum.quantity ?? 0]),
  );
  const soldById = new Map(
    sold.map((row) => [row.inventory_item_id, row._sum.units_sold ?? 0]),
  );

  return items.map((item) => {
    const bagsMade = baggedById.get(item.id) ?? 0;
    const unitsSold = soldById.get(item.id) ?? 0;
    const inventory = bagsMade - unitsSold;

    return {
      id: item.id,
      proc: item.processes.process_number,
      type: item.sale_items.name,
      factor: item.factor_lbs,
      bagsMade,
      unitsSold,
      inventory,
      inventoryLbs: item.factor_lbs * inventory,
      saleItemId: item.sale_items.item_code,
    };
  });
}
