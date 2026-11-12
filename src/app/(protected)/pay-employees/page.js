
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import FormWindow, { ExitButton, styles } from "../../FormWindow";
import ConfirmDialog from "../../ConfirmDialog";

// Demo employee list (no database yet)
const demoEmployees = [
  { id: 1, last: "Doe", first: "John", rate: 22.0 },
  { id: 2, last: "Doe", first: "Jane", rate: 24.5 },
  { id: 3, last: "Garcia", first: "Robert", rate: 19.75 },
  { id: 4, last: "Smith", first: "Maria", rate: 21.0 },
];

const earningTypes = ["Regular", "Overtime", "Holiday"];

// Regular pays 1x, overtime 1.5x, holiday 2x
const multipliers = { Regular: 1, Overtime: 1.5, Holiday: 2 };

// Non-negative number with up to two decimals (partial input like "8." is
// allowed while typing)
const hoursPattern = /^\d*\.?\d{0,2}$/;

const dateFields = [
  { key: "beginDate", label: "Begin" },
  { key: "endDate", label: "End" },
  { key: "payDate", label: "Pay Date" },
];

function blankPayEntry() {
  return {
    hours: {
      Regular: "",
      Overtime: "",
      Holiday: "",
    },
    beginDate: "",
    endDate: "",
    payDate: "",
  };
}

function money(value) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// hours x rate x multiplier, worked out in whole cents so the result is
// rounded to the nearest cent without floating-point drift
function lineAmountCents(hours, rate, multiplier) {
  const hundredthsOfHours = Math.round(hours * 100);
  const rateCents = Math.round(rate * 100);
  const halfSteps = multiplier * 2; // 1x -> 2, 1.5x -> 3, 2x -> 4
  return Math.round((hundredthsOfHours * rateCents * halfSteps) / 200);
}

function hasEntry(entry) {
  return (
    earningTypes.some((type) => entry.hours[type] !== "") ||
    dateFields.some((field) => entry[field.key] !== "")
  );
}

function dateErrors(entry) {
  if (!hasEntry(entry)) {
    return {};
  }

  const errors = {};

  for (const field of dateFields) {
    if (!entry[field.key]) {
      errors[field.key] = "Required.";
    }
  }

  if (entry.beginDate && entry.endDate && entry.endDate < entry.beginDate) {
    errors.endDate = "End cannot be before Begin.";
  }

  return errors;
}

export default function PayEmployeesPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [entry, setEntry] = useState(blankPayEntry);
  const [hoursError, setHoursError] = useState("");
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState(null);
  const listItemRefs = useRef([]);

  const employee = demoEmployees[selectedIndex];
  const closeDialog = useCallback(() => setDialog(null), []);

  // Keep the selected employee visible in the list
  useEffect(() => {
    listItemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const lines = earningTypes.map((type) => {
    const hours = Number(entry.hours[type]) || 0;
    const cents = lineAmountCents(hours, employee.rate, multipliers[type]);
    return {
      type,
      hours,
      rate: employee.rate * multipliers[type],
      amount: cents / 100,
      cents,
    };
  });

  const grossPay = lines.reduce((sum, line) => sum + line.cents, 0) / 100;
  const totalTax = 0; // Tax calculations come with the payroll backend
  const netPay = grossPay - totalTax;

  const errors = dateErrors(entry);
  const entryStarted = hasEntry(entry);
  const entryComplete = entryStarted && Object.keys(errors).length === 0;

  function showEmployee(newIndex) {
    setSelectedIndex(newIndex);
    setEntry(blankPayEntry());
    setHoursError("");
    setMessage("");
  }

  // Click in the list, or Prev / Next (wraps around at both ends)
  function selectEmployee(newIndex) {
    const wrapped =
      (newIndex + demoEmployees.length) % demoEmployees.length;

    if (wrapped === selectedIndex) {
      return;
    }

    if (!hasEntry(entry)) {
      showEmployee(wrapped);
      return;
    }

    const next = demoEmployees[wrapped];

    setDialog({
      title: "Change employee",
      message: `The pay entry for ${employee.first} ${employee.last} will be cleared. Switch to ${next.first} ${next.last}?`,
      cancelLabel: "Keep entry",
      confirmLabel: "Clear and switch",
      onConfirm: () => {
        setDialog(null);
        showEmployee(wrapped);
      },
    });
  }

  function updateHours(type, value) {
    if (!hoursPattern.test(value)) {
      setHoursError(
        `${type} hours must be a number of 0 or more with up to two decimal places.`
      );
      return;
    }

    setHoursError("");
    setEntry((previous) => ({
      ...previous,
      hours: { ...previous.hours, [type]: value },
    }));
    setMessage("");
  }

  function updateDate(key, value) {
    setEntry((previous) => ({ ...previous, [key]: value }));
    setMessage("");
  }

  function undoEntry() {
    setEntry(blankPayEntry());
    setHoursError("");
    setMessage(`Pay entry cleared for ${employee.first} ${employee.last}.`);
  }

  return (
    <FormWindow
      title="Pay Employees"
      icon={Banknote}
      message={message}
      footer={
        <>
          <button
            type="button"
            onClick={() => selectEmployee(selectedIndex - 1)}
            className={styles.secondaryButton}
          >
            <ChevronLeft size={18} />
            Prev
          </button>

          <button
            type="button"
            onClick={() => selectEmployee(selectedIndex + 1)}
            className={styles.secondaryButton}
          >
            Next
            <ChevronRight size={18} />
          </button>

          <div className="ml-auto flex flex-wrap gap-3">
            <button
              type="button"
              onClick={undoEntry}
              className={styles.secondaryButton}
            >
              <RotateCcw size={18} />
              Undo Entry
            </button>

            <ExitButton />
          </div>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        {/* Select an Employee */}
        <div className="rounded-md border border-gray-400 bg-white">
          <h3 className="border-b border-gray-300 px-3 py-2 text-center text-sm font-bold">
            Select an Employee
          </h3>

          <div className="grid grid-cols-2 border-b border-gray-300 bg-emerald-50 text-xs font-bold">
            <span className="px-3 py-1.5">Last</span>
            <span className="border-l border-gray-300 px-3 py-1.5">
              First
            </span>
          </div>

          <ul className="h-64 overflow-y-auto">
            {demoEmployees.map((person, personIndex) => (
              <li key={person.id}>
                <button
                  ref={(element) => {
                    listItemRefs.current[personIndex] = element;
                  }}
                  type="button"
                  onClick={() => selectEmployee(personIndex)}
                  aria-pressed={personIndex === selectedIndex}
                  className={`grid w-full grid-cols-2 text-left text-sm ${
                    personIndex === selectedIndex
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-emerald-50"
                  }`}
                >
                  <span className="px-3 py-1">{person.last}</span>
                  <span className="px-3 py-1">{person.first}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Pay entry for the selected employee */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-gray-400 bg-white px-3 py-2">
            <span className="text-sm">
              <span className="font-bold">Name</span>{" "}
              <span data-testid="pay-employee-name">
                {employee.first} {employee.last}
              </span>
            </span>
            <span className="text-sm">
              <span className="font-bold">Pay Rate</span>{" "}
              <span data-testid="pay-employee-rate">
                ${money(employee.rate)} / hr
              </span>
            </span>
            <span className="ml-auto text-xs text-gray-600">
              Employee {selectedIndex + 1} of {demoEmployees.length}
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            {/* Enter Employee Hours */}
            <div>
              <h3 className="mb-1 text-sm font-bold">
                Enter Employee Hours
              </h3>

              <div className="overflow-x-auto rounded-md border border-gray-400 bg-white">
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-emerald-600 text-left text-white">
                      {["Earnings", "Hours", "Rate", "Amount"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="border border-gray-300 px-2 py-1.5 font-semibold"
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.type}>
                        <td className="border border-gray-300 px-2 py-1">
                          {line.type}
                          {line.type !== "Regular" && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({multipliers[line.type]}x)
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-1 py-1">
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={entry.hours[line.type]}
                            onChange={(event) =>
                              updateHours(line.type, event.target.value)
                            }
                            aria-label={`${line.type} hours`}
                            className={styles.input}
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {money(line.rate)}
                        </td>
                        <td
                          className="border border-gray-300 px-2 py-1"
                          data-testid={`amount-${line.type}`}
                        >
                          {money(line.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {hoursError && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-700">
                  {hoursError}
                </p>
              )}
            </div>

            {/* Pay period dates */}
            <div className="self-end">
              <div className="overflow-hidden rounded-md border border-gray-400 bg-white">
                {dateFields.map((field) => (
                  <div
                    key={field.key}
                    className="border-b border-gray-300 last:border-b-0"
                  >
                    <div className="grid grid-cols-[80px_1fr]">
                      <label
                        htmlFor={`pay-${field.key}`}
                        className="bg-emerald-600 px-2 py-2 text-xs font-semibold text-white"
                      >
                        {field.label}
                      </label>
                      <input
                        id={`pay-${field.key}`}
                        type="date"
                        value={entry[field.key]}
                        min={field.key === "endDate" ? entry.beginDate || undefined : undefined}
                        aria-invalid={errors[field.key] ? "true" : undefined}
                        aria-describedby={
                          errors[field.key] ? `pay-${field.key}-error` : undefined
                        }
                        onChange={(event) =>
                          updateDate(field.key, event.target.value)
                        }
                        className={`px-1 text-xs text-black outline-none ${
                          errors[field.key] ? "bg-red-50" : ""
                        }`}
                      />
                    </div>
                    {errors[field.key] && (
                      <p
                        id={`pay-${field.key}-error`}
                        className="bg-red-50 px-2 py-1 text-right text-xs font-medium text-red-700"
                      >
                        {errors[field.key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {entryComplete && (
                <p className="mt-1 text-right text-xs font-medium text-emerald-700">
                  Pay period dates are complete.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            {/* Taxes */}
            <div>
              <h3 className="mb-1 text-sm font-bold">Taxes</h3>

              <div className="overflow-hidden rounded-md border border-gray-400 bg-white">
                <div className="grid grid-cols-2 bg-emerald-600 text-sm font-semibold text-white">
                  <span className="px-2 py-1.5">Taxes</span>
                  <span className="border-l border-gray-300 px-2 py-1.5">
                    Amount
                  </span>
                </div>
                <p className="px-3 py-6 text-center text-xs text-gray-500">
                  Tax withholding will be calculated once payroll
                  logic is added.
                </p>
              </div>
            </div>

            {/* Totals */}
            <div className="self-end overflow-hidden rounded-md border border-gray-400 bg-white">
              {[
                ["Gross Pay", grossPay],
                ["Total Tax", totalTax],
                ["Net Pay", netPay],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[80px_1fr] border-b border-gray-300 last:border-b-0"
                >
                  <span className="bg-emerald-600 px-2 py-2 text-xs font-semibold text-white">
                    {label}
                  </span>
                  <span
                    className="px-2 py-2 text-sm"
                    data-testid={`total-${label.replace(" ", "-").toLowerCase()}`}
                  >
                    {money(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog dialog={dialog} onCancel={closeDialog} />
    </FormWindow>
  );
}
