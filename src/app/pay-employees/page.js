
"use client";

import { useState } from "react";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import FormWindow, { ExitButton, styles } from "../FormWindow";

// Demo employee list (Sprint 1 - no database yet)
const demoEmployees = [
  { id: 1, last: "Doe", first: "John", rate: 22.0 },
  { id: 2, last: "Doe", first: "Jane", rate: 24.5 },
  { id: 3, last: "Garcia", first: "Robert", rate: 19.75 },
  { id: 4, last: "Smith", first: "Maria", rate: 21.0 },
];

const earningTypes = ["Regular", "Overtime", "Holiday"];

function blankPayEntry(employee) {
  return {
    hours: {
      Regular: "",
      Overtime: "",
      Holiday: "",
    },
    rate: employee.rate,
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

export default function PayEmployeesPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [entry, setEntry] = useState(blankPayEntry(demoEmployees[0]));
  const [message, setMessage] = useState("");

  const employee = demoEmployees[selectedIndex];

  // Overtime pays 1.5x, holiday pays 2x (placeholder rules for the prototype)
  const multipliers = { Regular: 1, Overtime: 1.5, Holiday: 2 };

  const lines = earningTypes.map((type) => {
    const hours = Number(entry.hours[type]) || 0;
    const rate = entry.rate * multipliers[type];
    return { type, hours, rate, amount: hours * rate };
  });

  const grossPay = lines.reduce((sum, line) => sum + line.amount, 0);
  const totalTax = 0; // Tax calculations come with the payroll backend
  const netPay = grossPay - totalTax;

  function selectEmployee(newIndex) {
    const wrapped =
      (newIndex + demoEmployees.length) % demoEmployees.length;
    setSelectedIndex(wrapped);
    setEntry(blankPayEntry(demoEmployees[wrapped]));
    setMessage("");
  }

  function updateHours(type, value) {
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
    setEntry(blankPayEntry(employee));
    setMessage("Pay entry cleared.");
  }

  const dateFields = [
    { key: "beginDate", label: "Begin" },
    { key: "endDate", label: "End" },
    { key: "payDate", label: "Pay Date" },
  ];

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
          <div className="flex items-center gap-3 rounded-md border border-gray-400 bg-white px-3 py-2">
            <span className="text-sm font-bold">Name</span>
            <span className="text-sm">
              {employee.first} {employee.last}
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
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
                        </td>
                        <td className="border border-gray-300 px-1 py-1">
                          <input
                            type="number"
                            min="0"
                            step="0.25"
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
                        <td className="border border-gray-300 px-2 py-1">
                          {money(line.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pay period dates */}
            <div className="self-end overflow-hidden rounded-md border border-gray-400 bg-white">
              {dateFields.map((field) => (
                <div
                  key={field.key}
                  className="grid grid-cols-[80px_1fr] border-b border-gray-300 last:border-b-0"
                >
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
                    onChange={(event) =>
                      updateDate(field.key, event.target.value)
                    }
                    className="px-1 text-xs text-black outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
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
                  <span className="px-2 py-2 text-sm">{money(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FormWindow>
  );
}
