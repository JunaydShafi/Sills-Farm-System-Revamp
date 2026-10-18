
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Users,
  Plus,
  Search,
  SquarePen,
} from "lucide-react";
import FarmLayout from "../FarmLayout";

const demoUsers = [
  {
    id: 1,
    name: "Edward M. Sills",
    username: "esills",
    role: "Administrator",
    status: "Active",
    lastLogin: "9/28/2026 8:35 AM",
  },
  {
    id: 2,
    name: "John Smith",
    username: "jsmith",
    role: "Employee",
    status: "Active",
    lastLogin: "9/27/2026 3:40 PM",
  },
  {
    id: 3,
    name: "Jane Doe",
    username: "jdoe",
    role: "Employee",
    status: "Active",
    lastLogin: "9/26/2026 1:12 PM",
  },
  {
    id: 4,
    name: "Robert Garcia",
    username: "rgarcia",
    role: "Employee",
    status: "Inactive",
    lastLogin: "8/14/2026 9:14 AM",
  },
];

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const filteredUsers = demoUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "All Roles" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All Statuses" ||
      user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <FarmLayout>
      <section className="mx-auto w-full max-w-5xl rounded-lg border border-gray-300 bg-[#f8f9f6] p-5 shadow-lg">
        {/* Page title */}
        <div className="mb-5 flex flex-wrap items-center gap-5">
          <Link
            href="/main-dashboard"
            className="flex items-center gap-2 rounded-md border border-gray-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-green-950 hover:bg-emerald-100"
          >
            <ArrowLeft size={23} />
            Back To Dashboard
          </Link>

          <Settings size={39} className="text-green-950" />

          <div>
            <h2 className="text-2xl font-bold text-black">
              User Management
            </h2>
            <p className="text-xs font-semibold text-gray-700">
              Manage System Users and access permissions
            </p>
          </div>
        </div>

        {/* Users heading */}
        <div className="mb-3 flex items-center justify-between rounded-md bg-emerald-50 px-4 py-2">
          <div className="flex items-center gap-3">
            <Users size={25} className="text-black" />
            <span className="font-semibold text-black">Users</span>
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
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-gray-400 px-3 py-2">
              <Search size={17} className="text-gray-700" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users by name or username..."
                className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-500"
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-black">
              Role:
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-md border border-gray-400 bg-white px-2 py-2 font-normal"
              >
                <option>All Roles</option>
                <option>Administrator</option>
                <option>Employee</option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-black">
              Status:
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-md border border-gray-400 bg-white px-2 py-2 font-normal"
              >
                <option>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>

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
                      className="border border-gray-400 px-2 py-2 font-bold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border border-gray-400 px-2 py-2">
                      {user.id}
                    </td>

                    <td className="border border-gray-400 px-2 py-2 font-semibold">
                      {user.name}
                    </td>

                    <td className="border border-gray-400 px-2 py-2">
                      {user.username}
                    </td>

                    <td className="border border-gray-400 px-2 py-2">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          user.role === "Administrator"
                            ? "bg-green-200"
                            : "bg-blue-100"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="border border-gray-400 px-2 py-2">
                      <span className="flex items-center gap-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            user.status === "Active"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>

                    <td className="border border-gray-400 px-2 py-2 whitespace-nowrap">
                      {user.lastLogin}
                    </td>

                    <td className="border border-gray-400 px-2 py-2">
                      <Link
                        href="/user-management/edit"
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-gray-500 bg-emerald-50 px-2 py-1 text-xs font-semibold hover:bg-emerald-100"
                      >
                        <SquarePen size={14} />
                        Edit Profile
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="border border-gray-400 px-3 py-8 text-center text-gray-500"
                    >
                      No matching users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-gray-500">
          Sprint 1 prototype — demonstration records only
        </p>
      </section>
    </FarmLayout>
  );
}
