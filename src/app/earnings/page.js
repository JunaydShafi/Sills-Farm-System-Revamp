
"use client";

import { useState } from "react";
import { ChartNoAxesColumn, Filter } from "lucide-react";
import FormWindow, { ExitButton, styles } from "../FormWindow";

// Demo pay records (Sprint 1 - no database yet)
const demoPayRecords = [
  { id: 1, payDate: "2026-01-15", startDate: "2026-01-01", endDate: "2026-01-15", name: "John Doe", payType: "Regular", hours: 80, rate: 22.0 },
  { id: 2, payDate: "2026-01-31", startDate: "2026-01-16", endDate: "2026-01-31", name: "John Doe", payType: "Regular", hours: 80, rate: 22.0 },
  { id: 3, payDate: "2026-01-31", startDate: "2026-01-16", endDate: "2026-01-31", name: "John Doe", payType: "Overtime", hours: 6, rate: 33.0 },
  { id: 4, payDate: "2026-01-15", startDate: "2026-01-01", endDate: "2026-01-15", name: "Jane Doe", payType: "Regular", hours: 80, rate: 24.5 },
  { id: 5, payDate: "2026-02-15", startDate: "2026-02-01", endDate: "2026-02-15", name: "Robert Garcia", payType: "Holiday", hours: 8, rate: 39.5 },
];

const payTypes = ["Regular", "Overtime", "Holiday"];

const columns = [
  { key: "payDate", label: "Pay Date" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "name", label: "Name" },
  { key: "payType", label: "Pay Type" },
  { key: "hours", label: "Hours" },
  { key: "rate", label: "Rate", money: true },
  { key: "total", label: "Total", money: true },
];

const emptyFilters = { fromDate: "", toDate: "", employee: "", payType: "" };

function money(value) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function applyFilters(filters) {
  return demoPayRecords
    .map((row) => ({ ...row, total: row.hours * row.rate }))
    .filter((row) => {
      if (filters.fromDate && row.payDate < filters.fromDate) return false;
      if (filters.toDate && row.payDate > filters.toDate) return false;
      if (
        filters.employee &&
        !row.name.toLowerCase().includes(filters.employee.toLowerCase())
      )
        return false;
      if (filters.payType && row.payType !== filters.payType) return false;
      return true;
    });
}

export default function PayQueryPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [rows, setRows] = useState(() => applyFilters(emptyFilters));

  function updateFilter(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  function handleFilter(event) {
    event.preventDefault();
    setRows(applyFilters(filters));
  }

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <FormWindow
      title="Payroll Query"
      icon={ChartNoAxesColumn}
      footer={
        <div className="ml-auto">
          <ExitButton />
        </div>
      }
    >
      {/* Filter bar */}
      <form
        onSubmit={handleFilter}
        className="mb-4 flex flex-wrap items-end gap-3 rounded-md bg-emerald-600 p-3"
      >
        <div className="w-36">
          <label htmlFor="pq-from" className={styles.filterLabel}>
            From Pay Date
          </label>
          <input
            id="pq-from"
            type="date"
            value={filters.fromDate}
            onChange={(event) => updateFilter("fromDate", event.target.value)}
            className={styles.input}
          />
        </div>

        <div className="w-36">
          <label htmlFor="pq-to" className={styles.filterLabel}>
            To Pay Date
          </label>
          <input
            id="pq-to"
            type="date"
            value={filters.toDate}
            onChange={(event) => updateFilter("toDate", event.target.value)}
            className={styles.input}
          />
        </div>

        <div className="min-w-[180px] flex-1">
          <label htmlFor="pq-employee" className={styles.filterLabel}>
            Employee
          </label>
          <input
            id="pq-employee"
            type="text"
            value={filters.employee}
            onChange={(event) => updateFilter("employee", event.target.value)}
            placeholder="Any employee"
            className={styles.input}
          />
        </div>

        <div className="min-w-[160px] flex-1">
          <label htmlFor="pq-type" className={styles.filterLabel}>
            Pay Type
          </label>
          <select
            id="pq-type"
            value={filters.payType}
            onChange={(event) => updateFilter("payType", event.target.value)}
            className={styles.input}
          >
            <option value="">All Pay Types</option>
            {payTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>

        <button type="submit" className={`${styles.secondaryButton} ml-auto`}>
          <Filter size={18} />
          FILTER
        </button>
      </form>

      {/* Results table */}
      <div className="max-h-[360px] overflow-auto rounded-md border border-gray-500 bg-white">
        <table className="w-full min-w-[760px] border-collapse">
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
                  No pay records match these filters.
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className={styles.tableCell} colSpan={columns.length - 1}>
                Total ({rows.length} records)
              </td>
              <td className={styles.tableCell}>{money(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </FormWindow>
  );
}
