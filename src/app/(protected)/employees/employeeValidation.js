// Frontend validation for the Employees form (SFBMSR-271).
// validateEmployee() returns an object of { fieldKey: "error message" }.
// An empty object means the record is valid and can be saved.

// Required fields (final list to be confirmed with the Product Owner)
export const requiredFields = [
  "employeeId",
  "name",
  "street",
  "city",
  "state",
  "zip",
  "ssn",
  "payRate",
  "startDate",
];

// US state, DC, and territory postal abbreviations
const stateCodes = new Set(
  (
    "AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS " +
    "MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV " +
    "WI WY DC AS GU MP PR VI"
  ).split(" ")
);

// Masked SSN already on file, e.g. "•••-••-1234"
const maskedSsnPattern = /^•••-••-\d{4}$/;

// Positive dollar amount with up to two decimals; "$" and commas are allowed
function isPositiveDollarAmount(value) {
  const cleaned = value.replace(/[$,]/g, "");
  return /^\d+(\.\d{1,2})?$/.test(cleaned) && Number(cleaned) > 0;
}

function isNonNegativeNumber(value) {
  return /^\d+(\.\d+)?$/.test(value);
}

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

// Today's date as YYYY-MM-DD in the user's local time zone
export function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function validateEmployee(employee) {
  const errors = {};
  const value = (key) => String(employee[key] ?? "").trim();

  for (const key of requiredFields) {
    if (!value(key)) {
      errors[key] = "Required.";
    }
  }

  if (value("state") && !stateCodes.has(value("state").toUpperCase())) {
    errors.state = "Use a two-letter state abbreviation (e.g. CA).";
  }

  if (value("zip") && !/^\d{5}(-\d{4})?$/.test(value("zip"))) {
    errors.zip = "Use 5 digits or ZIP+4 (e.g. 95668 or 95668-1234).";
  }

  if (value("phone") && digitsOnly(value("phone")).length !== 10) {
    errors.phone = "Enter a 10-digit phone number.";
  }

  if (
    value("ssn") &&
    !maskedSsnPattern.test(value("ssn")) &&
    !/^\d{3}-?\d{2}-?\d{4}$/.test(value("ssn"))
  ) {
    errors.ssn = "Enter a 9-digit SSN.";
  }

  if (value("payRate") && !isPositiveDollarAmount(value("payRate"))) {
    errors.payRate =
      "Enter a positive dollar amount with up to two decimals.";
  }

  if (
    value("irrPayRate") &&
    value("irrPayRate").toUpperCase() !== "NA" &&
    !isPositiveDollarAmount(value("irrPayRate"))
  ) {
    errors.irrPayRate = 'Enter a positive dollar amount or "NA".';
  }

  for (const key of ["allowances", "withholding", "childSupport"]) {
    if (value(key) && !isNonNegativeNumber(value(key))) {
      errors[key] = "Enter a number of 0 or more.";
    }
  }

  if (value("startDate")) {
    if (!isValidDateString(value("startDate"))) {
      errors.startDate = "Enter a valid date.";
    } else if (value("startDate") > todayString()) {
      errors.startDate = "Start date cannot be in the future.";
    }
  }

  return errors;
}

// Clean up a valid record before saving it to the list: trim text, uppercase
// the state, format phone and SSN consistently, and show only the last four
// SSN digits on screen.
export function normalizeEmployee(employee) {
  const trimmed = Object.fromEntries(
    Object.entries(employee).map(([key, fieldValue]) => [
      key,
      String(fieldValue ?? "").trim(),
    ])
  );

  const phoneDigits = digitsOnly(trimmed.phone);
  const ssnDigits = digitsOnly(trimmed.ssn);

  return {
    ...trimmed,
    state: trimmed.state.toUpperCase(),
    phone: phoneDigits
      ? `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`
      : "",
    ssn: maskedSsnPattern.test(trimmed.ssn)
      ? trimmed.ssn
      : `•••-••-${ssnDigits.slice(-4)}`,
    payRate: Number(trimmed.payRate.replace(/[$,]/g, "")).toFixed(2),
    irrPayRate:
      trimmed.irrPayRate.toUpperCase() === "NA"
        ? "NA"
        : trimmed.irrPayRate &&
          Number(trimmed.irrPayRate.replace(/[$,]/g, "")).toFixed(2),
  };
}
