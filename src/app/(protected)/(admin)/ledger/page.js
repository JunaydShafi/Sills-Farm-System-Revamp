"use client";

import { useState } from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";
import SidebarLayout, { PageTitle, Pagination } from "@/app/SidebarLayout";

const demoEntries = [
  { id: 1, trans: "1001", bank: "1001", type: "DEP", date: "09/14/26", account: "1010", description: "Black bean sales receipt", debit: "4,800.00", credit: "" },
  { id: 2, trans: "1001", bank: "1001", type: "DEP", date: "09/14/26", account: "4000", description: "Black bean sales revenue", debit: "", credit: "4,800.00" },
  { id: 3, trans: "1002", bank: "1001", type: "CHK", date: "09/15/26", account: "5100", description: "Pea seed purchase", debit: "1,250.00", credit: "" },
  { id: 4, trans: "1002", bank: "1001", type: "CHK", date: "09/15/26", account: "1010", description: "Pea seed payment", debit: "", credit: "1,250.00" },
  { id: 5, trans: "1003", bank: "1001", type: "DEP", date: "09/16/26", account: "1010", description: "Split pea sales receipt", debit: "3,200.00", credit: "" },
  { id: 6, trans: "1003", bank: "1001", type: "DEP", date: "09/16/26", account: "4000", description: "Split pea sales revenue", debit: "", credit: "3,200.00" },
];

const initialFilters = {
  account: "View all accounts",
  year: "2026",
  quarter: "All",
  beginningDate: "01/01/2026",
  endDate: "12/31/2026",
};

const cellStyle = "border-x border-gray-300 px-2 py-1.5";
const headStyle = `${cellStyle} border-b border-gray-400 py-1.5 font-bold`;

const inputStyle =
  "mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm font-normal text-black outline-none focus:border-emerald-600";

const buttonStyle =
  "rounded-md border border-gray-400 bg-white px-6 py-1.5 text-sm font-semibold text-green-950 hover:bg-emerald-50";

function ReportCheckbox({ label }) {
  return (
    <label className="flex items-center gap-2 text-xs text-black">
      <input type="checkbox" className="h-4 w-4 accent-emerald-600" />
      {label}
    </label>
  );
}

export default function LedgerAccountsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [bankReport, setBankReport] = useState("All");

  function updateFilter(field, value) {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  return (
    <SidebarLayout activeItem={{ label: "Ledger Accounts", href: "/ledger", icon: Landmark }}>
      <PageTitle
        title="Ledger Accounts"
        subtitle="Review general ledger entries and prepare reports."
      />

      {/* Filters */}
      <div className="mb-3 grid grid-cols-2 items-end gap-3 md:grid-cols-[2fr_0.8fr_0.8fr_1.2fr_1.2fr_auto]">
        <label className="text-sm font-bold text-black">
          Account
          <select
            value={filters.account}
            onChange={(event) => updateFilter("account", event.target.value)}
            className={inputStyle}
          >
            <option>View all accounts</option>
            <option>1010 · Operating Cash</option>
            <option>4000 · Sales Revenue</option>
            <option>5100 · Seed Expense</option>
          </select>
        </label>

        <label className="text-sm font-bold text-black">
          Year
          <select
            value={filters.year}
            onChange={(event) => updateFilter("year", event.target.value)}
            className={inputStyle}
          >
            <option>2026</option>
            <option>2025</option>
            <option>2024</option>
          </select>
        </label>

        <label className="text-sm font-bold text-black">
          Quarter
          <select
            value={filters.quarter}
            onChange={(event) => updateFilter("quarter", event.target.value)}
            className={inputStyle}
          >
            <option>All</option>
            <option>Q1</option>
            <option>Q2</option>
            <option>Q3</option>
            <option>Q4</option>
          </select>
        </label>

        <label className="text-sm font-bold text-black">
          Beginning date
          <input
            type="text"
            value={filters.beginningDate}
            onChange={(event) => updateFilter("beginningDate", event.target.value)}
            className={inputStyle}
          />
        </label>

        <label className="text-sm font-bold text-black">
          End date
          <input
            type="text"
            value={filters.endDate}
            onChange={(event) => updateFilter("endDate", event.target.value)}
            className={inputStyle}
          />
        </label>

        <button
          type="button"
          onClick={() => setFilters(initialFilters)}
          className={`${buttonStyle} px-5 py-1.5`}
        >
          Refresh
        </button>
      </div>

      {/* Ledger entries table */}
      <div className="overflow-x-auto border border-gray-400">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs text-black">
          <thead>
            <tr className="bg-gray-100">
              {["Trans #", "Bank #", "Type", "Date", "Account", "Description"].map((heading) => (
                <th key={heading} className={headStyle}>{heading}</th>
              ))}
              <th className={`${headStyle} text-right`}>Debit</th>
              <th className={`${headStyle} text-right`}>Credit</th>
              <th className={`${headStyle} text-center`}>Archived</th>
            </tr>
          </thead>
          <tbody>
            {demoEntries.map((entry) => (
              <tr key={entry.id} className="even:bg-gray-100">
                <td className={cellStyle}>{entry.trans}</td>
                <td className={cellStyle}>{entry.bank}</td>
                <td className={cellStyle}>{entry.type}</td>
                <td className={cellStyle}>{entry.date}</td>
                <td className={cellStyle}>{entry.account}</td>
                <td className={cellStyle}>{entry.description}</td>
                <td className={`${cellStyle} text-right`}>{entry.debit || "—"}</td>
                <td className={`${cellStyle} text-right`}>{entry.credit || "—"}</td>
                <td className={`${cellStyle} text-center`}>
                  <input type="checkbox" className="h-4 w-4 accent-emerald-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-700">
        <p>Showing {demoEntries.length} ledger entries</p>
        <p className="flex gap-10 pr-[70px] text-sm font-bold">
          <span className="text-black">Totals</span>
          <span className="text-emerald-700">9,250.00</span>
          <span className="text-emerald-700">9,250.00</span>
        </p>
      </div>

      {/* Report options */}
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1.5fr]">
        <div className="rounded-md border border-gray-300 bg-gray-50 p-3">
          <h3 className="mb-2 text-sm font-bold text-black">Banking Reports</h3>
          <div className="mb-2 flex gap-4">
            <ReportCheckbox label="Deposits" />
            <ReportCheckbox label="Bank Accounts" />
          </div>
          <select
            value={bankReport}
            onChange={(event) => setBankReport(event.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-black outline-none focus:border-emerald-600"
          >
            <option>All</option>
            <option>1001 · Operating Checking</option>
            <option>1002 · Farm Savings</option>
            <option>1003 · Payroll Checking</option>
          </select>
        </div>

        <div className="rounded-md border border-gray-300 bg-gray-50 p-3">
          <h3 className="mb-2 text-sm font-bold text-black">T-Account Reports</h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2">
            <ReportCheckbox label="Chart of Accounts" />
            <ReportCheckbox label="Balance Sheet" />
            <span />
            <ReportCheckbox label="All" />
            <ReportCheckbox label="Income" />
            <ReportCheckbox label="Expense" />
            <ReportCheckbox label="Assets" />
            <ReportCheckbox label="Liabilities" />
            <ReportCheckbox label="Equity" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonStyle}>Print Reports</button>
          <button type="button" className={`${buttonStyle} px-10`}>Archive</button>
          <button
            type="button"
            className="rounded-md border border-emerald-700 bg-emerald-600 px-14 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Post
          </button>
        </div>

        <Link
          href="/main-dashboard"
          className="rounded-md border border-gray-800 bg-white px-10 py-1.5 text-sm font-semibold text-black hover:bg-gray-100"
        >
          Exit
        </Link>
      </div>
    </SidebarLayout>
  );
}
