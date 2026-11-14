// Pay calculation shared by the Pay Employees page and the payroll API, so
// the amount shown on screen is exactly the amount saved.

export const earningTypes = ["Regular", "Overtime", "Holiday"];

// Regular pays 1x, overtime 1.5x, holiday 2x
export const multipliers = { Regular: 1, Overtime: 1.5, Holiday: 2 };

// Non-negative number with up to two decimals. Partial input such as "8."
// is allowed while typing; use isValidHours() before saving.
export const hoursTypingPattern = /^\d{0,3}(\.\d{0,2})?$/;

// Hours ready to save: up to 999.99, at most two decimals, or empty
export function isValidHours(value) {
  return value === "" || /^\d{1,3}(\.\d{1,2})?$/.test(value);
}

// hours x rate x multiplier, worked out in whole cents so the result is
// rounded to the nearest cent without floating-point drift
export function lineAmountCents(hours, rate, multiplier) {
  const hundredthsOfHours = Math.round(Number(hours) * 100);
  const rateCents = Math.round(Number(rate) * 100);
  const halfSteps = multiplier * 2; // 1x -> 2, 1.5x -> 3, 2x -> 4
  return Math.round((hundredthsOfHours * rateCents * halfSteps) / 200);
}

// Line amounts and gross pay (all in cents) for an hours entry
export function calculatePay(hours, rate) {
  const lines = earningTypes.map((type) => {
    const lineHours = Number(hours[type]) || 0;
    return {
      type,
      hours: lineHours,
      rate: Number(rate) * multipliers[type],
      cents: lineAmountCents(lineHours, rate, multipliers[type]),
    };
  });

  return {
    lines,
    grossCents: lines.reduce((sum, line) => sum + line.cents, 0),
  };
}
