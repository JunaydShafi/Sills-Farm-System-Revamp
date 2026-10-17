// Temporary customer records used for the Sprint 1 prototype.
// Real customer data will be retrieved from the database in a future sprint.

"use client";

import { useState } from "react";
import CustomerLayout from "../CustomerLayout";

// Temporary Sprint 1 records based on the Figma mockup.
const samplePrices = [
  { id: 1, customer: "Amy Kitchen, Inc", product: "Black Beans", size: "20LB", start: "2026-10-01", end: "2027-11-01", price: 14.86 },
  { id: 2, customer: "Amy Kitchen, Inc", product: "Split Peas", size: "25LB", start: "2026-11-01", end: "2027-11-12", price: 43.86 },
  { id: 3, customer: "Amy Kitchen, Inc", product: "Small Red Beans", size: "50LB", start: "2026-01-01", end: "2027-01-28", price: 43.97 },
  { id: 4, customer: "Amy Kitchen, Inc", product: "White Corn", size: "50LB", start: "2026-01-10", end: "2027-01-22", price: 44.00 },
  { id: 5, customer: "Amy Kitchen, Inc", product: "Yellow Corn", size: "50LB", start: "2026-02-01", end: "2027-02-13", price: 46.77 },
  { id: 6, customer: "Amy Kitchen, Inc", product: "Split Peas", size: "50LB", start: "2026-04-02", end: "2027-04-30", price: 50.23 },
  { id: 7, customer: "Amy Kitchen, Inc", product: "Black Beans", size: "50LB", start: "2026-04-15", end: "2027-04-28", price: 53.12 },
  { id: 8, customer: "Amy Kitchen, Inc", product: "Split Peas", size: "50LB", start: "2026-05-01", end: "2027-05-31", price: 53.66 },
  { id: 9, customer: "Amy Kitchen, Inc", product: "Black Beans", size: "50LB", start: "2026-06-01", end: "2027-06-30", price: 55.27 },
  { id: 10, customer: "Amy Kitchen, Inc", product: "Split Peas", size: "50LB", start: "2026-07-18", end: "2027-07-31", price: 58.96 },
];


const uniqueValues = (field) =>
  [...new Set(samplePrices.map((record) => record[field]))];

const initialFilters = {
  customer: "",
  product: "",
  size: "",
  start: "",
  end: "",
};

function formatDate(dateValue) {
  const [year, month, day] = dateValue.split("-");
  return `${month}/${day}/${year}`;
}

export default function CustomerPriceListPage() {
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

  const filteredPrices = samplePrices.filter((record) =>
    (!appliedFilters.customer || record.customer === appliedFilters.customer) &&
    (!appliedFilters.product || record.product === appliedFilters.product) &&
    (!appliedFilters.size || record.size === appliedFilters.size) &&
    (!appliedFilters.start || record.start >= appliedFilters.start) &&
    (!appliedFilters.end || record.end <= appliedFilters.end)
  );

  const inputStyle =
    "w-full border border-gray-500 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:border-green-700";

  const headings = [
    "Customer",
    "Product",
    "Size",
    "Start Date",
    "End Date",
    "Adjusted Price",
  ];

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-6xl text-black">
        <h2 className="mb-4 text-3xl font-bold">
          Customer Price List
        </h2>

        {/* Search filters */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "customer", label: "Customer", options: uniqueValues("customer"), all: "All Customers" },
              { name: "product", label: "Product", options: uniqueValues("product"), all: "All Products" },
              { name: "size", label: "Size", options: uniqueValues("size"), all: "All Sizes" },
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
              <label htmlFor="start" className="mb-1 block text-sm font-semibold">
                Start Date
              </label>
              <input
                id="start"
                name="start"
                type="date"
                value={filters.start}
                onChange={updateFilter}
                className={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="end" className="mb-1 block text-sm font-semibold">
                End Date
              </label>
              <input
                id="end"
                name="end"
                type="date"
                min={filters.start || undefined}
                value={filters.end}
                onChange={updateFilter}
                className={inputStyle}
              />
            </div>
          </div>
        </form>

        {/* Price table */}
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
              {filteredPrices.map((record, index) => (
                <tr
                  key={record.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="border-x border-gray-500 px-3 py-3 font-semibold">
                    {record.customer}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-3 font-semibold">
                    {record.product}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-3">{record.size}</td>
                  <td className="border-x border-gray-500 px-3 py-3">{formatDate(record.start)}</td>
                  <td className="border-x border-gray-500 px-3 py-3">{formatDate(record.end)}</td>
                  <td className="border-x border-gray-500 px-3 py-3 text-right font-semibold">
                    ${record.price.toFixed(2)}
                  </td>
                </tr>
              ))}

              {filteredPrices.length === 0 && (
                <tr>
                  <td colSpan={6} className="border border-gray-500 px-4 py-8 text-center">
                    No customer prices match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p>
            Showing {filteredPrices.length ? 1 : 0}-{filteredPrices.length} of{" "}
            {filteredPrices.length} Records
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
    </CustomerLayout>
  );
}
