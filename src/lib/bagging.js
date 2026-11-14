import { prisma } from "@/lib/prisma";

// A bagging record links to products and processes through bag_inventory_items:
// one row per process, product and bag size, which Bag Inventory totals by.
const recordSelect = {
  id: true,
  bag_date: true,
  quantity: true,
  is_adjustment: true,
  bag_inventory_items: {
    select: {
      factor_lbs: true,
      processes: { select: { id: true, process_number: true } },
      sale_items: { select: { id: true, item_code: true, name: true } },
    },
  },
};

// Dates are stored as DATE columns, so keep them as YYYY-MM-DD strings in the app.
function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function toRow(record) {
  const item = record.bag_inventory_items;

  return {
    id: record.id,
    date: toDateString(record.bag_date),
    quantity: record.quantity,
    size: item.factor_lbs,
    adjustment: record.is_adjustment,
    productId: item.sale_items.id,
    product: item.sale_items.name,
    productCode: item.sale_items.item_code,
    procId: item.processes.id,
    proc: item.processes.process_number,
  };
}

// Finds or creates the inventory row for this process, product and bag size.
async function inventoryItemId(tx, record) {
  const item = await tx.bag_inventory_items.upsert({
    where: {
      process_id_sale_item_id_factor_lbs: {
        process_id: record.procId,
        sale_item_id: record.productId,
        factor_lbs: record.size,
      },
    },
    update: {},
    create: {
      process_id: record.procId,
      sale_item_id: record.productId,
      factor_lbs: record.size,
    },
    select: { id: true },
  });

  return item.id;
}

// Transaction history, newest first.
export async function listBaggingRecords() {
  const records = await prisma.bagging_records.findMany({
    select: recordSelect,
    orderBy: [{ bag_date: "desc" }, { id: "desc" }],
  });

  return records.map(toRow);
}

// Choices for the Product and Proc dropdowns.
export async function getBaggingOptions() {
  const [products, processes] = await Promise.all([
    prisma.sale_items.findMany({
      select: { id: true, item_code: true, name: true },
      orderBy: { item_code: "asc" },
    }),
    prisma.processes.findMany({
      select: { id: true, process_number: true, description: true },
      orderBy: { process_number: "asc" },
    }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      code: product.item_code,
      name: product.name,
    })),
    processes: processes.map((process) => ({
      id: process.id,
      number: process.process_number,
      description: process.description,
    })),
  };
}

// Returns field errors when the selected product or proc no longer exists.
export async function findMissingReferences(record) {
  const [product, process] = await Promise.all([
    prisma.sale_items.findUnique({ where: { id: record.productId }, select: { id: true } }),
    prisma.processes.findUnique({ where: { id: record.procId }, select: { id: true } }),
  ]);

  const errors = {};

  if (!product) errors.productId = "Selected product was not found.";
  if (!process) errors.procId = "Selected proc was not found.";

  return errors;
}

export async function createBaggingRecord(record) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.bagging_records.create({
      data: {
        inventory_item_id: await inventoryItemId(tx, record),
        bag_date: new Date(`${record.date}T00:00:00Z`),
        quantity: record.quantity,
        is_adjustment: record.adjustment,
        status: "Completed",
      },
      select: recordSelect,
    });

    return toRow(created);
  });
}

// Throws Prisma error P2025 when the record does not exist.
export async function updateBaggingRecord(id, record) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.bagging_records.findUniqueOrThrow({
      where: { id },
      select: { inventory_item_id: true },
    });

    const newItemId = await inventoryItemId(tx, record);

    const updated = await tx.bagging_records.update({
      where: { id },
      data: {
        inventory_item_id: newItemId,
        bag_date: new Date(`${record.date}T00:00:00Z`),
        quantity: record.quantity,
        is_adjustment: record.adjustment,
      },
      select: recordSelect,
    });

    // Remove the old inventory row if this edit left it with no records or sales.
    if (existing.inventory_item_id !== newItemId) {
      await tx.bag_inventory_items.deleteMany({
        where: {
          id: existing.inventory_item_id,
          bagging_records: { none: {} },
          bag_sales: { none: {} },
        },
      });
    }

    return toRow(updated);
  });
}
