
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import FarmLayout from "@/app/FarmLayout";

const emptyForm = {
  employee: "",
  username: "",
  role: "Employee",
  status: "Active",
  password: "",
  confirmPassword: "",
};

export default function UserForm({ mode = "add" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isEditing = mode === "edit";
  const userId = isEditing ? searchParams.get("id") : null;

  const [form, setForm] = useState({ ...emptyForm });
  const [originalForm, setOriginalForm] = useState({
    ...emptyForm,
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createdUser, setCreatedUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ==================================================
  // EDIT MODE: Load selected user from PostgreSQL
  // ==================================================

  useEffect(() => {
    if (!isEditing) return;

    if (!userId || !/^[1-9]\d*$/.test(userId)) {
      return;
    }

    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch(
          `/api/users/${encodeURIComponent(userId)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "The selected user was not found."
              : response.status === 403
                ? "Access denied. Only the System Owner may edit this protected account, or administrator access is required."
                : response.status === 401
                  ? "Your session has expired. Please log in again."
                  : "Unable to load the selected user."
          );
        }

        const user = await response.json();

        const loadedForm = {
          employee: user.name,
          username: user.username,
          role: user.role,
          status: user.status,
          password: "",
          confirmPassword: "",
        };

        if (!controller.signal.aborted) {
          setForm(loadedForm);
          setOriginalForm(loadedForm);
          setIsOwner(user.is_owner === true);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "Unable to load user.");
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => controller.abort();
  }, [isEditing, userId]);

  // ==================================================
  // Form field updates
  // ==================================================

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
    setError("");
  }

  // ==================================================
  // Reset / Clear
  // ==================================================

  function clearForm() {
    setForm(
      isEditing
        ? { ...originalForm }
        : { ...emptyForm }
    );

    setShowPassword(false);
    setShowConfirmPassword(false);
    setMessage("");
    setError("");
    setCreatedUser(null);
  }

  // ==================================================
  // SAVE: Add User (POST) or Edit User (PATCH)
  // ==================================================

  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    if (
      isEditing &&
      isOwner &&
      (
        form.role !== "Administrator" ||
        form.status !== "Active"
      )
    ) {
      setError(
        "The System Owner must remain an active Administrator."
      );
      return;
    }

    setMessage("");
    setError("");
    setCreatedUser(null);

    // Validate employee name and username.
    if (!form.employee.trim() || !form.username.trim()) {
      setError(
        "Employee name and username are required."
      );
      return;
    }

    if (form.employee.trim().length > 150) {
      setError(
        "Employee name cannot exceed 150 characters."
      );
      return;
    }

    if (form.username.trim().length > 50) {
      setError("Username cannot exceed 50 characters.");
      return;
    }

    // ADD MODE: A new user must have a password.
    if (!isEditing && !form.password) {
      setError("A password is required for new users.");
      return;
    }

    const changingPassword =
      !isEditing ||
      Boolean(form.password || form.confirmPassword);

    if (changingPassword) {
      if (form.password !== form.confirmPassword) {
        setError("The passwords do not match.");
        return;
      }

      const passwordBytes = new TextEncoder().encode(
        form.password
      ).length;

      if (
        form.password.length < 12 ||
        passwordBytes > 72
      ) {
        setError(
          "Password must be at least 12 characters and no more than 72 UTF-8 bytes."
        );
        return;
      }
    }

    // Build the data sent to the API.
    const userData = {
      name: form.employee.trim(),
      username: form.username.trim(),
      role: form.role,
      status: form.status,
      ...(changingPassword && {
        password: form.password,
      }),
    };

    const endpoint = isEditing
      ? `/api/users/${encodeURIComponent(userId)}`
      : "/api/users";

    const method = isEditing ? "PATCH" : "POST";

    setSaving(true);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (isEditing
              ? "Unable to update user."
              : "Unable to create new user.")
        );
      }

      if (isEditing) {
        const savedForm = {
          employee: data.user.name,
          username: data.user.username,
          role: data.user.role,
          status: data.user.status,
          password: "",
          confirmPassword: "",
        };

        setForm(savedForm);
        setOriginalForm(savedForm);
        setMessage("User profile updated successfully.");
        router.refresh();
      } else {
        setCreatedUser(data.user);

        setMessage(
          `New user "${data.user.username}" created successfully.`
        );

        setForm({ ...emptyForm });
        setShowPassword(false);
        setShowConfirmPassword(false);
        router.refresh();
      }
    } catch (err) {
      setError(err.message || "Unable to save user.");
    } finally {
      setSaving(false);
    }
  }

  // ==================================================
  // Styling and form availability
  // ==================================================

  const inputStyle =
    "w-full rounded-md border border-gray-500 bg-white px-3 py-2 text-sm text-black outline-none focus:border-emerald-600";

  const invalidUserId =
    isEditing &&
    (!userId || !/^[1-9]\d*$/.test(userId));

  const formUnavailable =
    isEditing &&
    (loading || (error && !form.employee) || invalidUserId);

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
              <UserRound
                size={26}
                className="text-black"
              />
              <h2 className="font-bold text-black">
                {isEditing ? "Edit User" : "Add User"}
              </h2>
            </div>

            {invalidUserId && (
              <p
                role="alert"
                className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
              >
                No valid user was selected. Return to User
                Management and click Edit Profile next to a user.
              </p>
            )}

            {loading && !invalidUserId && (
              <p
                role="status"
                className="mb-4 text-center text-sm text-gray-600"
              >
                Loading user information from database...
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {message && (
              <div
                role="status"
                className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900"
              >
                <p className="font-semibold">
                  {message}
                </p>

                {!isEditing && createdUser && (
                  <div className="mt-3">
                    <p>
                      New User ID: {createdUser.id}
                    </p>
                    <Link
                      href="/user-management"
                      className="mt-3 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                    >
                      Return to User Management
                    </Link>
                  </div>
                )}
              </div>
            )}

            {!formUnavailable && (
              <form
                onSubmit={handleSave}
                className="space-y-4"
              >
                {isEditing && isOwner && (
                  <p className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-green-950">
                    System Owner account: role and status are
                    locked. You can update your name, username,
                    or password.
                  </p>
                )}

                {/* Employee Name */}
                <div>
                  <label
                    htmlFor="employee"
                    className="mb-1 block font-semibold text-black"
                  >
                    Employee Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={19}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    />

                    <input
                      id="employee"
                      type="text"
                      value={form.employee}
                      onChange={(event) =>
                        updateField(
                          "employee",
                          event.target.value
                        )
                      }
                      placeholder="Enter employee name..."
                      className={`${inputStyle} pl-10`}
                      maxLength={150}
                      required
                    />
                  </div>
                </div>

                {/* Username and Role */}
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
                          updateField(
                            "username",
                            event.target.value
                          )
                        }
                        maxLength={50}
                        required
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
                        disabled={isEditing && isOwner}
                        onChange={(event) =>
                          updateField(
                            "role",
                            event.target.value
                          )
                        }
                        className={`${inputStyle} pl-10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600`}
                      >
                        <option value="Employee">
                          Employee
                        </option>
                        <option value="Administrator">
                          Administrator
                        </option>
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
                    {isEditing
                      ? "New Password"
                      : "Password"}
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={(event) =>
                        updateField(
                          "password",
                          event.target.value
                        )
                      }
                      placeholder={
                        isEditing
                          ? "Leave blank to keep current password..."
                          : "Enter password..."
                      }
                      autoComplete="new-password"
                      required={!isEditing}
                      className={`${inputStyle} pl-10 pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
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

                  {!isEditing && (
                    <p className="mt-1 text-xs text-gray-600">
                      Minimum 12 characters.
                    </p>
                  )}
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
                        showConfirmPassword
                          ? "text"
                          : "password"
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
                      required={!isEditing}
                      className={`${inputStyle} pl-10 pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
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

                {/* Account Status */}
                <fieldset className="flex flex-wrap items-center justify-center gap-5 pt-2 text-sm text-black">
                  <legend className="sr-only">
                    Account Status
                  </legend>

                  <span className="font-bold">
                    Status:
                  </span>

                  <label className="flex items-center gap-2">
                    Active

                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      disabled={isEditing && isOwner}
                      checked={form.status === "Active"}
                      onChange={() =>
                        updateField("status", "Active")
                      }
                      className="accent-emerald-600 disabled:cursor-not-allowed"
                    />
                  </label>

                  <label className="flex items-center gap-2">
                    Inactive

                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      disabled={isEditing && isOwner}
                      checked={form.status === "Inactive"}
                      onChange={() =>
                        updateField("status", "Inactive")
                      }
                      className="accent-emerald-600 disabled:cursor-not-allowed"
                    />
                  </label>
                </fieldset>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-6 pt-2">
                  <button
                    type="button"
                    onClick={clearForm}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-500 bg-white px-5 py-2 font-semibold text-black hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw size={20} />
                    {isEditing ? "Reset" : "Clear"}
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-md border border-green-900 bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={20} />
                    {saving ? "Saving..." : "Save User"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </FarmLayout>
  );
}
