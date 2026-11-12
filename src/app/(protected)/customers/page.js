"use client";

import { useEffect, useState } from "react";
import { UsaStates } from "usa-states";
import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  X,
  Pencil,
} from "lucide-react";
import CustomerLayout from "@/app/CustomerLayout";
import CustomerStatus from "./_components/CustomerStatus";
import EditCustomer from "./_components/EditCustomer";
const usStates = new UsaStates().states;

// Show a small number of page buttons, even for large databases.
function getPageNumbers(currentPage, totalPages) {
  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  const validPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result = [];

  validPages.forEach((page, index) => {
    const previous = validPages[index - 1];

    if (previous !== undefined && page - previous > 1) {
      if (page - previous === 2) {
        result.push(previous + 1);
      } else {
        result.push("...");
      }
    }

    result.push(page);
  });

  return result;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [pendingCustomer, setPendingCustomer] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Wait briefly after typing before searching the database.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const searchPending = search.trim() !== debouncedSearch;
  const isLoading = loading || searchPending || updatingStatusId !== null;

  // Show the full loading message only on the initial request.
  const initialLoading = isLoading && !hasLoaded;
  // Request the selected page directly from PostgreSQL.
  useEffect(() => {
    const controller = new AbortController();

    async function loadCustomers() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        sortField,
        sortDirection,
        page: String(page),
        pageSize: String(pageSize),
      });

      try {
        const response = await fetch(`/api/customers?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load customers.");
        }

        if (
          !Array.isArray(data.customers) ||
          !data.pagination ||
          !Number.isInteger(data.pagination.total) ||
          !Number.isInteger(data.pagination.totalPages)
        ) {
          throw new Error("Invalid customer data received.");
        }

        if (controller.signal.aborted) return;

        const totalPages = Math.max(1, data.pagination.totalPages);

        // Handle a page becoming invalid after records change.
        if (page > totalPages) {
          setPage(totalPages);
          return;
        }

        setCustomers(data.customers);
        setPagination({
          total: data.pagination.total,
          totalPages,
        });
        setHasLoaded(true);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "Unable to load customers.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => controller.abort();
  }, [
    debouncedSearch,
    statusFilter,
    sortField,
    sortDirection,
    page,
    pageSize,
    retryCount,
  ]);

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilter(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function handlePageSize(value) {
    setPageSize(Number(value));
    setPage(1);
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setPage(1);
  }

  function openEditCustomer(customer) {
    setEditingCustomer(customer);

    setEditForm({
      code: customer.customer_code ?? "",
      name: customer.name ?? "",
      address: customer.address ?? "",
      city: customer.city ?? "",
      state: customer.state ?? "",
      zip: customer.zip ?? "",
      phone: customer.phone ?? "",
      status: customer.status ?? "Active",
    });

    setEditErrors({});
    setActionError("");
  }

  function closeEditCustomer() {
    if (savingEdit) return;

    setEditingCustomer(null);
    setEditForm(null);
    setEditErrors({});
  }

  function handleEditChange(field, value) {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));

    setEditErrors((current) => {
      const updated = { ...current };
      delete updated[field];
      return updated;
    });
  }

  function validateEditForm(form) {
    const errors = {};

    const limits = {
      code: 30,
      name: 150,
      address: 255,
      city: 100,
      state: 2,
      zip: 10,
      phone: 25,
    };

    for (const [field, maxLength] of Object.entries(limits)) {
      const value = form[field];

      if (typeof value !== "string" || !value.trim()) {
        errors[field] = "This field is required.";
      } else if (value.trim().length > maxLength) {
        errors[field] = `Maximum ${maxLength} characters allowed.`;
      }
    }

    if (form.zip && !/^\d{5}$/.test(form.zip.trim())) {
      errors.zip = "ZIP Code must contain exactly 5 digits.";
    }

    if (form.phone) {
      const digits = form.phone.replace(/\D/g, "");

      if (!/^[\d\s()+.-]+$/.test(form.phone) || digits.length !== 10) {
        errors.phone = "Enter a valid 10-digit phone number.";
      }
    }

    if (
      form.state &&
      !usStates.some((state) => state.abbreviation === form.state.toUpperCase())
    ) {
      errors.state = "Please select a valid U.S. state.";
    }

    return errors;
  }

  async function saveEditCustomer(event) {
    event.preventDefault();

    if (!editingCustomer || !editForm || savingEdit) return;

    const errors = validateEditForm(editForm);

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setSavingEdit(true);
    setEditErrors({});
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          code: editForm.code.trim(),
          name: editForm.name.trim(),
          address: editForm.address.trim(),
          city: editForm.city.trim(),
          state: editForm.state.toUpperCase(),
          zip: editForm.zip.trim(),
          phone: editForm.phone.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setEditErrors(result.errors);
        }

        throw new Error(result.error || "Unable to update customer.");
      }

      setEditingCustomer(null);
      setEditForm(null);

      setActionSuccess(`${editForm.name.trim()} was updated successfully.`);

      // Reload the table from PostgreSQL.
      setRetryCount((count) => count + 1);
    } catch (error) {
      setActionError(error.message || "Unable to update customer.");
    } finally {
      setSavingEdit(false);
    }
  }

  function requestStatusChange(customer, newStatus) {
    setPendingCustomer(customer);
    setPendingStatus(newStatus);
    setActionError("");
    setActionSuccess("");
  }

  function cancelStatusChange() {
    if (updatingStatusId !== null) return;

    setPendingCustomer(null);
    setPendingStatus(null);
  }

  async function confirmStatusChange() {
    if (
      !pendingCustomer ||
      !["Active", "Inactive"].includes(pendingStatus) ||
      updatingStatusId !== null
    ) {
      return;
    }

    const customer = pendingCustomer;
    const newStatus = pendingStatus;

    setUpdatingStatusId(customer.id);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update customer status.");
      }

      // Update the displayed customer immediately after success.
      setCustomers((current) =>
        current.map((record) =>
          record.id === customer.id ? { ...record, status: newStatus } : record,
        ),
      );

      setActionSuccess(
        `${customer.name} was ${
          newStatus === "Active" ? "reactivated" : "deactivated"
        } successfully.`,
      );

      // Close the dialog and refresh the database records.
      setPendingCustomer(null);
      setPendingStatus(null);
      setRetryCount((count) => count + 1);
    } catch (error) {
      setActionError(error.message || "Unable to update customer status.");
    } finally {
      setUpdatingStatusId(null);
    }
  }

  function renderSortIcon(field) {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  }
  const totalPages = pagination.totalPages;
  const total = pagination.total;

  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = total === 0 ? 0 : Math.min(page * pageSize, total);

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-6xl">
        {/* Heading and New Customers button */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-4xl font-bold text-black">Customers</h2>

          <Link
            href="/add-new-customer"
            className="rounded-lg border border-green-950 bg-[#50966d] px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            + New Customers
          </Link>
        </div>

        {/* Search and status filter */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="relative w-full max-w-lg flex-1">
            <input
              type="text"
              placeholder="Search by Customer name or code..."
              aria-label="Search customers"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              maxLength={150}
              className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 pr-11 text-sm text-black outline-none focus:border-green-700"
            />

            <Search
              size={19}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black"
              aria-hidden="true"
            />
          </div>

          <select
            aria-label="Filter customers by status"
            value={statusFilter}
            onChange={(event) => handleStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-black focus:border-green-700"
          >
            <option value="All">All Customers</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Subtle loading indicator for subsequent database requests */}
        {hasLoaded && isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="mb-3 flex items-center gap-2 text-sm text-gray-600"
          >
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-green-700" />
            Updating customers...
          </div>
        )}

        {/* Database errors */}
        {error && !isLoading && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}
        {/* Customer deactivation feedback */}
        {actionError && (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            {actionError}
          </p>
        )}

        {actionSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-900"
          >
            <span>{actionSuccess}</span>

            <button
              type="button"
              onClick={() => setActionSuccess("")}
              aria-label="Dismiss success message"
              className="rounded p-1 text-green-800 hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-500 text-left text-sm text-black">
            <thead className="bg-gray-100">
              <tr>
                {[
                  { label: "Customer Code", field: "code" },
                  { label: "Customer Name", field: "name" },
                  { label: "City" },
                  { label: "State" },
                  { label: "Phone" },
                  { label: "Status", field: "status" },
                ].map((column) => (
                  <th
                    key={column.label}
                    scope="col"
                    aria-sort={
                      column.field && sortField === column.field
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className="border border-gray-500 px-3 py-4 font-bold"
                  >
                    {column.field ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column.field)}
                        className="flex w-full items-center justify-between gap-2 text-left hover:text-green-700"
                        aria-label={`Sort by ${column.label}`}
                      >
                        {column.label}
                        {renderSortIcon(column.field)}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody aria-busy={isLoading}>
              {initialLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    Loading customers...
                  </td>
                </tr>
              ) : error && !hasLoaded ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    Customer records could not be loaded.
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    {total === 0 && !debouncedSearch && statusFilter === "All"
                      ? "No customers found in the database."
                      : "No matching customers found."}
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                  >
                    <td className="border-x border-gray-500 px-3 py-4 font-semibold">
                      {customer.customer_code}
                    </td>

                    <td className="border-x border-gray-500 px-3 py-4 font-semibold">
                      <div className="flex items-center justify-between gap-3">
                        <span>{customer.name}</span>

                        <button
                          type="button"
                          onClick={() => openEditCustomer(customer)}
                          disabled={isLoading || savingEdit}
                          aria-label={`Edit ${customer.name}`}
                          title={`Edit ${customer.name}`}
                          className="rounded-md p-2 text-gray-600 hover:bg-green-100 hover:text-green-800 focus-visible:outline-2 focus-visible:outline-green-700 disabled:opacity-50"
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                      </div>
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
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type="button"
                            disabled={isLoading}
                            aria-label={`Change status for ${customer.name}`}
                            className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                              customer.status === "Active"
                                ? "bg-green-100 text-green-900 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            <span>{customer.status}</span>
                            <ChevronDown size={15} aria-hidden="true" />
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            side="bottom"
                            align="end"
                            sideOffset={5}
                            collisionPadding={8}
                            className="z-50 min-w-44 rounded-lg border border-gray-200 bg-white p-2 text-sm text-black shadow-lg"
                          >
                            <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold text-gray-500">
                              Change Status
                            </DropdownMenu.Label>

                            <div className="border-t border-gray-100 pt-1">
                              <div
                                className={`mb-1 rounded-md px-3 py-2 font-semibold ${
                                  customer.status === "Active"
                                    ? "bg-green-50 text-green-800"
                                    : "bg-red-50 text-red-800"
                                }`}
                              >
                                {customer.status} (Current)
                              </div>

                              <DropdownMenu.Item
                                onSelect={() =>
                                  requestStatusChange(
                                    customer,
                                    customer.status === "Active"
                                      ? "Inactive"
                                      : "Active",
                                  )
                                }
                                className={`cursor-pointer rounded-md px-3 py-2 font-semibold outline-none ${
                                  customer.status === "Active"
                                    ? "text-red-700 hover:bg-red-50 focus:bg-red-50"
                                    : "text-green-800 hover:bg-green-50 focus:bg-green-50"
                                }`}
                              >
                                {customer.status === "Active"
                                  ? "Set Inactive"
                                  : "Set Active"}
                              </DropdownMenu.Item>
                            </div>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasLoaded && !error && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-black">
            <p>
              Showing {startIndex}-{endIndex} of {total} Customers
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="page-size">Rows per page:</label>

              <select
                id="page-size"
                value={pageSize}
                onChange={(event) => handlePageSize(event.target.value)}
                disabled={isLoading}
                className="rounded border border-gray-300 bg-white px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>

              <button
                type="button"
                disabled={isLoading || page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {pageNumbers.map((pageNumber, index) =>
                pageNumber === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    disabled={isLoading}
                    aria-label={`Go to page ${pageNumber}`}
                    aria-current={page === pageNumber ? "page" : undefined}
                    className={`rounded-md px-3 py-2 ${
                      page === pageNumber
                        ? "bg-gray-800 text-white"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={isLoading || page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer status confirmation dialog */}
      <CustomerStatus
        pendingCustomer={pendingCustomer}
        pendingStatus={pendingStatus}
        updatingStatusId={updatingStatusId}
        actionError={actionError}
        cancelStatusChange={cancelStatusChange}
        confirmStatusChange={confirmStatusChange}
      />

      {/* Edit Customer dialog */}
      <EditCustomer
        editingCustomer={editingCustomer}
        editForm={editForm}
        editErrors={editErrors}
        savingEdit={savingEdit}
        actionError={actionError}
        closeEditCustomer={closeEditCustomer}
        handleEditChange={handleEditChange}
        saveEditCustomer={saveEditCustomer}
        usStates={usStates}
      />
    </CustomerLayout>
  );
}
