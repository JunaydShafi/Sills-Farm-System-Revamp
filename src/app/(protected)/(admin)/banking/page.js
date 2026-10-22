"use client";

import { useState } from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";
import SidebarLayout, { PageTitle, Pagination } from "@/app/SidebarLayout";

const demoTransactions = [
  { date: "09/14/26", ref: "DEP-1001", type: "Deposit", description: "Black bean sales", deposit: "4,800.00", payment: "", balance: "29,800.00" },
  { date: "09/15/26", ref: "CHK-2001", type: "Check", description: "Pea seed purchase", deposit: "", payment: "1,250.00", balance: "28,550.00" },
  { date: "09/16/26", ref: "DEP-1002", type: "Deposit", description: "Split pea sales", deposit: "3,200.00", payment: "", balance: "31,750.00" },
  { date: "09/17/26", ref: "CHK-2002", type: "Check", description: "Packaging supplies", deposit: "", payment: "860.00", balance: "30,890.00" },
  { date: "09/18/26", ref: "TRF-3001", type: "Transfer", description: "Transfer to savings", deposit: "", payment: "2,400.00", balance: "28,490.00" },
  { date: "09/21/26", ref: "DEP-1003", type: "Deposit", description: "Pinto bean sales", deposit: "5,600.00", payment: "", balance: "34,090.00" },
  { date: "09/22/26", ref: "CHK-2003", type: "Check", description: "Freight payment", deposit: "", payment: "725.00", balance: "33,365.00" },
  { date: "09/23/26", ref: "DEP-1004", type: "Deposit", description: "Green pea sales", deposit: "2,100.00", payment: "", balance: "35,465.00" },
];

const cellStyle = "border-x border-gray-300 px-2 py-1.5";

const buttonStyle =
  "rounded-md border border-gray-400 bg-white px-5 py-1.5 text-sm font-semibold text-green-950 hover:bg-emerald-50";

export default function ViewBankingPage() {
  const [account, setAccount] = useState("1001 · Operating Checking");

  return (
    <SidebarLayout activeItem={{ label: "View Banking", href: "/banking", icon: Landmark }}>
      <PageTitle
        title="View Banking"
        subtitle="Review account transactions and balances."
      />

      {/* Account selection */}
      <label className="mb-4 flex items-center gap-5 text-sm font-bold text-black">
        Account
        <select
          value={account}
          onChange={(event) => setAccount(event.target.value)}
          className="w-full max-w-[330px] rounded-md border border-gray-300 bg-white px-3 py-1.5 font-normal text-black outline-none focus:border-emerald-600"
        >
          <option>1001 · Operating Checking</option>
          <option>1002 · Farm Savings</option>
          <option>1003 · Payroll Checking</option>
        </select>
      </label>

      {/* Transactions table */}
      <div className="overflow-x-auto border border-gray-400">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs text-black">
          <thead>
            <tr className="bg-gray-100">
              {["Date", "Ref #", "Type", "Description"].map((heading) => (
                <th key={heading} className={`${cellStyle} border-b border-gray-400 py-2 font-bold`}>
                  {heading}
                </th>
              ))}
              {["Deposit", "Payment", "Balance"].map((heading) => (
                <th key={heading} className={`${cellStyle} border-b border-gray-400 py-2 text-right font-bold`}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {demoTransactions.map((transaction) => (
              <tr key={transaction.ref} className="even:bg-gray-100">
                <td className={cellStyle}>{transaction.date}</td>
                <td className={cellStyle}>{transaction.ref}</td>
                <td className={cellStyle}>{transaction.type}</td>
                <td className={cellStyle}>{transaction.description}</td>
                <td className={`${cellStyle} text-right text-emerald-700`}>
                  {transaction.deposit || <span className="text-gray-700">—</span>}
                </td>
                <td className={`${cellStyle} text-right`}>
                  {transaction.payment || "—"}
                </td>
                <td className={`${cellStyle} text-right`}>{transaction.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-700">
        <p>Showing {demoTransactions.length} transactions</p>
        <p className="text-sm font-bold text-emerald-700">
          Balance: $35,465.00
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-300 pt-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-emerald-700 bg-emerald-600 px-10 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Details
          </button>
          <button type="button" className={buttonStyle}>Bank Transfers</button>
          <button type="button" className={buttonStyle}>Misc Transaction</button>
          <button type="button" className={buttonStyle}>Write Check</button>
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
