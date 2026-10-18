"use client";

import { useState } from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";
import SidebarLayout, { PageTitle } from "../SidebarLayout";

const demoInvoiced = [
  { invoice: "INV-1001", customer: "Green Valley Foods", checkDate: "09/22/26", checkNumber: "4101", amountDue: "2,400.00", termDisc: "48.00", amountPaid: "2,352.00" },
  { invoice: "INV-1002", customer: "Harvest Bean Co.", checkDate: "09/23/26", checkNumber: "4102", amountDue: "1,800.00", termDisc: "0.00", amountPaid: "1,800.00" },
  { invoice: "INV-1003", customer: "Garden Pea Market", checkDate: "09/24/26", checkNumber: "4103", amountDue: "3,200.00", termDisc: "64.00", amountPaid: "3,136.00" },
];

const demoOther = [
  { customer: "Green Valley Foods", checkDate: "09/24/26", checkNumber: "4104", description: "Bean sample reimbursement", accountId: "4100", amount: "125.00" },
  { customer: "Garden Pea Market", checkDate: "09/24/26", checkNumber: "4105", description: "Pea delivery reimbursement", accountId: "4100", amount: "85.00" },
];

const initialForm = {
  account: "1001 · Operating Checking",
  depositNumber: "DEP-1005",
  description: "Bean and pea customer payments",
  depositDate: "09/24/2026",
};

const cellStyle = "border-x border-gray-300 px-2 py-1.5";
const headStyle = `${cellStyle} border-b border-gray-400 py-1.5 font-bold`;

const inputStyle =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-black outline-none focus:border-emerald-600";

export default function DepositReceivablesPage() {
  const [form, setForm] = useState(initialForm);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  return (
    <SidebarLayout activeItem={{ label: "Deposits", href: "/receivables", icon: Landmark }}>
      <PageTitle
        title="Deposit Receivables"
        subtitle="Record customer payments and other receivables."
      />

      {/* Deposit details */}
      <div className="mb-4 grid items-center gap-x-4 gap-y-3 text-sm md:grid-cols-[60px_1fr_90px_160px]">
        <label htmlFor="account" className="font-bold text-black">Account</label>
        <select
          id="account"
          value={form.account}
          onChange={(event) => updateField("account", event.target.value)}
          className={inputStyle}
        >
          <option>1001 · Operating Checking</option>
          <option>1002 · Farm Savings</option>
          <option>1003 · Payroll Checking</option>
        </select>

        <label htmlFor="depositNumber" className="font-bold text-black">Deposit #</label>
        <input
          id="depositNumber"
          type="text"
          value={form.depositNumber}
          onChange={(event) => updateField("depositNumber", event.target.value)}
          className={inputStyle}
        />

        <label htmlFor="description" className="font-bold text-black">Description</label>
        <input
          id="description"
          type="text"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          className={inputStyle}
        />

        <label htmlFor="depositDate" className="font-bold text-black">Deposit date</label>
        <input
          id="depositDate"
          type="text"
          value={form.depositDate}
          onChange={(event) => updateField("depositDate", event.target.value)}
          className={inputStyle}
        />
      </div>

      {/* Invoiced receivables */}
      <h3 className="mb-1 font-bold text-black">Invoiced Receivables</h3>
      <div className="mb-4 overflow-x-auto border border-gray-400">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs text-black">
          <thead>
            <tr className="bg-gray-100">
              {["Invoice", "Customer", "Check Date", "Check #"].map((heading) => (
                <th key={heading} className={headStyle}>{heading}</th>
              ))}
              {["Amount Due", "Term Disc.", "Amount Paid"].map((heading) => (
                <th key={heading} className={`${headStyle} text-right`}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demoInvoiced.map((row) => (
              <tr key={row.invoice} className="even:bg-gray-100">
                <td className={cellStyle}>{row.invoice}</td>
                <td className={cellStyle}>{row.customer}</td>
                <td className={cellStyle}>{row.checkDate}</td>
                <td className={cellStyle}>{row.checkNumber}</td>
                <td className={`${cellStyle} text-right`}>{row.amountDue}</td>
                <td className={`${cellStyle} text-right`}>{row.termDisc}</td>
                <td className={`${cellStyle} text-right`}>{row.amountPaid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Other receivables */}
      <h3 className="mb-1 font-bold text-black">Other Receivables</h3>
      <div className="overflow-x-auto border border-gray-400">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs text-black">
          <thead>
            <tr className="bg-gray-100">
              {["Customer", "Check Date", "Check #", "Description", "Account ID"].map((heading) => (
                <th key={heading} className={headStyle}>{heading}</th>
              ))}
              <th className={`${headStyle} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {demoOther.map((row) => (
              <tr key={row.checkNumber} className="even:bg-gray-100">
                <td className={cellStyle}>{row.customer}</td>
                <td className={cellStyle}>{row.checkDate}</td>
                <td className={cellStyle}>{row.checkNumber}</td>
                <td className={cellStyle}>{row.description}</td>
                <td className={cellStyle}>{row.accountId}</td>
                <td className={`${cellStyle} text-right`}>{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-right text-base font-bold text-emerald-700">
        Total deposit: $7,498.00
      </p>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-emerald-700 bg-emerald-600 px-10 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={() => setForm(initialForm)}
            className="rounded-md border border-gray-400 bg-white px-8 py-1.5 text-sm font-semibold text-green-950 hover:bg-emerald-50"
          >
            Clear Form
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
