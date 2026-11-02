"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import SidebarLayout, { PageTitle, Pagination } from "@/app/SidebarLayout";

const demoBagRecords = [
  { id: 1, date: "9/14/2026", quantity: 80, size: 25, product: "Black Beans", proc: 1001 },
  { id: 2, date: "9/15/2026", quantity: 100, size: 50, product: "Split Peas", proc: 1002 },
  { id: 3, date: "9/16/2026", quantity: 80, size: 25, product: "Pinto Beans", proc: 1003 },
  { id: 4, date: "9/17/2026", quantity: 150, size: 50, product: "Green Peas", proc: 1004 },
  { id: 5, date: "9/18/2026", quantity: 90, size: 25, product: "Yellow Peas", proc: 1005 },
  { id: 6, date: "9/19/2026", quantity: 110, size: 50, product: "Kidney Beans", proc: 1006 },
  { id: 7, date: "9/20/2026", quantity: 75, size: 25, product: "Navy Beans", proc: 1007 },
  { id: 8, date: "9/21/2026", quantity: 140, size: 50, product: "Chickpeas", proc: 1008 },
  { id: 9, date: "9/22/2026", quantity: 60, size: 25, product: "Lima Beans", proc: 1009 },
  { id: 10, date: "9/23/2026", quantity: 95, size: 50, product: "Snow Peas", proc: 1010 },
  { id: 11, date: "9/24/2026", quantity: 130, size: 25, product: "Red Beans", proc: 1011 },
  { id: 12, date: "9/25/2026", quantity: 40, size: 25, product: "Black Beans", proc: 1001 },
];

const cellStyle = "border-x border-gray-300 px-2 py-1.5";

export default function BaggingDataPage() {
  const [search, setSearch] = useState("");

  const filteredRecords = demoBagRecords.filter(
    (record) =>
      record.product.toLowerCase().includes(search.toLowerCase()) ||
      String(record.proc).includes(search)
  );

  return (
    <SidebarLayout>
      <PageTitle title="Bag Data" subtitle="Bagging Inventory Entry" />

      {/* Search and add */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full max-w-[340px] items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5">
          <Search size={16} className="text-gray-700" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product or process number..."
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-500"
          />
        </div>

        <button
          type="button"
          className="flex items-center gap-1 rounded-md bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <Plus size={16} strokeWidth={3} />
          Add record
        </button>
      </div>

      {/* Bag data table */}
      <div className="overflow-x-auto border border-gray-400">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm text-black">
          <thead>
            <tr className="bg-gray-100">
              {["Date", "Quantity", "Size", "Product", "Proc", "Adjustment"].map(
                (heading) => (
                  <th
                    key={heading}
                    className={`${cellStyle} border-b border-gray-400 font-bold`}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id} className="even:bg-gray-100">
                <td className={cellStyle}>{record.date}</td>
                <td className={`${cellStyle} text-right`}>{record.quantity}</td>
                <td className={`${cellStyle} text-right`}>{record.size}</td>
                <td className={cellStyle}>{record.product}</td>
                <td className={cellStyle}>{record.proc}</td>
                <td className={`${cellStyle} text-center`}>
                  <input type="checkbox" className="h-4 w-4 accent-emerald-600" />
                </td>
              </tr>
            ))}

            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination start={1} end={12} total={100} />
    </SidebarLayout>
  );
}
