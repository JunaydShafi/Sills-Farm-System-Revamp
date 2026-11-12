
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Search, FileText } from "lucide-react";
import FormWindow, { ExitButton, styles } from "@/app/FormWindow";
import { apiRequest } from "@/lib/apiClient";

// Payroll records come from PostgreSQL through /api/payroll (SFBMSR-288).
// Tax columns stay 0 until payroll tax calculations are added.

const columns = [
  { key: "name", label: "Name" },
  { key: "payDate", label: "Pay Date" },
  { key: "check", label: "Check #" },
  { key: "gross", label: "Gross", money: true },
  { key: "fica", label: "FICA", money: true },
  { key: "med", label: "Med", money: true },
  { key: "fed", label: "Fed", money: true },
  { key: "sdi", label: "SDI", money: true },
  { key: "childSup", label: "Child Sup", money: true },
  { key: "netPay", label: "Net Pay", money: true },
];

const months = [
  "", "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December",
];

const emptyFilters = {
  beginDate: "",
  endDate: "",
  employee: "",
  year: "",
  quarter: "",
  month: "",
};

function money(value) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Saved payroll record from /api/payroll -> one table row
function toRow(record) {
  return {
    id: record.id,
    name: record.name,
    payDate: record.payDate,
    check: record.checkNumber || "—",
    gross: record.gross,
    fica: record.fica,
    med: record.med,
    fed: record.fed,
    sdi: record.sdi,
    childSup: record.childSup,
    netPay: record.netPay,
  };
}

function applyFilters(records, filters) {
  return records.filter((row) => {
    const date = new Date(`${row.payDate}T00:00:00`);
    const month = date.getMonth() + 1;

    if (filters.beginDate && row.payDate < filters.beginDate) return false;
    if (filters.endDate && row.payDate > filters.endDate) return false;
    if (
      filters.employee &&
      !row.name.toLowerCase().includes(filters.employee.toLowerCase())
    )
      return false;
    if (filters.year && String(date.getFullYear()) !== filters.year)
      return false;
    if (filters.quarter && String(Math.ceil(month / 3)) !== filters.quarter)
      return false;
    if (filters.month && String(month) !== filters.month) return false;

    return true;
  });
}

export default function ViewPayrollPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [records, setRecords] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");

  // Load saved payroll records (newest first) when the page opens
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { ok, data } = await apiRequest("/api/payroll");
      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!ok) {
        setLoadError(data.error ?? "Unable to load payroll records.");
        return;
      }

      const loaded = data.records.map(toRow);
      setRecords(loaded);
      setRows(loaded);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateFilter(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function handleShow(event) {
    event.preventDefault();
    setRows(applyFilters(records, filters));
    setMessage("");
  }

  const totals = columns
    .filter((column) => column.money)
    .reduce((sums, column) => {
      sums[column.key] = rows.reduce((sum, row) => sum + row[column.key], 0);
      return sums;
    }, {});

  return (
    <FormWindow
      showPrototypeNote={false}
      title="View Payroll"
      icon={ClipboardList}
      message={message}
      footer={
        <>
          <Link href="/federal-reporting" className={styles.secondaryButton}>
            <FileText size={18} />
            Fed Dept Rpt
          </Link>

          {["State DE 88", "State DE 6"].map((report) => (
            <button
              key={report}
              type="button"
              onClick={() =>
                setMessage(
                  `Sprint 1 prototype: the ${report} report is not available yet.`
                )
              }
              className={styles.secondaryButton}
            >
              <FileText size={18} />
              {report}
            </button>
          ))}

          <div className="ml-auto">
            <ExitButton />
          </div>
        </>
      }
    >
      {/* Filter bar */}
      <form
        onSubmit={handleShow}
        className="mb-4 flex flex-wrap items-end gap-3 rounded-md bg-emerald-600 p-3"
      >
        <div className="w-36">
          <label htmlFor="vp-begin" className={styles.filterLabel}>
            Begin Date
          </label>
          <input
            id="vp-begin"
            type="date"
            value={filters.beginDate}
            onChange={(event) => updateFilter("beginDate", event.target.value)}
            className={styles.input}
          />
        </div>

        <div className="w-36">
          <label htmlFor="vp-end" className={styles.filterLabel}>
            End Date
          </label>
          <input
            id="vp-end"
            type="date"
            value={filters.endDate}
            onChange={(event) => updateFilter("endDate", event.target.value)}
            className={styles.input}
          />
        </div>

        <div className="min-w-[180px] flex-1">
          <label htmlFor="vp-employee" className={styles.filterLabel}>
            Employee
          </label>
          <input
            id="vp-employee"
            type="text"
            value={filters.employee}
            onChange={(event) => updateFilter("employee", event.target.value)}
            placeholder="Any employee"
            className={styles.input}
          />
        </div>

        <div className="w-24">
          <label htmlFor="vp-year" className={styles.filterLabel}>
            Year
          </label>
          <input
            id="vp-year"
            type="number"
            min="1990"
            max="2100"
            value={filters.year}
            onChange={(event) => updateFilter("year", event.target.value)}
            className={styles.input}
          />
        </div>

        <div className="w-20">
          <label htmlFor="vp-qtr" className={styles.filterLabel}>
            Qtr
          </label>
          <select
            id="vp-qtr"
            value={filters.quarter}
            onChange={(event) => updateFilter("quarter", event.target.value)}
            className={styles.input}
          >
            <option value="">All</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        <div className="w-32">
          <label htmlFor="vp-month" className={styles.filterLabel}>
            Month
          </label>
          <select
            id="vp-month"
            value={filters.month}
            onChange={(event) => updateFilter("month", event.target.value)}
            className={styles.input}
          >
            {months.map((month, monthIndex) => (
              <option key={monthIndex} value={monthIndex || ""}>
                {month || "All"}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className={`${styles.secondaryButton} ml-auto`}>
          <Search size={18} />
          SHOW
        </button>
      </form>

      {/* Payroll table */}
      <div className="max-h-[360px] overflow-auto rounded-md border border-gray-500 bg-white">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={styles.tableHeading}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className={styles.tableCell}>
                    {column.money ? money(row[column.key]) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-sm text-gray-500"
                >
                  {loading
                    ? "Loading payroll records…"
                    : loadError ||
                      (records.length === 0
                        ? "No payroll records yet. Payments saved on Pay Employees appear here."
                        : "No payroll records match these filters.")}
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className={styles.tableCell} colSpan={3}>
                Totals
              </td>
              {columns
                .filter((column) => column.money)
                .map((column) => (
                  <td key={column.key} className={styles.tableCell}>
                    {money(totals[column.key])}
                  </td>
                ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </FormWindow>
  );
}
