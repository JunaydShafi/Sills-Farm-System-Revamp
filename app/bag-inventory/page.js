"use client";

import { useState } from "react";
import { Box, Search } from "lucide-react";
import SidebarLayout, { PageTitle, Pagination } from "../SidebarLayout";

const demoBagInventory = [
  { proc: 1001, type: "Black Beans", factor: 25, bagsMade: 120, unitsSold: 72, inventory: 48, inventoryLb: 1200, saleItemId: 2001 },
  { proc: 1002, type: "Split Peas", factor: 50, bagsMade: 100, unitsSold: 65, inventory: 35, inventoryLb: 1750, saleItemId: 2002 },
  { proc: 1003, type: "Pinto Beans", factor: 25, bagsMade: 80, unitsSold: 50, inventory: 30, inventoryLb: 750, saleItemId: 2003 },
  { proc: 1004, type: "Green Peas", factor: 50, bagsMade: 150, unitsSold: 100, inventory: 50, inventoryLb: 2500, saleItemId: 2004 },
  { proc: 1005, type: "Yellow Peas", factor: 25, bagsMade: 90, unitsSold: 55, inventory: 35, inventoryLb: 875, saleItemId: 2005 },
  { proc: 1006, type: "Kidney Beans", factor: 50, bagsMade: 110, unitsSold: 70, inventory: 40, inventoryLb: 2000, saleItemId: 2006 },
  { proc: 1007, type: "Navy Beans", factor: 25, bagsMade: 75, unitsSold: 45, inventory: 30, inventoryLb: 750, saleItemId: 2007 },
  { proc: 1008, type: "Chickpeas", factor: 50, bagsMade: 140, unitsSold: 90, inventory: 50, inventoryLb: 2500, saleItemId: 2008 },
  { proc: 1009, type: "Lima Beans", factor: 25, bagsMade: 60, unitsSold: 35, inventory: 25, inventoryLb: 625, saleItemId: 2009 },
  { proc: 1010, type: "Snow Peas", factor: 50, bagsMade: 95, unitsSold: 60, inventory: 35, inventoryLb: 1750, saleItemId: 2010 },
  { proc: 1011, type: "Red Beans", factor: 25, bagsMade: 130, unitsSold: 85, inventory: 45, inventoryLb: 1125, saleItemId: 2011 },
];

const columns = [
  { key: "proc", label: "Proc", align: "text-right", headAlign: "text-left" },
  { key: "type", label: "Type", align: "text-left", headAlign: "text-left" },
  { key: "factor", label: "Factor", align: "text-right", headAlign: "text-left" },
  { key: "bagsMade", label: "Bags Made", align: "text-right", headAlign: "text-left" },
  { key: "unitsSold", label: "Units Sold", align: "text-right", headAlign: "text-left" },
  { key: "inventory", label: "Inventory", align: "text-right", headAlign: "text-left" },
  { key: "inventoryLb", label: "Inventory lb", align: "text-right", headAlign: "text-left" },
  { key: "saleItemId", label: "Sale Item ID", align: "text-right", headAlign: "text-left" },
];

const cellStyle = "border-x border-gray-300 px-2 py-1.5";

export default function BagInventoryPage() {
  const [search, setSearch] = useState("");

  const filteredInventory = demoBagInventory.filter(
    (item) =>
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      String(item.proc).includes(search)
  );

  return (
    <SidebarLayout activeItem={{ label: "Inventory", href: "/bag-inventory", icon: Box }}>
      <PageTitle
        title="Bag Inventory"
        subtitle="Bag production, sales and remaining inventory"
      />

      {/* Search and refresh */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full max-w-[380px] items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5">
          <Search size={16} className="text-gray-700" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product type or process number..."
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setSearch("")}
          className="rounded-md bg-emerald-600 px-14 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Refresh
        </button>
      </div>

      {/* Bag inventory table */}
      <div className="overflow-x-auto border border-gray-400">
        <table className="w-full min-w-[700px] border-collapse text-sm text-black">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${cellStyle} ${column.headAlign} border-b border-gray-400 text-xs font-bold leading-tight`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.proc} className="even:bg-gray-100">
                {columns.map((column) => (
                  <td key={column.key} className={`${cellStyle} ${column.align}`}>
                    {item[column.key]}
                  </td>
                ))}
              </tr>
            ))}

            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination start={1} end={11} total={100} />
    </SidebarLayout>
  );
}
