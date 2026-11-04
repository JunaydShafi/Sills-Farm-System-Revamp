
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Users,
  Plus,
  Search,
  SquarePen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FarmLayout from "@/app/FarmLayout";

const USERS_PER_PAGE = 10;

export default function UserManagementPage() {
  // Search and filter states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // Database user records
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Retrieve users from PostgreSQL through our API.
  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      try {
        const response = await fetch("/api/users", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? "Access denied. Administrator privileges required."
              : response.status === 401
                ? "Your session has expired. Please log in again."
                : "Failed to load users from the database."
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid user data received.");
        }

        if (!controller.signal.aborted) {
          setUsers(data);
          setError("");
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "Unable to load users.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => controller.abort();
  }, []);

  // Reset pagination when search or filters change.
  function resetPagination() {
    setCurrentPage(1);
  }

  // Search and filter actual database users.
  const filteredUsers = users.filter((user) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(searchText) ||
      user.username.toLowerCase().includes(searchText);

    const matchesRole =
      roleFilter === "All Roles" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All Statuses" ||
      user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate pagination.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex =
    (safeCurrentPage - 1) * USERS_PER_PAGE;

  // Only display 10 users per page.
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  // Format PostgreSQL timestamps for display.
  function formatLastLogin(lastLogin) {
    if (!lastLogin) {
      return "Never";
    }

    const date = new Date(lastLogin);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <FarmLayout>
      <section className="mx-auto w-full max-w-5xl rounded-lg border border-gray-300 bg-[#f8f9f6] p-5 shadow-lg">

        {/* Page title */}
        <div className="relative mb-5 flex min-h-[65px] items-center justify-center">

          {/* Back button */}
          <Link
            href="/main-dashboard"
            className="absolute left-0 flex items-center gap-2 rounded-md border border-gray-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-green-950 hover:bg-emerald-100"
          >
            <ArrowLeft size={23} />
            Back To Dashboard
          </Link>

          {/* Centered gear icon and title */}
          <div className="flex items-center justify-center gap-4">
            <Settings
              size={39}
              className="text-green-950"
            />

            <div>
              <h2 className="text-2xl font-bold text-black">
                User Management
              </h2>
              <p className="text-xs font-semibold text-gray-700">
                Manage System Users and access permissions
              </p>
            </div>
          </div>
        </div>

        {/* Users heading */}
        <div className="mb-3 flex items-center justify-between rounded-md bg-emerald-50 px-4 py-2">
          <div className="flex items-center gap-3">
            <Users size={25} className="text-black" />
            <span className="font-semibold text-black">
              Users
            </span>
          </div>

          <Link
            href="/user-management/add"
            className="flex items-center gap-1 rounded-md border border-green-900 bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add User
          </Link>
        </div>

        {/* Search and filters */}
        <div className="rounded-md border border-gray-500 bg-white p-3">
          <div className="mb-3 flex flex-wrap items-center gap-3">

            {/* Search bar */}
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-gray-400 px-3 py-2">
              <Search size={17} className="text-gray-700" />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPagination();
                }}
                placeholder="Search users by name or username..."
                aria-label="Search users"
                className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-500"
              />
            </div>

            {/* Role filter */}
            <label className="flex items-center gap-2 text-sm font-semibold text-black">
              Role:
              <select
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value);
                  resetPagination();
                }}
                className="rounded-md border border-gray-400 bg-white px-2 py-2 font-normal"
              >
                <option>All Roles</option>
                <option>Administrator</option>
                <option>Employee</option>
              </select>
            </label>

            {/* Status filter */}
            <label className="flex items-center gap-2 text-sm font-semibold text-black">
              Status:
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  resetPagination();
                }}
                className="rounded-md border border-gray-400 bg-white px-2 py-2 font-normal"
              >
                <option>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>

          {/* Loading message */}
          {loading && (
            <p
              role="status"
              className="py-4 text-center text-sm text-gray-600"
            >
              Loading users from database...
            </p>
          )}

          {/* Error message */}
          {error && (
            <p
              role="alert"
              className="mb-3 rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {/* User table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[730px] border-collapse text-left text-sm text-black">
              <thead>
                <tr className="bg-emerald-50">
                  {[
                    "ID",
                    "Employee Name",
                    "Username",
                    "Role",
                    "Status",
                    "Last Login",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="border border-gray-400 px-2 py-2 font-bold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  !error &&
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50"
                    >

                      {/* User ID */}
                      <td className="border border-gray-400 px-2 py-2">
                        {user.id}
                      </td>

                      {/* Employee name */}
                      <td className="border border-gray-400 px-2 py-2 font-semibold">
                        {user.name}
                      </td>

                      {/* Username */}
                      <td className="border border-gray-400 px-2 py-2">
                        {user.username}
                      </td>

                      {/* Role */}
                      <td className="border border-gray-400 px-2 py-2">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${user.role === "Administrator"
                              ? "bg-green-200"
                              : "bg-blue-100"
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Account status */}
                      <td className="border border-gray-400 px-2 py-2">
                        <span className="flex items-center gap-1">
                          <span
                            className={`h-2 w-2 rounded-full ${user.status === "Active"
                                ? "bg-green-600"
                                : "bg-red-600"
                              }`}
                          />
                          {user.status}
                        </span>
                      </td>

                      {/* Last login */}
                      <td className="border border-gray-400 px-2 py-2 whitespace-nowrap">
                        {formatLastLogin(user.last_login)}
                      </td>

                      {/* Edit Profile */}
                      <td className="border border-gray-400 px-2 py-2">
                        <Link
                          href={`/user-management/edit?id=${user.id}`}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-gray-500 bg-emerald-50 px-2 py-1 text-xs font-semibold hover:bg-emerald-100"
                        >
                          <SquarePen size={14} />
                          Edit Profile
                        </Link>
                      </td>
                    </tr>
                  ))}

                {/* No matching records */}
                {!loading &&
                  !error &&
                  filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border border-gray-400 px-3 py-8 text-center text-gray-500"
                      >
                        {users.length === 0
                          ? "No users found in the database."
                          : "No matching users found."}
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        {!loading && !error && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

            {/* User count */}
            <p className="text-sm text-gray-600">
              {filteredUsers.length === 0
                ? "Showing 0 users"
                : `Showing ${startIndex + 1}-${Math.min(
                  startIndex + USERS_PER_PAGE,
                  filteredUsers.length
                )} of ${filteredUsers.length} users`}
            </p>

            {/* Previous / Next navigation */}
            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
                disabled={safeCurrentPage === 1}
                className="inline-flex items-center gap-1 rounded-md border border-gray-400 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <span className="text-sm font-semibold text-black">
                Page {safeCurrentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                disabled={safeCurrentPage >= totalPages}
                className="inline-flex items-center gap-1 rounded-md border border-gray-400 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>

            </div>
          </div>
        )}
      </section>
    </FarmLayout>
  );
}
