
"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import CustomerLayout from "../CustomerLayout";

// Temporary sale item pricing records based on the Sprint 1 Figma design.
// Database integration will be implemented in a future sprint.
const sampleSalePrices = [
  { code: "S1001", name: "Black Beans", size: "25LB", price: 6300, notes: "2014 Price" },
  { code: "S1002", name: "Split Peas", size: "45LB", price: 3700, notes: "2015 Price" },
  { code: "S1003", name: "Small Red Beans", size: "50LB", price: 7100, notes: "2015 Price" },
  { code: "S1004", name: "White Corn", size: "25LB", price: 9000, notes: "2016 Price" },
  { code: "S1005", name: "Yellow Corn", size: "35LB", price: 1000, notes: "2017 Price" },
  { code: "S1006", name: "Split Peas", size: "50LB", price: 2000, notes: "2018 Price" },
  { code: "S1007", name: "Black Beans", size: "50LB", price: 4300, notes: "2019 Price" },
  { code: "S1008", name: "Split Peas", size: "50LB", price: 7520, notes: "2020 Price" },
  { code: "S1009", name: "Black Beans", size: "50LB", price: 8900, notes: "2021 Price" },
  { code: "S1010", name: "Split Peas", size: "50LB", price: 2100, notes: "2022 Price" },
];

export default function SaleItemPricesPage() {
  const [search, setSearch] = useState("");

  // Filters temporary sale item prices by item code or name as the user types.
  const filteredPrices = sampleSalePrices.filter((item) =>
    `${item.code} ${item.name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const headings = [
    "Sale Item Code",
    "Sale Item Name",
    "Size",
    "Price",
    "Notes",
  ];

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-6xl text-black">

        {/* Page heading */}
        <h2 className="mb-4 text-3xl font-bold">
          Sale Item Prices
        </h2>

        {/* Search bar */}
        <div className="mb-4">
          <label
            htmlFor="sale-price-search"
            className="mb-1 block text-sm font-semibold"
          >
            Sale Item
          </label>

          <div className="relative max-w-lg">
            <input
              id="sale-price-search"
              type="search"
              placeholder="Search for sale item..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-sm border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-black outline-none focus:border-green-700"
            />

            <Search
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            />
          </div>
        </div>

        {/* Sale Item Prices table */}
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
              {filteredPrices.map((item, index) => (
                <tr
                  key={item.code}
                  className={
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-100"
                  }
                >
                  <td className="border-x border-gray-500 px-3 py-3 font-semibold">
                    {item.code}
                  </td>

                  <td className="border-x border-gray-500 px-3 py-3 font-semibold">
                    {item.name}
                  </td>

                  <td className="border-x border-gray-500 px-3 py-3">
                    {item.size}
                  </td>

                  <td className="border-x border-gray-500 px-3 py-3">
                    ${item.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td className="border-x border-gray-500 px-3 py-3">
                    {item.notes}
                  </td>
                </tr>
              ))}

              {filteredPrices.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-gray-500 px-4 py-8 text-center"
                  >
                    No sale item prices match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Temporary pagination */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p>
            Showing {filteredPrices.length ? 1 : 0}-
            {filteredPrices.length} of {filteredPrices.length} Records
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
