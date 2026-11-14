// Shared by the Bagging Data form and the bagging API so both apply the same rules.
// Keep this file free of server-only imports.

const MAX_BAGS = 100000;
const MAX_SIZE_LBS = 2000;

function readWholeNumber(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : NaN;
  }

  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    return Number(value.trim());
  }

  return NaN;
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

// Returns { record, errors }. record is only safe to save when errors is empty.
export function validateBaggingRecord(input) {
  const errors = {};
  const record = {};

  // Date: required, real calendar date (YYYY-MM-DD from the date picker)
  const date = typeof input.date === "string" ? input.date.trim() : "";

  if (!date) {
    errors.date = "Date is required.";
  } else if (!isRealDate(date)) {
    errors.date = "Enter a valid date.";
  } else {
    record.date = date;
  }

  // Quantity: required whole number of bags, zero allowed for adjustment-only entries
  if (isBlank(input.quantity)) {
    errors.quantity = "Quantity is required.";
  } else {
    const quantity = readWholeNumber(input.quantity);

    if (Number.isNaN(quantity)) {
      errors.quantity = "Quantity must be a whole number.";
    } else if (quantity < 0 || quantity > MAX_BAGS) {
      errors.quantity = `Quantity must be between 0 and ${MAX_BAGS}.`;
    } else {
      record.quantity = quantity;
    }
  }

  // Size: required bag size in pounds
  if (isBlank(input.size)) {
    errors.size = "Size is required.";
  } else {
    const size = readWholeNumber(input.size);

    if (Number.isNaN(size)) {
      errors.size = "Size must be a whole number of pounds.";
    } else if (size < 1 || size > MAX_SIZE_LBS) {
      errors.size = `Size must be between 1 and ${MAX_SIZE_LBS} lbs.`;
    } else {
      record.size = size;
    }
  }

  // Adjustment: optional correction, may be negative, blank means 0
  if (isBlank(input.adjustment)) {
    record.adjustment = 0;
  } else {
    const adjustment = readWholeNumber(input.adjustment);

    if (Number.isNaN(adjustment)) {
      errors.adjustment = "Adjustment must be a whole number (use - to subtract).";
    } else if (Math.abs(adjustment) > MAX_BAGS) {
      errors.adjustment = `Adjustment must be between -${MAX_BAGS} and ${MAX_BAGS}.`;
    } else {
      record.adjustment = adjustment;
    }
  }

  if (record.quantity === 0 && record.adjustment === 0) {
    errors.quantity = "Enter a quantity or an adjustment.";
  }

  // Product and Proc: required selections from the database lists
  for (const field of ["productId", "procId"]) {
    const id = readWholeNumber(input[field]);
    const label = field === "productId" ? "Product" : "Proc";

    if (isBlank(input[field])) {
      errors[field] = `${label} is required.`;
    } else if (Number.isNaN(id) || id < 1) {
      errors[field] = `Select a valid ${label.toLowerCase()}.`;
    } else {
      record[field] = id;
    }
  }

  return { record, errors };
}
