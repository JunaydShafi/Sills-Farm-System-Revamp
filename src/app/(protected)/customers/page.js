// Temporary customer records used for the Sprint 1 prototype.
// Real customer data will be retrieved from the database in a future sprint.
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import CustomerLayout from "@/app/CustomerLayout";

//All hardcoded placeholder info
const customers = [
  {
    code: "1001",
    name: "ABC Farm Supply",
    city: "Vallejo",
    state: "CA",
    phone: "(707) 555-0100",
    status: "Active",
  },
  {
    code: "1002",
    name: "Green Acres",
    city: "Ann Arbor",
    state: "IL",
    phone: "(217) 435-0120",
    status: "Active",
  },
  {
    code: "1003",
    name: "Sunrise Farms",
    city: "Bloomington",
    state: "FL",
    phone: "(305) 567-2420",
    status: "Active",
  },
  {
    code: "1004",
    name: "Riverside Land",
    city: "Chicago",
    state: "IL",
    phone: "(217) 435-0120",
    status: "Inactive",
  },
  {
    code: "1005",
    name: "Farms United",
    city: "Sacramento",
    state: "CA",
    phone: "(916) 281-3721",
    status: "Active",
  },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  // Filters the temporary customer records by name as the user types.
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-6xl">
        {/* Page heading and button */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-4xl font-bold text-black">
            Customers
          </h2>

          <Link
            href="/add-new-customer"
            className="rounded-lg border border-green-950 bg-[#50966d] px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            + New Customers
          </Link>
        </div>

        {/* Customer search */}
        <div className="relative mb-4 max-w-lg">
          <input
            type="text"
            placeholder="Search for Customer name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 pr-11 text-sm text-black outline-none focus:border-green-700"
          />

          <Search
            size={19}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black"
          />
        </div>

        {/* Customers table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-500 text-left text-sm text-black">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Customer Code",
                  "Customer Name",
                  "City",
                  "State",
                  "Phone",
                  "Status",
                ].map((column) => (
                  <th
                    key={column}
                    className="border border-gray-500 px-3 py-4 font-bold"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {column}
                      {(column === "Customer Code" ||
                        column === "Customer Name") && (
                        <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr
                  key={customer.code}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="border-x border-gray-500 px-3 py-4 font-semibold">
                    {customer.code}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-4 font-semibold">
                    {customer.name}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-4">
                    {customer.city}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-4">
                    {customer.state}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-4">
                    {customer.phone}
                  </td>
                  <td className="border-x border-gray-500 px-2 py-3">
                    <span
                      className={`block rounded-md px-2 py-1 font-semibold ${
                        customer.status === "Active"
                          ? "bg-green-100"
                          : "bg-gray-200"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    No matching customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Temporary pagination display */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-black">
          <p>
            Showing {filteredCustomers.length === 0 ? 0 : 1}-
            {filteredCustomers.length} of{" "}
            {filteredCustomers.length} Customers
          </p>

          <div className="flex items-center gap-4">
            <span className="rounded-md bg-gray-800 px-3 py-2 text-white">
              1
            </span>
            <span>2</span>
            <span>3</span>
            <span>...</span>
            <span>19</span>
            <span>20</span>
            <span className="rounded-md bg-gray-300 px-3 py-2">
              Next →
            </span>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
