"use client";

import { useState } from "react";
import Link from "next/link";
import { Landmark, ArrowLeft, ArrowRight } from "lucide-react";
import SidebarLayout, { PageTitle } from "../SidebarLayout";

const demoAccounts = [
  {
    accountId: "1001",
    accountName: "Operating Checking",
    description: "Primary account for daily farm operations.",
    ledgerAccount: "1010 · Operating Cash",
  },
  {
    accountId: "1002",
    accountName: "Farm Savings",
    description: "Reserve savings for seasonal expenses.",
    ledgerAccount: "1020 · Savings",
  },
  {
    accountId: "1003",
    accountName: "Payroll Checking",
    description: "Account used for employee payroll.",
    ledgerAccount: "1030 · Payroll Cash",
  },
];

const ledgerAccounts = [
  "1010 · Operating Cash",
  "1020 · Savings",
  "1030 · Payroll Cash",
];

const inputStyle =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-emerald-600";

const buttonStyle =
  "rounded-md border border-gray-400 bg-white px-8 py-1.5 text-sm font-semibold text-green-950 hover:bg-emerald-50";

export default function BankAccountsPage() {
  const [index, setIndex] = useState(0);
  const [form, setForm] = useState(demoAccounts[0]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function showAccount(newIndex) {
    const wrappedIndex =
      (newIndex + demoAccounts.length) % demoAccounts.length;

    setIndex(wrappedIndex);
    setForm(demoAccounts[wrappedIndex]);
  }

  return (
    <SidebarLayout activeItem={{ label: "Bank Accounts", href: "/bank-accounts", icon: Landmark }}>
      <PageTitle
        title="Bank Accounts"
        subtitle="Manage bank account details and ledger assignments."
      />

      {/* Account form */}
      <div className="mt-2 space-y-4 rounded-md border border-gray-300 bg-gray-50 px-4 py-5">
        <div className="grid items-center gap-2 md:grid-cols-[130px_1fr]">
          <label htmlFor="accountId" className="text-sm font-bold text-black">
            Account ID
          </label>
          <input
            id="accountId"
            type="text"
            value={form.accountId}
            onChange={(event) => updateField("accountId", event.target.value)}
            className={`${inputStyle} w-full max-w-[140px]`}
          />
        </div>

        <div className="grid items-center gap-2 md:grid-cols-[130px_1fr]">
          <label htmlFor="accountName" className="text-sm font-bold text-black">
            Account name
          </label>
          <input
            id="accountName"
            type="text"
            value={form.accountName}
            onChange={(event) => updateField("accountName", event.target.value)}
            className={`${inputStyle} w-full`}
          />
        </div>

        <div className="grid items-center gap-2 md:grid-cols-[130px_1fr]">
          <label htmlFor="description" className="text-sm font-bold text-black">
            Description
          </label>
          <textarea
            id="description"
            rows={2}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className={`${inputStyle} w-full resize-none`}
          />
        </div>

        <div className="grid items-center gap-2 md:grid-cols-[130px_1fr_auto]">
          <label htmlFor="ledgerAccount" className="text-sm font-bold text-black">
            Ledger account
          </label>
          <select
            id="ledgerAccount"
            value={form.ledgerAccount}
            onChange={(event) => updateField("ledgerAccount", event.target.value)}
            className={`${inputStyle} w-full`}
          >
            {ledgerAccounts.map((account) => (
              <option key={account}>{account}</option>
            ))}
          </select>
          <button type="button" className={`${buttonStyle} px-12`}>
            All
          </button>
        </div>
      </div>

      {/* Record actions */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className={buttonStyle}>Add</button>
        <button
          type="button"
          className="rounded-md border border-emerald-700 bg-emerald-600 px-10 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Update
        </button>
        <button
          type="button"
          className="rounded-md border border-gray-400 bg-white px-10 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => setForm(demoAccounts[index])}
          className={buttonStyle}
        >
          Cancel
        </button>
      </div>

      {/* Record navigation */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-300 pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => showAccount(index - 1)}
            className={`${buttonStyle} flex items-center gap-1 px-5`}
          >
            <ArrowLeft size={14} />
            Previous
          </button>
          <button
            type="button"
            onClick={() => showAccount(index + 1)}
            className={`${buttonStyle} flex items-center gap-1 px-8`}
          >
            Next
            <ArrowRight size={14} />
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
