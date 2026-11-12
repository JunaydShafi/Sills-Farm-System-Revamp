// Converts between employees table rows and the Employees page form.
// Used only by the /api/employees routes.

import {
  normalizeEmployee,
  validateEmployee,
} from "@/app/(protected)/employees/employeeValidation";
import { fromDateString, toDateString } from "@/lib/apiAuth";

const maxLengths = {
  employeeId: 20,
  name: 150,
  street: 255,
  city: 100,
  notes: 2000,
};

const yesNoValues = ["Active", "Inactive"];

// Plain number text without trailing zeros, e.g. 1.00 -> "1", 2.50 -> "2.5"
function numberText(decimal) {
  return decimal == null ? "" : String(Number(decimal.toString()));
}

// Database row -> what the Employees page shows. Never includes a full SSN.
export function toClientEmployee(row) {
  return {
    id: row.id,
    employeeId: row.employee_code,
    name: row.name,
    street: row.street,
    city: row.city,
    state: row.state,
    zip: row.zip,
    phone: row.phone ?? "",
    active: row.active,
    ssn: `•••-••-${row.ssn_last4}`,
    payRate: row.pay_rate.toFixed(2),
    irrPayRate: row.irr_pay_rate == null ? "NA" : row.irr_pay_rate.toFixed(2),
    status: row.status,
    allowances: numberText(row.allowances),
    withholding: numberText(row.withholding),
    childSupport: numberText(row.child_support),
    startDate: toDateString(row.start_date),
    notes: row.notes ?? "",
    payrollCount: row._count?.payroll_records ?? 0,
  };
}

// Form values from the page -> { data } ready for Prisma, or { errors }
export function fromClientEmployee(form) {
  const values = {};
  for (const key of [
    "employeeId", "name", "street", "city", "state", "zip", "phone", "active",
    "ssn", "payRate", "irrPayRate", "status", "allowances", "withholding",
    "childSupport", "startDate", "notes",
  ]) {
    values[key] = typeof form?.[key] === "string" ? form[key] : "";
  }

  // Same rules as the form (SFBMSR-271), checked again on the server
  const errors = validateEmployee(values);

  for (const [key, max] of Object.entries(maxLengths)) {
    if (values[key].trim().length > max) {
      errors[key] = `Maximum ${max} characters allowed.`;
    }
  }

  for (const key of ["active", "status"]) {
    if (!yesNoValues.includes(values[key])) {
      errors[key] = "Choose Active or Inactive.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const clean = normalizeEmployee(values);

  return {
    data: {
      employee_code: clean.employeeId,
      name: clean.name,
      street: clean.street,
      city: clean.city,
      state: clean.state,
      zip: clean.zip,
      phone: clean.phone || null,
      active: clean.active,
      status: clean.status,
      // normalizeEmployee leaves the SSN as •••-••-1234; keep the last four
      ssn_last4: clean.ssn.slice(-4),
      pay_rate: clean.payRate,
      irr_pay_rate: !clean.irrPayRate || clean.irrPayRate === "NA" ? null : clean.irrPayRate,
      allowances: clean.allowances || "0",
      withholding: clean.withholding || "0",
      child_support: clean.childSupport || "0",
      start_date: fromDateString(clean.startDate),
      notes: clean.notes || null,
    },
  };
}
