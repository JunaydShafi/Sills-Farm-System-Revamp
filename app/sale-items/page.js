
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import CustomerLayout from "../CustomerLayout";

// Temporary Sprint 1 data based on the Figma design.
const sampleSaleItems = [
  { code: "S1001", name: "Black Beans", account: "140000", organic: "ORG", status: "Field Run" },
  { code: "S1002", name: "Split Peas", account: "140000", organic: "ORG", status: "Screening" },
  { code: "S1003", name: "Small Red Beans", account: "140000", organic: "ORG", status: "Clean" },
  { code: "S1004", name: "White Corn", account: "140000", organic: "NORG", status: "Screening" },
  { code: "S1005", name: "Yellow Corn", account: "140000", organic: "NORG", status: "Clean" },
  { code: "S1006", name: "Split Peas", account: "144000", organic: "ORG", status: "Clean" },
  { code: "S1007", name: "Black Beans", account: "144000", organic: "NORG", status: "Field Run" },
  { code: "S1008", name: "Split Peas", account: "144000", organic: "ORG", status: "Clean" },
  { code: "S1009", name: "Black Beans", account: "140000", organic: "ORG", status: "Screening" },
  { code: "S1010", name: "Split Peas", account: "140000", organic: "ORG", status: "Screening" },
];

export default function SaleItemsPage() {
  const [search, setSearch] = useState("");

  const filteredItems = sampleSaleItems.filter((item) =>
    `${item.code} ${item.name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const headings = [
    "Sale Item Code",
    "Sale Item Name",
    "Account/ID",
    "Organic/Not Organic",
    "Manufacture Status",
  ];

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-6xl text-black">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold">Sale Items</h2>

          <button
            type="button"
            disabled
            title="New Sale Item functionality is not implemented in Sprint 1"
            className="cursor-not-allowed rounded-lg border border-green-950 bg-[#50966d] px-5 py-3 text-sm font-semibold text-white opacity-80"
          >
            + New Sale Item
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-4 max-w-lg">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for sale item name or code..."
            className="w-full rounded-sm border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-black outline-none focus:border-green-700"
          />
          <Search
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          />
        </div>

        {/* Sale Items table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-500 text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                {headings.map((heading) => (
                  <th
                    key={heading}
                    className="border border-gray-500 px-3 py-3 font-bold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item, index) => (
                <tr
                  key={item.code}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="border-x border-gray-500 px-3 py-3 font-semibold">
                    {item.code}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-3 font-semibold">
                    {item.name}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-3">
                    {item.account}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-3">
                    {item.organic}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-3">
                    {item.status}
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-gray-500 px-4 py-8 text-center"
                  >
                    No sale items match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Temporary pagination display */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p>
            Showing {filteredItems.length ? 1 : 0}-
            {filteredItems.length} of {filteredItems.length} Records
          </p>

          <div className="flex items-center gap-4">
            <span className="rounded-md bg-gray-800 px-3 py-2 text-white">
              1
            </span>
            <span>2</span>
            <span>3</span>
            <span>...</span>
            <span>21</span>
            <span>22</span>
            <span className="rounded-md bg-gray-300 px-3 py-2">
              Next →
            </span>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
