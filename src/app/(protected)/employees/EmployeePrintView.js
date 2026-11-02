"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import { styles } from "@/app/FormWindow";

// Printable views for the Employees page:
//   - "notification": a notice for the current employee
//   - "report": the Report of New Employees (newest start date first)
// The view opens as an on-screen preview. Clicking Print prints only the
// preview, not the rest of the app.

// When printing, hide everything except the preview
const printStyles = `
@media print {
  body > *:not(#employee-print-root) { display: none !important; }
  #employee-print-root {
    position: static !important;
    inset: auto !important;
    background: white !important;
    padding: 0 !important;
    overflow: visible !important;
  }
  #employee-print-root .print-sheet {
    box-shadow: none !important;
    border: none !important;
    max-width: none !important;
  }
  #employee-print-root .no-print { display: none !important; }
}
`;

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRate(value) {
  if (!value) {
    return "—";
  }

  if (value.toUpperCase() === "NA") {
    return "N/A";
  }

  return `$${Number(value).toFixed(2)} per hour`;
}

function fullAddress(employee) {
  return `${employee.street}, ${employee.city}, ${employee.state} ${employee.zip}`;
}

function NotificationContent({ employee }) {
  const rows = [
    ["Employee ID", employee.employeeId],
    ["Employee Name", employee.name],
    ["Address", fullAddress(employee)],
    ["Phone", employee.phone || "—"],
    ["Start Date", formatDate(employee.startDate)],
    ["Pay Rate", formatRate(employee.payRate)],
    ["Irregular Pay Rate", formatRate(employee.irrPayRate)],
    ["Status", employee.status],
    ["Allowances", employee.allowances || "—"],
    ["Withholding", employee.withholding || "—"],
  ];

  return (
    <>
      <h1 className="text-xl font-bold">Employee Notification</h1>
      <p className="mt-1 text-sm">
        This notice confirms the employment and pay information on file for
        the employee named below.
      </p>

      <table className="mt-5 w-full border-collapse text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th className="w-48 border border-gray-400 bg-gray-100 px-3 py-2 text-left font-semibold">
                {label}
              </th>
              <td className="border border-gray-400 px-3 py-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 grid grid-cols-2 gap-10 text-sm">
        {["Employee Signature", "Employer Signature"].map((label) => (
          <div key={label}>
            <div className="h-8 border-b border-black" />
            <p className="mt-1">{label} / Date</p>
          </div>
        ))}
      </div>
    </>
  );
}

function ReportContent({ employees }) {
  const sorted = [...employees].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  return (
    <>
      <h1 className="text-xl font-bold">Report of New Employees</h1>
      <p className="mt-1 text-sm">
        {sorted.length} employee{sorted.length === 1 ? "" : "s"}, sorted by
        start date (newest first).
      </p>

      <table className="mt-5 w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100 text-left">
            {["Employee ID", "Name", "Address", "SSN", "Start Date", "Status"].map(
              (heading) => (
                <th
                  key={heading}
                  className="border border-gray-400 px-2 py-2 font-semibold"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((employee) => (
            <tr key={employee.employeeId}>
              <td className="border border-gray-400 px-2 py-1.5">
                {employee.employeeId}
              </td>
              <td className="border border-gray-400 px-2 py-1.5">
                {employee.name}
              </td>
              <td className="border border-gray-400 px-2 py-1.5">
                {fullAddress(employee)}
              </td>
              <td className="border border-gray-400 px-2 py-1.5">
                {employee.ssn}
              </td>
              <td className="border border-gray-400 px-2 py-1.5">
                {formatDate(employee.startDate)}
              </td>
              <td className="border border-gray-400 px-2 py-1.5">
                {employee.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function EmployeePrintView({
  view,
  employee,
  employees,
  hasUnsavedChanges,
  onClose,
}) {
  // Escape closes the preview
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const title =
    view === "notification" ? "Employee Notification" : "Report of New Employees";

  return createPortal(
    <div
      id="employee-print-root"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} print preview`}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"
    >
      <style>{printStyles}</style>

      <div className="no-print mx-auto mb-3 flex max-w-3xl flex-wrap items-center justify-end gap-3">
        {hasUnsavedChanges && (
          <p className="mr-auto rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Unsaved changes are not included. Click Update first to print them.
          </p>
        )}

        <button
          type="button"
          onClick={() => window.print()}
          className={styles.primaryButton}
        >
          <Printer size={18} />
          Print
        </button>

        <button type="button" onClick={onClose} className={styles.secondaryButton}>
          <X size={18} />
          Close
        </button>
      </div>

      <article className="print-sheet mx-auto max-w-3xl rounded-md border border-gray-300 bg-white p-8 text-black shadow-xl">
        <header className="mb-6 flex items-start justify-between border-b border-gray-400 pb-3">
          <div>
            <p className="text-lg font-bold">Pleasant Grove Farms</p>
            <p className="text-xs text-gray-600">Sills Farm Business Management System</p>
          </div>
          <p className="text-xs text-gray-600">
            Printed {new Date().toLocaleDateString("en-US")}
          </p>
        </header>

        {view === "notification" ? (
          <NotificationContent employee={employee} />
        ) : (
          <ReportContent employees={employees} />
        )}
      </article>
    </div>,
    document.body
  );
}
