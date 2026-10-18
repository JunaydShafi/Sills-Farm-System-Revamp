// Temp table to view unpaid invoices

"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import FarmLayout from "../FarmLayout";

const invoiceSample = [
    {id: "V001", name: "Valley Farm Supply", invoiceNum: "214214", dueDate: "2026-08-24", description: "This is a sample desc", amountOwed: "400", amountTotal: ""},
    {id: "V002", name: "Nature's Own Pestisides", invoiceNum: "25987", dueDate: "2026-08-24", description: "This is a sample desc", amountOwed: "400", amountTotal: ""},
    {id: "V003", name: "Ron's Distribustions", invoiceNum: "97543", dueDate: "2026-08-24", description: "This is a sample desc", amountOwed: "5234", amountTotal: ""},
    {id: "V004", name: "Harvester Construction", invoiceNum: "21324", dueDate: "2026-08-24", description: "This is a sample desc", amountOwed: "40230", amountTotal: ""},
    {id: "V005", name: "Seed Supply Co", invoiceNum: "658433", dueDate: "2026-08-24", description: "This is a sample desc", amountOwed: "1200", amountTotal: ""}
];

const uniqueValues = (field) =>
  [...new Set(invoiceSample.map((record) => record[field]))];

const initialFilters = {
  name: "",
  invoiceNum: "",
  dueDate: ""
};

function formatDate(dateValue) {
  const [year, month, day] = dateValue.split("-");
  return `${month}/${day}/${year}`;
}

export default function UnpaidInvoicePage() {
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);

    function updateFilter(event) {
        const { name, value } = event.target;
        setFilters((previous) => ({ ...previous, [name]: value }));
    }

    function handleSearch(event) {
        event.preventDefault();
        setAppliedFilters({ ...filters });
    }

    const filteredInvoices = invoiceSample.filter((record) =>
        (!appliedFilters.name || record.name === appliedFilters.name) &&
        (!appliedFilters.invoiceNum || record.invoiceNum === appliedFilters.invoiceNum) &&
        (!appliedFilters.dueDate || record.dueDate === appliedFilters.dueDate)
    );

    const inputStyle =
    "w-full border border-gray-500 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:border-green-700";

    const headings = [
    "Vendor",
    "Invoice #",
    "Due Date",
    "Description",
    "Amount",
    "Total",
  ];

  return (
      <FarmLayout>
        <div className="mx-auto max-w-6xl text-black">
          <h2 className="mb-4 text-3xl font-bold">
            <Banknote size={36}></Banknote>Unpaid Invoices
            
          </h2>
  
          {/* Search filters */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "name", label: "Vendor", options: uniqueValues("name"), all: "All Vendors" },
                { name: "invoiceNum", label: "Invoice", options: uniqueValues("invoiceNum"), all: "All Invoice Numbers" },
              ].map((filter) => (
                <div key={filter.name}>
                  <label htmlFor={filter.name} className="mb-1 block text-sm font-semibold">
                    {filter.label}
                  </label>
                  <select
                    id={filter.name}
                    name={filter.name}
                    value={filters[filter.name]}
                    onChange={updateFilter}
                    className={inputStyle}
                  >
                    <option value="">{filter.all}</option>
                    {filter.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
  
              <button
                type="submit"
                className="rounded-lg border border-green-950 bg-[#50966d] px-6 py-2.5 font-semibold text-white hover:bg-green-700"
              >
                Search
              </button>
            </div>
  
            {/* Date filters */}
            <div className="mt-3 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dueDate" className="mb-1 block text-sm font-semibold">
                  Due Date
                </label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={filters.start}
                  onChange={updateFilter}
                  className={inputStyle}
                />
              </div>
            </div>
          </form>
  
          {/* Invoice table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-500 text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {headings.map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap border border-gray-500 px-3 py-3 font-bold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
  
              <tbody>
                {filteredInvoices.map((record, index) => (
                  <tr
                    key={record.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                  >
                    <td className="border-x border-gray-500 px-3 py-3 font-semibold">
                      {record.name}
                    </td>
                    <td className="border-x border-gray-500 px-3 py-3 font-semibold">
                      {record.invoiceNum}
                    </td>
                    <td className="border-x border-gray-500 px-3 py-3">{formatDate(record.dueDate)}</td>
                    <td className="border-x border-gray-500 px-3 py-3">{record.description}</td>
                    <td className="border-x border-gray-500 px-3 py-3 text-right font-semibold">
                      ${record.amountOwed}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
  
          {/* Pagination placeholder */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
            <p>
              Showing {filteredInvoices.length ? 1 : 0}-{filteredInvoices.length} of{" "}
              {filteredInvoices.length} Records
            </p>
  
            <div className="flex items-center gap-4">
              <span className="rounded-md bg-gray-800 px-3 py-2 text-white">1</span>
              <span>2</span>
              <span>3</span>
              <span>...</span>
              <span>21</span>
              <span>22</span>
              <span className="rounded-md bg-gray-300 px-3 py-2">Next →</span>
            </div>
          </div>
        </div>
      </FarmLayout>
    );
}