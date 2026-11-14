
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import OrderPrintView from "./OrderPrintView";

const sampleOrders = [
  {
    id: 10048,
    customerId: 1,
    customer: "Weaver Seed",
    poNumber: "PO-8831",
    orderDate: "2026-11-10",
    invoiceNumber: "INV-2201",
    total: 4850.00,
  },
  {
    id: 10047,
    customerId: 2,
    customer: "UNFI-EAST Greenwood",
    poNumber: "PO-8829",
    orderDate: "2026-11-08",
    invoiceNumber: null,
    total: 2340.00,
  },
  {
    id: 10046,
    customerId: 3,
    customer: "UNFI-East Atlanta",
    poNumber: "PO-8824",
    orderDate: "2026-11-05",
    invoiceNumber: "INV-2199",
    total: 7125.00,
  },
  {
    id: 10045,
    customerId: 4,
    customer: "Juan Barajas",
    poNumber: "PO-8819",
    orderDate: "2026-11-02",
    invoiceNumber: "INV-2198",
    total: 1975.00,
  },
  {
    id: 10044,
    customerId: 1,
    customer: "Weaver Seed",
    poNumber: "PO-8815",
    orderDate: "2026-10-29",
    invoiceNumber: null,
    total: 3600.00,
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

const formatDate = (date) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US");

export default function OrdersViewClient() {
  const [orders] = useState(sampleOrders);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [sortField, setSortField] = useState("orderDate");
  const [sortDirection, setSortDirection] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchMatch =
        !search ||
        order.id.toString().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase());

      const startMatch =
        !startDate || order.orderDate >= startDate;

      const endMatch =
        !endDate || order.orderDate <= endDate;

      return searchMatch && startMatch && endMatch;
    });
  }, [orders, search, startDate, endDate]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const first = a[sortField];
      const second = b[sortField];

      const comparison =
        typeof first === "number"
          ? first - second
          : String(first ?? "").localeCompare(String(second ?? ""));

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredOrders, sortField, sortDirection]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedOrders.length / pageSize)
  );

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  }

  function handleRowClick(order) {
    setSelectedOrder(order);
  }

  function handleOrderNumberClick(event) {
    event.stopPropagation();
  }

  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside it or pressing Escape.
useEffect(() => {
  if (!selectedOrder) return;

  function handleOutsideClick(event) {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target)
    ) {
      setSelectedOrder(null);
    }
  }

  function handleEscape(event) {
    if (event.key === "Escape") {
      setSelectedOrder(null);
    }
  }

  document.addEventListener("pointerdown", handleOutsideClick);
  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("pointerdown", handleOutsideClick);
    document.removeEventListener("keydown", handleEscape);
  };
}, [selectedOrder]);

  return (
    <div className="min-h-full bg-white px-6 py-6">

      {/* Page Heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-green-950">
            Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage customer orders.
          </p>
        </div>

        <Link
          href="/order-details"
          className="rounded-md bg-emerald-700 px-5 py-2.5
          font-semibold text-white hover:bg-emerald-600"
        >
          + New Order
        </Link>

      </div>

      {/* Search and Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-semibold">
              Search Orders
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Customer or Order #"
              className="w-full rounded-md border border-gray-300
              bg-white px-3 py-2 focus:border-emerald-600
              focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Order Date From
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-gray-300
              bg-white px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Order Date To
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-gray-300
              bg-white px-3 py-2"
            />
          </div>

        </div>

        <div className="mt-4 flex justify-end gap-3">

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-md border border-gray-300
            bg-white px-4 py-2 text-sm hover:bg-gray-100"
          >
            Reset
          </button>

        </div>

      </div>

      {/* Orders Table and Sidebar */}
      <div className="flex flex-col gap-5 lg:flex-row">

        {/* Orders Table */}
        <div className="min-w-0 flex-1 overflow-x-auto">

          <table className="w-full border-collapse text-left text-sm">

            <thead className="bg-gray-100 text-gray-800">

              <tr>
                {[
                  ["id", "Order #"],
                  ["customer", "Customer"],
                  ["poNumber", "PO #"],
                  ["orderDate", "Order Date"],
                  ["invoiceNumber", "Invoice #"],
                  ["total", "Total"],
                ].map(([field, label]) => (
                  <th key={field} className="whitespace-nowrap px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort(field)}
                      className="font-semibold hover:text-emerald-700"
                    >
                      {label}
                      {sortField === field &&
                        (sortDirection === "asc" ? " ▲" : " ▼")}
                    </button>
                  </th>
                ))}
              </tr>

            </thead>

            <tbody>

              {paginatedOrders.map((order) => (

                <tr
                  key={order.id}
                  onClick={() => handleRowClick(order)}
                  className={`cursor-pointer border-b border-gray-200
                    transition hover:bg-emerald-50
                    ${
                      selectedOrder?.id === order.id
                        ? "bg-emerald-100"
                        : "bg-white"
                    }`}
                >

                  <td className="px-3 py-3 font-semibold">
                    <Link
                      href={`/order-details?id=${order.id}`}
                      onClick={handleOrderNumberClick}
                      className="text-emerald-700 hover:underline"
                    >
                      {order.id}
                    </Link>
                  </td>

                  <td className="px-3 py-3">
                    <Link
                      href={`/customers/${order.customerId}`}
                      onClick={handleOrderNumberClick}
                      className="hover:text-emerald-700 hover:underline"
                    >
                      {order.customer}
                    </Link>
                  </td>

                  <td className="px-3 py-3">{order.poNumber}</td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDate(order.orderDate)}
                  </td>

                  <td className="px-3 py-3">
                    {order.invoiceNumber ? (
                      <Link
                        href={`/invoice-details?id=${encodeURIComponent(order.invoiceNumber)}`}
                        onClick={handleOrderNumberClick}
                        className="text-emerald-700 hover:underline"
                      >
                        {order.invoiceNumber}
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-right font-medium">
                    {formatCurrency(order.total)}
                  </td>

                </tr>

              ))}

              {paginatedOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No orders found matching your search.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

          {/* Pagination */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

            <div className="text-sm text-gray-600">
              Showing {sortedOrders.length === 0 ? 0 :
                (currentPage - 1) * pageSize + 1}
              {" – "}
              {Math.min(currentPage * pageSize, sortedOrders.length)}
              {" of "}
              {sortedOrders.length} orders
            </div>

            <div className="flex items-center gap-2">

              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="rounded border border-gray-300 px-2 py-1"
                aria-label="Orders per page"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        </div>

        {/* Selected Order Sidebar */}
        {selectedOrder && (

          <>
  {/* Mobile backdrop */}
  <button
    type="button"
    aria-label="Close order sidebar"
    onClick={() => setSelectedOrder(null)}
    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
  />

  <aside
    ref={sidebarRef}
    className="fixed inset-y-0 right-0 z-50 w-[min(90vw,400px)]
      overflow-y-auto border-l border-gray-200 bg-white p-5 shadow-xl
      lg:sticky lg:top-5 lg:z-auto lg:h-fit lg:w-[340px]
      lg:shrink-0 lg:rounded-lg lg:border lg:shadow-sm"
  >

            <div className="mb-4 flex items-center justify-between">

              <h2 className="text-lg font-bold text-green-950">
                Order #{selectedOrder.id}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order sidebar"
                className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4 text-sm">

              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-semibold">
                  {selectedOrder.customer}
                </p>
              </div>

              <div>
                <p className="text-gray-500">PO Number</p>
                <p className="font-semibold">
                  {selectedOrder.poNumber || "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Order Date</p>
                <p className="font-semibold">
                  {formatDate(selectedOrder.orderDate)}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Invoice Number</p>
                <p className="font-semibold">
                  {selectedOrder.invoiceNumber || "Not invoiced"}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-500">Total Order Cost</p>
                <p className="text-xl font-bold text-green-900">
                  {formatCurrency(selectedOrder.total)}
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-3">

              <Link
                href={`/order-details?id=${selectedOrder.id}`}
                className="block rounded-md bg-emerald-700 px-4 py-2.5
                text-center font-semibold text-white hover:bg-emerald-600"
              >
                View / Edit Order
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full rounded-md border border-gray-300
                px-4 py-2.5 font-semibold hover:bg-gray-50"
              >
                Print Order Summary
              </button>

            </div>

          </aside>
          </>

        )}

      </div>

{selectedOrder && (
  <OrderPrintView order={selectedOrder} />
)}
    </div>
  );
}
