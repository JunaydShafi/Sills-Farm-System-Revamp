"use client";

import { useState } from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";
import SidebarLayout, { PageTitle } from "../SidebarLayout";

const demoTransactions = [
  { id: 1, date: "09/14/26", description: "Black bean sales", deposit: "4,800.00", withdrawal: "" },
  { id: 2, date: "09/15/26", description: "Pea seed purchase", deposit: "", withdrawal: "1,250.00" },
  { id: 3, date: "09/16/26", description: "Split pea sales", deposit: "3,200.00", withdrawal: "" },
  { id: 4, date: "09/17/26", description: "Packaging supplies", deposit: "", withdrawal: "860.00" },
  { id: 5, date: "09/18/26", description: "Transfer to savings", deposit: "", withdrawal: "2,400.00" },
  { id: 6, date: "09/21/26", description: "Pinto bean sales", deposit: "5,600.00", withdrawal: "" },
  { id: 7, date: "09/22/26", description: "Freight payment", deposit: "", withdrawal: "725.00" },
  { id: 8, date: "09/23/26", description: "Green pea sales", deposit: "2,100.00", withdrawal: "" },
];

const cellStyle = "border-x border-gray-300 px-2 py-1.5";
const headStyle = `${cellStyle} border-b border-gray-400 py-1.5 font-bold`;

const inputStyle =
  "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-normal text-black outline-none focus:border-emerald-600";

export default function ReconciliationPage() {
  const [cleared, setCleared] = useState(demoTransactions.map((transaction) => transaction.id));
  const [account, setAccount] = useState("1001 · Operating Checking");
  const [month, setMonth] = useState("September 2026");
  const [beginningBalance, setBeginningBalance] = useState("$25,000.00");

  const allCleared = cleared.length === demoTransactions.length;

  function toggleCleared(id) {
    setCleared((previous) =>
      previous.includes(id)
        ? previous.filter((clearedId) => clearedId !== id)
        : [...previous, id]
    );
  }

  function toggleAll() {
    setCleared(allCleared ? [] : demoTransactions.map((transaction) => transaction.id));
  }

  return (
    <SidebarLayout activeItem={{ label: "Reconciliation", href: "/reconciliation", icon: Landmark }}>
      <PageTitle
        title="Reconciliation"
        subtitle="Review and clear transactions for the selected month."
      />

      {/* Account, month and balance */}
      <div className="mb-3 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <label className="text-sm font-bold text-black">
          Account
          <select
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            className={inputStyle}
          >
            <option>1001 · Operating Checking</option>
            <option>1002 · Farm Savings</option>
            <option>1003 · Payroll Checking</option>
          </select>
        </label>

        <label className="text-sm font-bold text-black">
          Month
          <select
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className={inputStyle}
          >
            <option>July 2026</option>
            <option>August 2026</option>
            <option>September 2026</option>
          </select>
        </label>

        <label className="text-sm font-bold text-black">
          Beginning balance
          <input
            type="text"
            value={beginningBalance}
            onChange={(event) => setBeginningBalance(event.target.value)}
            className={inputStyle}
          />
        </label>
      </div>

      {/* Transactions table */}
      <div className="overflow-x-auto border border-gray-400">
        <table className="w-full min-w-[600px] border-collapse text-left text-xs text-black">
          <thead>
            <tr className="bg-gray-100">
              <th className={`${headStyle} w-[55px] text-center`}>Cleared</th>
              <th className={`${headStyle} w-[80px]`}>Date</th>
              <th className={headStyle}>Description</th>
              <th className={`${headStyle} w-[130px] text-right`}>Deposit</th>
              <th className={`${headStyle} w-[100px] text-right`}>Withdrawal</th>
            </tr>
          </thead>
          <tbody>
            {demoTransactions.map((transaction) => (
              <tr key={transaction.id} className="even:bg-gray-100">
                <td className={`${cellStyle} text-center`}>
                  <input
                    type="checkbox"
                    checked={cleared.includes(transaction.id)}
                    onChange={() => toggleCleared(transaction.id)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                </td>
                <td className={cellStyle}>{transaction.date}</td>
                <td className={cellStyle}>{transaction.description}</td>
                <td className={`${cellStyle} text-right`}>{transaction.deposit || "—"}</td>
                <td className={`${cellStyle} text-right`}>{transaction.withdrawal || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-2 grid grid-cols-[1fr_130px_100px] items-center text-xs">
        <label className="flex items-center gap-2 pl-2 font-bold text-black">
          <input
            type="checkbox"
            checked={allCleared}
            onChange={toggleAll}
            className="h-4 w-4 accent-emerald-600"
          />
          All cleared
        </label>
        <p className="pr-2 text-right font-bold text-emerald-700">15,700.00</p>
        <p className="pr-2 text-right font-bold text-black">5,235.00</p>
      </div>

      <p className="mt-1 text-right text-base font-bold text-emerald-700">
        Ending balance: $35,465.00
      </p>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-400 bg-white px-5 py-1.5 text-sm font-semibold text-green-950 hover:bg-emerald-50"
          >
            Bank Transfers
          </button>
          <button
            type="button"
            className="rounded-md border border-emerald-700 bg-emerald-600 px-10 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
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
