import { prisma } from "@/lib/prisma";

const recordSelect = {
  id: true,
  bag_date: true,
  quantity: true,
  size_lbs: true,
  adjustment: true,
  sale_items: { select: { id: true, item_code: true, name: true } },
  processes: { select: { id: true, process_number: true } },
};

// Dates are stored as DATE columns, so keep them as YYYY-MM-DD strings in the app.
function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function toRow(record) {
  return {
    id: record.id,
    date: toDateString(record.bag_date),
    quantity: record.quantity,
    size: record.size_lbs,
    adjustment: record.adjustment,
    productId: record.sale_items.id,
    product: record.sale_items.name,
    productCode: record.sale_items.item_code,
    procId: record.processes.id,
    proc: record.processes.process_number,
  };
}

function toData(record) {
  return {
    bag_date: new Date(`${record.date}T00:00:00Z`),
    quantity: record.quantity,
    size_lbs: record.size,
    adjustment: record.adjustment,
    sale_item_id: record.productId,
    process_id: record.procId,
  };
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
  const created = await prisma.bagging_records.create({
    data: toData(record),
    select: recordSelect,
  });

  return toRow(created);
}

// Throws Prisma error P2025 when the record does not exist.
export async function updateBaggingRecord(id, record) {
  const updated = await prisma.bagging_records.update({
    where: { id },
    data: toData(record),
    select: recordSelect,
  });

  return toRow(updated);
}
