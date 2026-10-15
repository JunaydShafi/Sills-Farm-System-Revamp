
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Pencil,
  LockKeyhole,
  Eye,
  EyeOff,
  Shield,
  RotateCcw,
  Save,
} from "lucide-react";
import FarmLayout from "../FarmLayout";

export default function UserForm({ mode = "add" }) {
  const isEditing = mode === "edit";

  const initialValues = {
    employee: isEditing ? "Jane Doe" : "",
    username: isEditing ? "jdoe" : "",
    role: "Employee",
    status: "Active",
    password: "",
    confirmPassword: "",
  };

  const [form, setForm] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setMessage("");
  }

  function clearForm() {
    setForm({
      employee: "",
      username: "",
      role: "Employee",
      status: "Active",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMessage("");
  }

  function handleSave(event) {
    event.preventDefault();

    setMessage(
      "Sprint 1 demo: User records are not saved yet. Database functionality will be added in Sprint 2."
    );
  }

  const inputStyle =
    "w-full rounded-md border border-gray-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-emerald-600";

  return (
    <FarmLayout>
      <section className="mx-auto w-full max-w-5xl rounded-lg border border-gray-300 bg-[#f8f9f6] px-5 py-6 shadow-lg">
        <div className="flex flex-wrap items-start gap-6">
          <Link
            href="/user-management"
            className="inline-flex items-center gap-2 rounded-md border border-gray-500 bg-emerald-50 px-4 py-2 font-semibold text-green-950 hover:bg-emerald-100"
          >
            <ArrowLeft size={22} />
            Back
          </Link>

          <div className="w-full max-w-[540px]">
            <div className="mb-5 flex items-center justify-center gap-3 rounded-md bg-emerald-50 px-4 py-2">
              <UserRound size={26} className="text-black" />
              <h2 className="font-bold text-black">
                {isEditing ? "Edit User" : "Add User"}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Employee */}
              <div>
                <label
                  htmlFor="employee"
                  className="mb-1 block font-semibold text-black"
                >
                  Employee
                </label>

                <div className="relative">
                  <UserRound
                    size={19}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                  />

                  <select
                    id="employee"
                    value={form.employee}
                    onChange={(event) =>
                      updateField("employee", event.target.value)
                    }
                    className={`${inputStyle} pl-10`}
                  >
                    <option value="">Select an employee...</option>
                    <option>Edward M. Sills</option>
                    <option>John Smith</option>
                    <option>Jane Doe</option>
                    <option>Robert Garcia</option>
                  </select>
                </div>
              </div>

              {/* Username and role */}
              <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-1 block font-semibold text-black"
                  >
                    Username
                  </label>

                  <div className="relative">
                    <Pencil
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    />

                    <input
                      id="username"
                      type="text"
                      value={form.username}
                      onChange={(event) =>
                        updateField("username", event.target.value)
                      }
                      className={`${inputStyle} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="mb-1 block font-semibold text-black"
                  >
                    Role
                  </label>

                  <div className="relative">
                    <Shield
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    />

                    <select
                      id="role"
                      value={form.role}
                      onChange={(event) =>
                        updateField("role", event.target.value)
                      }
                      className={`${inputStyle} pl-10`}
                    >
                      <option>Employee</option>
                      <option>Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block font-semibold text-black"
                >
                  {isEditing ? "New Password" : "Password"}
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder={
                      isEditing
                        ? "Enter a new password..."
                        : "Enter password..."
                    }
                    autoComplete="new-password"
                    className={`${inputStyle} pl-10 pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-950"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block font-semibold text-black"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                  />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    value={form.confirmPassword}
                    onChange={(event) =>
                      updateField(
                        "confirmPassword",
                        event.target.value
                      )
                    }
                    placeholder="Confirm password..."
                    autoComplete="new-password"
                    className={`${inputStyle} pl-10 pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-950"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Status */}
              <fieldset className="flex flex-wrap items-center justify-center gap-5 pt-2 text-sm text-black">
                <legend className="sr-only">Account Status</legend>

                <span className="font-bold">Status:</span>

                <label className="flex items-center gap-2">
                  Active
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={form.status === "Active"}
                    onChange={() =>
                      updateField("status", "Active")
                    }
                    className="accent-emerald-600"
                  />
                </label>

                <label className="flex items-center gap-2">
                  Inactive
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={form.status === "Inactive"}
                    onChange={() =>
                      updateField("status", "Inactive")
                    }
                    className="accent-emerald-600"
                  />
                </label>
              </fieldset>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={clearForm}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-500 bg-white px-5 py-2 font-semibold text-black hover:bg-gray-100"
                >
                  <RotateCcw size={20} />
                  Clear
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md border border-green-900 bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700"
                >
                  <Save size={20} />
                  Save User
                </button>
              </div>

              {message && (
                <p
                  role="status"
                  className="rounded-md border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-900"
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </FarmLayout>
  );
}
