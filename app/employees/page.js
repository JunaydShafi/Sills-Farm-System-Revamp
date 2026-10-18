
"use client";

import { useState } from "react";
import {
  UserRound,
  Plus,
  Save,
  Trash2,
  RotateCcw,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FormWindow, { ExitButton, styles } from "../FormWindow";

// Demo employee records (Sprint 1 - no database yet)
const demoEmployees = [
  {
    employeeId: "001",
    name: "John Doe",
    street: "123 Main St",
    city: "Pleasant Grove",
    state: "CA",
    zip: "95668",
    phone: "916-555-0101",
    active: "Active",
    ssn: "•••-••-1234",
    payRate: "22.00",
    irrPayRate: "NA",
    status: "Active",
    allowances: "000",
    withholding: "001",
    childSupport: "0",
    startDate: "2020-04-20",
    notes: "None",
  },
  {
    employeeId: "002",
    name: "Jane Doe",
    street: "456 Oak Ave",
    city: "Sacramento",
    state: "CA",
    zip: "95814",
    phone: "916-555-0102",
    active: "Active",
    ssn: "•••-••-5678",
    payRate: "24.50",
    irrPayRate: "NA",
    status: "Active",
    allowances: "001",
    withholding: "002",
    childSupport: "0",
    startDate: "2021-06-01",
    notes: "None",
  },
  {
    employeeId: "003",
    name: "Robert Garcia",
    street: "789 Field Rd",
    city: "Rio Linda",
    state: "CA",
    zip: "95673",
    phone: "916-555-0103",
    active: "Inactive",
    ssn: "•••-••-9012",
    payRate: "19.75",
    irrPayRate: "NA",
    status: "Inactive",
    allowances: "000",
    withholding: "000",
    childSupport: "0",
    startDate: "2019-03-15",
    notes: "Seasonal",
  },
];

const emptyEmployee = {
  employeeId: "",
  name: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  active: "Active",
  ssn: "",
  payRate: "",
  irrPayRate: "",
  status: "Active",
  allowances: "",
  withholding: "",
  childSupport: "",
  startDate: "",
  notes: "",
};

// Left column fields
const contactFields = [
  { key: "employeeId", label: "Employee ID:" },
  { key: "name", label: "Employee Name:" },
  { key: "street", label: "Street:" },
  { key: "city", label: "City:" },
  { key: "state", label: "State:" },
  { key: "zip", label: "Zip:" },
  { key: "phone", label: "Phone:", type: "tel" },
  { key: "active", label: "Active:", options: ["Active", "Inactive"] },
];

// Right column fields
const payrollFields = [
  { key: "ssn", label: "SSN:" },
  { key: "payRate", label: "Pay Rate:" },
  { key: "irrPayRate", label: "Irr Pay Rate:" },
  { key: "status", label: "Status:", options: ["Active", "Inactive"] },
  { key: "allowances", label: "Allowances:" },
  { key: "withholding", label: "Withholding:" },
  { key: "childSupport", label: "Child Support:" },
  { key: "startDate", label: "Start Date:", type: "date" },
  { key: "notes", label: "Notes:" },
];

// One labeled row: green label on the left, input on the right
function FieldRow({ field, value, onChange, labelWidth }) {
  const inputId = `employee-${field.key}`;

  return (
    <div className={`grid ${labelWidth} items-center border-b border-gray-300 last:border-b-0`}>
      <label
        htmlFor={inputId}
        className="px-3 py-2 text-sm font-bold text-green-900"
      >
        {field.label}
      </label>

      {field.options ? (
        <select
          id={inputId}
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="h-full w-full min-w-0 border-l border-gray-300 bg-white px-2 py-2 text-sm text-black outline-none focus:bg-emerald-50"
        >
          {field.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={field.type ?? "text"}
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="h-full w-full min-w-0 border-l border-gray-300 bg-white px-2 py-2 text-sm text-black outline-none focus:bg-emerald-50"
        />
      )}
    </div>
  );
}

export default function EmployeesPage() {
  const [index, setIndex] = useState(0);
  const [form, setForm] = useState(demoEmployees[0]);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setMessage("");
  }

  // Move to another demo record (wraps around)
  function goTo(newIndex) {
    const wrapped =
      (newIndex + demoEmployees.length) % demoEmployees.length;
    setIndex(wrapped);
    setForm(demoEmployees[wrapped]);
    setIsNew(false);
    setMessage("");
  }

  function handleAdd() {
    setForm(emptyEmployee);
    setIsNew(true);
    setMessage("Enter the new employee's information, then click Update.");
  }

  function handleUndo() {
    setForm(demoEmployees[index]);
    setIsNew(false);
    setMessage("");
  }

  function showPrototypeMessage(action) {
    setMessage(
      `Sprint 1 prototype: ${action} is not available yet. Database functionality will be added in a future sprint.`
    );
  }

  return (
    <FormWindow
      title="Employees"
      icon={UserRound}
      maxWidth="max-w-5xl"
      message={message}
      footer={
        <>
          <button
            type="button"
            onClick={() => showPrototypeMessage("Print Notification")}
            className={styles.secondaryButton}
          >
            <Printer size={18} />
            Print Notification
          </button>

          <button
            type="button"
            onClick={() =>
              showPrototypeMessage("Print Report of New Employees")
            }
            className={styles.secondaryButton}
          >
            <Printer size={18} />
            Print Report of New Employees
          </button>

          <div className="ml-auto flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className={styles.secondaryButton}
            >
              <ChevronLeft size={18} />
              Prev
            </button>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className={styles.secondaryButton}
            >
              Next
              <ChevronRight size={18} />
            </button>

            <ExitButton />
          </div>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        {/* Contact information + record buttons */}
        <div className="rounded-md border border-gray-400 bg-white">
          {contactFields.map((field) => (
            <FieldRow
              key={field.key}
              field={field}
              value={form[field.key]}
              onChange={updateField}
              labelWidth="grid-cols-[150px_1fr]"
            />
          ))}

          <div className="flex flex-wrap justify-center gap-3 border-t border-gray-300 bg-gray-50 p-3">
            <button
              type="button"
              onClick={handleAdd}
              className={styles.primaryButton}
            >
              <Plus size={18} />
              Add
            </button>

            <button
              type="button"
              onClick={() =>
                showPrototypeMessage(isNew ? "Saving a new employee" : "Update")
              }
              className={styles.primaryButton}
            >
              <Save size={18} />
              Update
            </button>

            <button
              type="button"
              onClick={() => showPrototypeMessage("Delete")}
              className={styles.primaryButton}
            >
              <Trash2 size={18} />
              Delete
            </button>

            <button
              type="button"
              onClick={handleUndo}
              className={styles.primaryButton}
            >
              <RotateCcw size={18} />
              Undo
            </button>
          </div>
        </div>

        {/* Payroll information */}
        <div className="self-start overflow-hidden rounded-md border border-gray-400 bg-white">
          {payrollFields.map((field) => (
            <FieldRow
              key={field.key}
              field={field}
              value={form[field.key]}
              onChange={updateField}
              labelWidth="grid-cols-[130px_1fr]"
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-right text-xs text-gray-600">
        {isNew
          ? "New record"
          : `Record ${index + 1} of ${demoEmployees.length}`}
      </p>
    </FormWindow>
  );
}
