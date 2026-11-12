
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Save,
} from "lucide-react";
import FormWindow, { ExitButton, styles } from "@/app/FormWindow";
import ConfirmDialog from "@/app/ConfirmDialog";
import { apiRequest } from "@/lib/apiClient";
import {
  earningTypes,
  hoursTypingPattern,
  lineAmountCents,
  multipliers,
} from "@/lib/payCalc";

// Active employees come from the database through /api/employees, and saved
// payments go to /api/payroll (SFBMSR-287).

// Split "Jane Q. Doe" into first "Jane Q." and last "Doe" for the list
function toListEmployee(record) {
  const parts = record.name.trim().split(/\s+/);
  const last = parts.length > 1 ? parts.pop() : "";
  return {
    id: record.id,
    first: parts.join(" "),
    last,
    rate: Number(record.payRate),
  };
}

const noEmployee = { id: null, first: "", last: "", rate: 0 };

const disabledLook = "disabled:cursor-not-allowed disabled:opacity-50";

// "8." -> "8", "" stays "", "." -> ""
function cleanHours(value) {
  return value === "" || Number.isNaN(Number(value)) ? "" : String(Number(value));
}

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
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [entry, setEntry] = useState(blankPayEntry);
  const [hoursError, setHoursError] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [dialog, setDialog] = useState(null);
  const listItemRefs = useRef([]);

  const employee = employees[selectedIndex] ?? noEmployee;
  const hasEmployees = employees.length > 0;
  const closeDialog = useCallback(() => setDialog(null), []);

  function showMessage(text, tone = "info") {
    setMessage(text);
    setMessageTone(tone);
  }

  // Load active employees, sorted by last name, when the page opens
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { ok, data } = await apiRequest("/api/employees");
      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!ok) {
        setMessage(data.error ?? "Unable to load employees.");
        setMessageTone("error");
        return;
      }

      const active = data.employees
        .filter((record) => record.active === "Active")
        .map(toListEmployee)
        .sort(
          (a, b) =>
            a.last.localeCompare(b.last) || a.first.localeCompare(b.first)
        );

      setEmployees(active);

      if (active.length === 0) {
        setMessage(
          "There are no active employees. Add employees on the Employees page first."
        );
        setMessageTone("info");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
  const canSave = hasEmployees && entryComplete && grossPay > 0 && !saving;

  function showEmployee(newIndex) {
    setSelectedIndex(newIndex);
    setEntry(blankPayEntry());
    setHoursError("");
    showMessage("");
  }

  // Click in the list, or Prev / Next (wraps around at both ends)
  function selectEmployee(newIndex) {
    if (!hasEmployees || saving) {
      return;
    }

    const wrapped = (newIndex + employees.length) % employees.length;

    if (wrapped === selectedIndex) {
      return;
    }

    if (!hasEntry(entry)) {
      showEmployee(wrapped);
      return;
    }

    const next = employees[wrapped];

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
    if (!hoursTypingPattern.test(value)) {
      setHoursError(
        `${type} hours must be a number from 0 to 999.99 with up to two decimal places.`
      );
      return;
    }

    setHoursError("");
    setEntry((previous) => ({
      ...previous,
      hours: { ...previous.hours, [type]: value },
    }));
    showMessage("");
  }

  function updateDate(key, value) {
    setEntry((previous) => ({ ...previous, [key]: value }));
    showMessage("");
  }

  function undoEntry() {
    setEntry(blankPayEntry());
    setHoursError("");
    showMessage(`Pay entry cleared for ${employee.first} ${employee.last}.`);
  }

  // Save the entry as a payroll record. If this employee was already paid
  // for the same period, ask before saving a second payment.
  async function savePayment(confirmDuplicate = false) {
    if (!canSave) {
      return;
    }

    setSaving(true);
    const { ok, data } = await apiRequest("/api/payroll", {
      method: "POST",
      body: JSON.stringify({
        employeeId: employee.id,
        hours: Object.fromEntries(
          earningTypes.map((type) => [type, cleanHours(entry.hours[type])])
        ),
        beginDate: entry.beginDate,
        endDate: entry.endDate,
        payDate: entry.payDate,
        confirmDuplicate,
      }),
    });
    setSaving(false);

    if (ok && data.duplicate) {
      setDialog({
        title: "Already paid for this period",
        message: `${data.error} Save another payment anyway?`,
        cancelLabel: "Cancel",
        confirmLabel: "Save anyway",
        onConfirm: () => {
          setDialog(null);
          savePayment(true);
        },
      });
      return;
    }

    if (!ok) {
      showMessage(data.error ?? "Unable to save the payment. Please try again.", "error");
      return;
    }

    setEntry(blankPayEntry());
    setHoursError("");
    showMessage(
      `Payment of $${money(data.record.gross)} saved for ${data.record.name} (pay date ${data.record.payDate}).`,
      "success"
    );
  }

  return (
    <FormWindow
      showPrototypeNote={false}
      title="Pay Employees"
      icon={Banknote}
      message={message}
      messageTone={messageTone}
      footer={
        <>
          <button
            type="button"
            onClick={() => selectEmployee(selectedIndex - 1)}
            disabled={!hasEmployees || saving}
            className={`${styles.secondaryButton} ${disabledLook}`}
          >
            <ChevronLeft size={18} />
            Prev
          </button>

          <button
            type="button"
            onClick={() => selectEmployee(selectedIndex + 1)}
            disabled={!hasEmployees || saving}
            className={`${styles.secondaryButton} ${disabledLook}`}
          >
            Next
            <ChevronRight size={18} />
          </button>

          <div className="ml-auto flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => savePayment()}
              disabled={!canSave}
              title={
                canSave
                  ? undefined
                  : "Enter hours and valid Begin, End, and Pay Date to save."
              }
              className={`${styles.primaryButton} ${disabledLook}`}
            >
              <Save size={18} />
              {saving ? "Saving…" : "Save Payment"}
            </button>

            <button
              type="button"
              onClick={undoEntry}
              disabled={!hasEmployees || saving}
              className={`${styles.secondaryButton} ${disabledLook}`}
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
            {loading && (
              <li className="px-3 py-3 text-sm text-gray-500">
                Loading employees…
              </li>
            )}
            {!loading && !hasEmployees && (
              <li className="px-3 py-3 text-sm text-gray-500">
                No active employees.
              </li>
            )}
            {employees.map((person, personIndex) => (
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
              {hasEmployees ? `Employee ${selectedIndex + 1} of ${employees.length}` : ""}
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
