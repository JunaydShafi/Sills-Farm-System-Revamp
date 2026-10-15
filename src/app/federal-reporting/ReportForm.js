
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Search,
  CalendarDays,
  Building2,
  Table2,
  File,
  Printer,
  Download,
} from "lucide-react";
import FarmLayout from "../FarmLayout";

const reportDetails = {
  "1099": {
    title: "1099 Reporting",
    subtitle: "Vendor Payment Reporting",
    description:
      "Generate and review information for Form 1099 based on vendor payments.",
  },
  w2: {
    title: "W-2 Reporting",
    subtitle: "Employee Wage & Tax Reporting",
    description:
      "Generate and review information for Form W-2 based on employee payroll records.",
  },
  "940": {
    title: "Form 940 Reporting",
    subtitle: "Federal Unemployment Tax Reporting",
    description:
      "Generate and review information for Form 940 based on employer payroll records.",
  },
  "943": {
    title: "Form 943 Reporting",
    subtitle: "Agricultural Employer Tax Reporting",
    description:
      "Generate and review information for Form 943 based on agricultural employee payroll records.",
  },
};

export default function ReportForm({ reportType }) {
  const details = reportDetails[reportType];

  const [year, setYear] = useState("2026");
  const [selection, setSelection] = useState("all");
  const [message, setMessage] = useState("");

  if (!details) {
    return null;
  }

  function handleGenerate() {
    setMessage(
      `Sprint 1 prototype: ${details.title} for ${year} is not generated yet. Database integration is planned for Sprint 2.`
    );
  }

  function handleAction(action) {
    setMessage(
      `${action} is not available in this Sprint 1 prototype.`
    );
  }

  return (
    <FarmLayout>
      <section className="mx-auto w-full max-w-5xl rounded-lg border border-gray-300 bg-[#f8f9f6] p-5 shadow-lg">

        {/* Back button and report heading */}
        <div className="relative mb-5 flex min-h-[76px] flex-col items-center justify-center gap-4 md:flex-row">
          <Link
            href="/federal-reporting"
            className="inline-flex items-center gap-2 rounded-md border border-gray-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-green-950 transition hover:bg-emerald-100 md:absolute md:left-0"
          >
            <ArrowLeft size={23} />
            Back
          </Link>

          <div className="flex items-center justify-center gap-4">
            <FileText
              size={37}
              className="shrink-0 text-green-900"
            />

            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-950">
                {details.title}
              </h2>
              <p className="text-sm font-semibold text-black">
                {details.subtitle}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {details.description}
              </p>
            </div>
          </div>
        </div>

        {/* Report criteria and results */}
        <div className="rounded-md border border-gray-500 bg-white p-3">

          {/* Criteria heading */}
          <div className="flex items-center gap-2 rounded-md border border-gray-400 bg-emerald-50 px-3 py-2">
            <Search size={18} />
            <h3 className="font-bold text-black">
              Report Criteria
            </h3>
          </div>

          {/* Criteria fields */}
          <div className="flex flex-wrap items-end gap-4 px-2 py-4">
            <div className="min-w-[180px] flex-1">
              <label
                htmlFor="report-year"
                className="mb-1 block text-sm font-semibold text-black"
              >
                Reporting Year
              </label>

              <div className="flex items-center gap-2 rounded-md border border-gray-400 bg-white px-3">
                <CalendarDays
                  size={18}
                  className="text-green-900"
                />

                <select
                  id="report-year"
                  value={year}
                  onChange={(event) => {
                    setYear(event.target.value);
                    setMessage("");
                  }}
                  className="w-full bg-transparent py-2 text-sm text-black outline-none"
                >
                  <option>2026</option>
                  <option>2025</option>
                  <option>2024</option>
                  <option>2023</option>
                </select>
              </div>
            </div>

            <div className="min-w-[180px] flex-1">
              <label
                htmlFor="report-selection"
                className="mb-1 block text-sm font-semibold text-black"
              >
                {reportType === "1099" ? "Vendor" : "Employee / Payroll"}
              </label>

              <div className="flex items-center gap-2 rounded-md border border-gray-400 bg-white px-3">
                <Building2
                  size={18}
                  className="text-green-900"
                />

                <select
                  id="report-selection"
                  value={selection}
                  onChange={(event) => {
                    setSelection(event.target.value);
                    setMessage("");
                  }}
                  className="w-full bg-transparent py-2 text-sm text-black outline-none"
                >
                  <option value="all">
                    {reportType === "1099"
                      ? "All Vendors"
                      : "All Employees"}
                  </option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-green-900 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <FileText size={20} />
              Generate Report
            </button>
          </div>

          {/* Results heading */}
          <div className="flex items-center justify-between rounded-md border border-gray-400 bg-emerald-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Table2 size={18} />
              <h3 className="font-bold text-black">
                Results
              </h3>
            </div>

            <span className="text-xs text-gray-600">
              0 records
            </span>
          </div>

          {/* Results table */}
          <div className="mt-2 overflow-x-auto rounded-md border border-gray-400">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm text-black">
              <thead>
                <tr className="bg-emerald-50">
                  {(reportType === "1099"
                    ? [
                        "Vendor ID",
                        "Vendor Name",
                        "Tax ID (EIN/SSN)",
                        "Total Payments",
                        "Status",
                      ]
                    : reportType === "w2"
                    ? [
                        "Employee ID",
                        "Employee Name",
                        "Tax Year",
                        "Total Wages",
                        "Status",
                      ]
                    : [
                        "Tax Year",
                        "Reporting Period",
                        "Total Wages",
                        "Tax Amount",
                        "Status",
                      ]
                  ).map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-gray-400 px-3 py-2 font-semibold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>

            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <File
                size={36}
                className="text-gray-600"
              />

              <p className="font-semibold text-gray-700">
                No Results to Display.
              </p>

              <p className="text-xs text-gray-500">
                Select a reporting year and click
                &quot;Generate Report&quot;.
              </p>
            </div>
          </div>
        </div>

        {/* Report actions */}
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => handleAction("View Report")}
            className="inline-flex items-center gap-2 rounded-md border border-gray-500 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100"
          >
            <FileText size={18} />
            View Report
          </button>

          <button
            type="button"
            onClick={() => handleAction("Print")}
            className="inline-flex items-center gap-2 rounded-md border border-gray-500 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100"
          >
            <Printer size={18} />
            Print
          </button>

          <button
            type="button"
            onClick={() => handleAction("Export")}
            className="inline-flex items-center gap-2 rounded-md border border-gray-500 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        {/* Prototype message */}
        {message && (
          <p
            role="status"
            className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-900"
          >
            {message}
          </p>
        )}

        <p className="mt-4 text-center text-xs text-gray-500">
          Sprint 1 prototype — no federal tax records are stored or generated
        </p>
      </section>
    </FarmLayout>
  );
}
