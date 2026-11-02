"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import SidebarLayout, { PageTitle } from "@/app/SidebarLayout";

const columns = [
  { key: "proc", label: "Proc", align: "text-right", headAlign: "text-left" },
  { key: "type", label: "Type", align: "text-left", headAlign: "text-left" },
  { key: "factor", label: "Factor", align: "text-right", headAlign: "text-left" },
  { key: "bagsMade", label: "Bags Made", align: "text-right", headAlign: "text-left" },
  { key: "unitsSold", label: "Units Sold", align: "text-right", headAlign: "text-left" },
  { key: "inventory", label: "Inventory", align: "text-right", headAlign: "text-left" },
  { key: "inventoryLbs", label: "Inventory lbs", align: "text-right", headAlign: "text-left" },
  { key: "saleItemId", label: "Sale Item ID", align: "text-right", headAlign: "text-left" },
];

const cellStyle = "border-x border-gray-300 px-2 py-1.5";

const rowsPerPage = 11;

const pageButtonStyle =
  "flex items-center gap-1 rounded bg-gray-200 px-4 py-1.5 hover:bg-gray-300 disabled:opacity-50";

// Balances are recalculated by the server on every request.
async function fetchInventory() {
  const response = await fetch("/api/bag-inventory", { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.items;
}

export default function BagInventoryPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const applyResult = useCallback((request) => {
    return request
      .then((loadedItems) => {
        setItems(loadedItems);
        setError("");
      })
      .catch((loadError) => {
        setItems([]);
        setError(loadError.message || "Unable to load bag inventory.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    applyResult(fetchInventory());
  }, [applyResult]);

  function refresh() {
    setLoading(true);
    applyResult(fetchInventory());
  }

  const filteredInventory = items.filter(
    (item) =>
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      String(item.proc).includes(search)
  );

  const pageCount = Math.max(1, Math.ceil(filteredInventory.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount);
  const firstRow = (currentPage - 1) * rowsPerPage;
  const visibleInventory = filteredInventory.slice(firstRow, firstRow + rowsPerPage);

  return (
    <SidebarLayout>
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
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by product type or process number..."
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-500"
          />
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="rounded-md bg-emerald-600 px-14 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

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
            {visibleInventory.map((item) => (
              <tr key={item.id} className="even:bg-gray-100">
                {columns.map((column) => (
                  <td key={column.key} className={`${cellStyle} ${column.align}`}>
                    {item[column.key]}
                  </td>
                ))}
              </tr>
            ))}

            {visibleInventory.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                  {loading ? "Loading inventory..." : "No matching records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record count and page buttons */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
        <p>
          Showing {filteredInventory.length === 0 ? 0 : firstRow + 1}–
          {firstRow + visibleInventory.length} of {filteredInventory.length} records
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={pageButtonStyle}
          >
            <ArrowLeft size={14} />
            Previous
          </button>

          <span className="px-2">
            Page {currentPage} of {pageCount}
          </span>

          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === pageCount}
            className={pageButtonStyle}
          >
            Next
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
}
