
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Plus,
  Save,
  Trash2,
  RotateCcw,
  Printer,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import FormWindow, { ExitButton, styles } from "@/app/FormWindow";
import ConfirmDialog from "@/app/ConfirmDialog";
import EmployeePrintView from "./EmployeePrintView";
import {
  normalizeEmployee,
  requiredFields,
  validateEmployee,
} from "./employeeValidation";

// Demo employee records. Changes are kept in memory only until the database
// is connected (SFBMSR-140), so refreshing the page restores this list.
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

const fieldKeys = Object.keys(emptyEmployee);
const requiredSet = new Set(requiredFields);

// Left column fields
const contactFields = [
  { key: "employeeId", label: "Employee ID:" },
  { key: "name", label: "Employee Name:" },
  { key: "street", label: "Street:" },
  { key: "city", label: "City:" },
  { key: "state", label: "State:", placeholder: "e.g. CA" },
  { key: "zip", label: "Zip:", placeholder: "e.g. 95668" },
  { key: "phone", label: "Phone:", type: "tel", placeholder: "e.g. 916-555-0101" },
  { key: "active", label: "Active:", options: ["Active", "Inactive"] },
];

// Right column fields
const payrollFields = [
  { key: "ssn", label: "SSN:", placeholder: "e.g. 123-45-6789" },
  { key: "payRate", label: "Pay Rate:", placeholder: "e.g. 22.00" },
  { key: "irrPayRate", label: "Irr Pay Rate:", placeholder: "NA or amount" },
  { key: "status", label: "Status:", options: ["Active", "Inactive"] },
  { key: "allowances", label: "Allowances:" },
  { key: "withholding", label: "Withholding:" },
  { key: "childSupport", label: "Child Support:" },
  { key: "startDate", label: "Start Date:", type: "date" },
  { key: "notes", label: "Notes:" },
];

const disabledLook = "disabled:cursor-not-allowed disabled:opacity-50";

function hasChanges(form, saved) {
  return fieldKeys.some((key) => (form[key] ?? "") !== (saved[key] ?? ""));
}

// One labeled row: green label on the left, input on the right, and an error
// message under the input when the value is invalid.
function FieldRow({ field, value, onChange, labelWidth, error, disabled }) {
  const inputId = `employee-${field.key}`;
  const errorId = `${inputId}-error`;
  const inputClass = `h-full w-full min-w-0 border-l border-gray-300 px-2 py-2 text-sm text-black outline-none focus:bg-emerald-50 disabled:bg-gray-100 ${
    error ? "bg-red-50" : "bg-white"
  }`;

  return (
    <div className="border-b border-gray-300 last:border-b-0">
      <div className={`grid ${labelWidth} items-center`}>
        <label
          htmlFor={inputId}
          className="px-3 py-2 text-sm font-bold text-green-900"
        >
          {field.label}
          {requiredSet.has(field.key) && (
            <span className="ml-0.5 text-red-700" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {field.options ? (
          <select
            id={inputId}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(field.key, event.target.value)}
            className={inputClass}
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
            disabled={disabled}
            placeholder={field.placeholder}
            required={requiredSet.has(field.key)}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => onChange(field.key, event.target.value)}
            className={inputClass}
          />
        )}
      </div>

      {error && (
        <div className={`grid ${labelWidth}`}>
          <span />
          <p
            id={errorId}
            className="border-l border-gray-300 bg-red-50 px-2 pb-1.5 text-xs font-medium text-red-700"
          >
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

export default function EmployeesPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState(demoEmployees);
  const [index, setIndex] = useState(0);
  const [form, setForm] = useState(demoEmployees[0]);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [dialog, setDialog] = useState(null);
  const [printView, setPrintView] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isEmpty = employees.length === 0 && !isNew;
  const savedRecord = isNew ? emptyEmployee : employees[index] ?? emptyEmployee;
  const hasUnsavedChanges = !isEmpty && hasChanges(form, savedRecord);

  const closeDialog = useCallback(() => setDialog(null), []);
  const closePrintView = useCallback(() => setPrintView(null), []);

  // Browser leave-page warning when refreshing or closing the tab with
  // unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  function showMessage(text, tone = "info") {
    setMessage(text);
    setMessageTone(tone);
  }

  // Load a record from the list into the form
  function showRecord(recordIndex, list = employees) {
    setIndex(recordIndex);
    setForm(list[recordIndex] ?? emptyEmployee);
    setIsNew(false);
    setErrors({});
  }

  // Run an action right away, or ask first if it would discard unsaved changes
  function confirmDiscardThen(action) {
    if (!hasUnsavedChanges) {
      action();
      return;
    }

    setDialog({
      title: "Unsaved changes",
      message: `You have unsaved changes to ${
        isNew ? "this new employee" : `${savedRecord.name}'s record`
      }. Do you want to discard them?`,
      cancelLabel: "Stay on record",
      confirmLabel: "Discard changes",
      onConfirm: () => {
        setDialog(null);
        action();
      },
    });
  }

  function updateField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) {
        return previous;
      }
      const rest = { ...previous };
      delete rest[key];
      return rest;
    });
    showMessage("");
  }

  // Prev / Next (wraps around at both ends)
  function goTo(newIndex) {
    if (employees.length === 0) {
      return;
    }

    const wrapped = (newIndex + employees.length) % employees.length;

    confirmDiscardThen(() => {
      showRecord(wrapped);
      showMessage("");
    });
  }

  function handleAdd() {
    confirmDiscardThen(() => {
      setForm(emptyEmployee);
      setIsNew(true);
      setErrors({});
      showMessage("Enter the new employee's information, then click Update.");
    });
  }

  function handleUpdate() {
    if (!isNew && !hasUnsavedChanges) {
      showMessage("No changes to save.");
      return;
    }

    const validationErrors = validateEmployee(form);
    const employeeId = form.employeeId.trim();
    const isDuplicateId = employees.some(
      (employee, employeeIndex) =>
        employee.employeeId === employeeId && (isNew || employeeIndex !== index)
    );

    if (employeeId && isDuplicateId) {
      validationErrors.employeeId = `Employee ID ${employeeId} is already in use.`;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showMessage(
        "Please fix the highlighted fields before saving.",
        "error"
      );
      return;
    }

    const saved = normalizeEmployee(form);

    if (isNew) {
      const list = [...employees, saved];
      setEmployees(list);
      showRecord(list.length - 1, list);
      showMessage(`${saved.name} was added to the employee list.`, "success");
      return;
    }

    setEmployees((previous) =>
      previous.map((employee, employeeIndex) =>
        employeeIndex === index ? saved : employee
      )
    );
    setForm(saved);
    setErrors({});
    showMessage(`Changes to ${saved.name} were saved.`, "success");
  }

  function handleDelete() {
    if (isNew || isEmpty) {
      return;
    }

    const record = employees[index];

    setDialog({
      title: "Delete employee",
      message: `Delete ${record.name} (Employee ID ${record.employeeId})? This cannot be undone.`,
      cancelLabel: "Cancel",
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => {
        const list = employees.filter(
          (_employee, employeeIndex) => employeeIndex !== index
        );

        setEmployees(list);
        setDialog(null);

        if (list.length === 0) {
          showRecord(0, list);
          showMessage(
            `${record.name} was deleted. There are no employee records left. Click Add to create one.`,
            "success"
          );
          return;
        }

        // Show the next record, or the previous one if the last was deleted
        showRecord(index < list.length ? index : list.length - 1, list);
        showMessage(`${record.name} was deleted.`, "success");
      },
    });
  }

  function handleUndo() {
    if (isNew) {
      showRecord(Math.min(index, Math.max(employees.length - 1, 0)));
      showMessage("New employee cancelled.");
      return;
    }

    setForm(savedRecord);
    setErrors({});
    showMessage(hasUnsavedChanges ? "Changes undone." : "");
  }

  // Search by Employee ID (exact) or name (partial). Searching again with the
  // same name moves to the next match.
  function handleSearch(event) {
    event.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      showMessage("Enter an employee name or Employee ID to search.", "error");
      return;
    }

    if (employees.length === 0) {
      showMessage("There are no employee records to search.", "error");
      return;
    }

    const isNumber = /^\d+$/.test(query);
    const idMatch = employees.findIndex(
      (employee) =>
        employee.employeeId.toLowerCase() === query.toLowerCase() ||
        (isNumber &&
          /^\d+$/.test(employee.employeeId) &&
          Number(employee.employeeId) === Number(query))
    );

    let matches = idMatch >= 0 ? [idMatch] : [];

    if (matches.length === 0) {
      matches = employees
        .map((employee, employeeIndex) =>
          employee.name.toLowerCase().includes(query.toLowerCase())
            ? employeeIndex
            : -1
        )
        .filter((employeeIndex) => employeeIndex >= 0);
    }

    if (matches.length === 0) {
      showMessage(`No employee found matching "${query}".`, "error");
      return;
    }

    const target =
      !isNew && matches.includes(index)
        ? matches.find((match) => match > index) ?? matches[0]
        : matches[0];

    confirmDiscardThen(() => {
      showRecord(target);
      showMessage(
        matches.length > 1
          ? `Showing match ${matches.indexOf(target) + 1} of ${
              matches.length
            } for "${query}". Search again to see the next match.`
          : `Found ${employees[target].name}.`,
        "success"
      );
    });
  }

  function handleExit(event) {
    if (!hasUnsavedChanges) {
      return;
    }

    event.preventDefault();
    confirmDiscardThen(() => router.push("/main-dashboard"));
  }

  let recordLabel = `Record ${index + 1} of ${employees.length}`;
  if (isNew) {
    recordLabel = "New record";
  } else if (isEmpty) {
    recordLabel = "No employee records";
  }

  return (
    <FormWindow
      title="Employees"
      icon={UserRound}
      maxWidth="max-w-5xl"
      message={message}
      messageTone={messageTone}
      footer={
        <>
          <button
            type="button"
            onClick={() => setPrintView("notification")}
            disabled={isNew || isEmpty}
            className={`${styles.secondaryButton} ${disabledLook}`}
          >
            <Printer size={18} />
            Print Notification
          </button>

          <button
            type="button"
            onClick={() => setPrintView("report")}
            disabled={employees.length === 0}
            className={`${styles.secondaryButton} ${disabledLook}`}
          >
            <Printer size={18} />
            Print Report of New Employees
          </button>

          <div className="ml-auto flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={employees.length === 0}
              className={`${styles.secondaryButton} ${disabledLook}`}
            >
              <ChevronLeft size={18} />
              Prev
            </button>

            <button
              type="button"
              onClick={() => goTo(isNew ? index : index + 1)}
              disabled={employees.length === 0}
              className={`${styles.secondaryButton} ${disabledLook}`}
            >
              Next
              <ChevronRight size={18} />
            </button>

            <ExitButton onNavigate={handleExit} />
          </div>
        </>
      }
    >
      {/* Search */}
      <form
        onSubmit={handleSearch}
        role="search"
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        <label htmlFor="employee-search" className="text-sm font-bold text-green-900">
          Search:
        </label>
        <input
          id="employee-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Employee name or ID"
          className={`${styles.input} max-w-xs`}
        />
        <button type="submit" className={styles.secondaryButton}>
          <Search size={18} />
          Search
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        {/* Contact information + record buttons */}
        <div className="rounded-md border border-gray-400 bg-white">
          {contactFields.map((field) => (
            <FieldRow
              key={field.key}
              field={field}
              value={form[field.key]}
              onChange={updateField}
              error={errors[field.key]}
              disabled={isEmpty}
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
              onClick={handleUpdate}
              disabled={isEmpty}
              className={`${styles.primaryButton} ${disabledLook}`}
            >
              <Save size={18} />
              Update
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isNew || isEmpty}
              title={isNew ? "Save or undo the new employee before deleting." : undefined}
              className={`${styles.primaryButton} ${disabledLook}`}
            >
              <Trash2 size={18} />
              Delete
            </button>

            <button
              type="button"
              onClick={handleUndo}
              disabled={isEmpty}
              className={`${styles.primaryButton} ${disabledLook}`}
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
              error={errors[field.key]}
              disabled={isEmpty}
              labelWidth="grid-cols-[130px_1fr]"
            />
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
        <span>
          <span className="text-red-700">*</span> Required. Changes are kept
          until the page is refreshed (database saving comes later).
        </span>
        <span>
          {hasUnsavedChanges && (
            <span className="mr-2 font-semibold text-amber-700">
              Unsaved changes
            </span>
          )}
          {recordLabel}
        </span>
      </div>

      <ConfirmDialog dialog={dialog} onCancel={closeDialog} />

      {printView && (
        <EmployeePrintView
          view={printView}
          employee={savedRecord}
          employees={employees}
          hasUnsavedChanges={hasUnsavedChanges}
          onClose={closePrintView}
        />
      )}
    </FormWindow>
  );
}
