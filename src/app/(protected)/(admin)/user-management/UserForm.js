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
  Mail,
  Send,
} from "lucide-react";
import FarmLayout from "../../../FarmLayout";

const emptyForm = {
  employee: "",
  username: "",
  email: "",
  emailVerifiedAt: null,
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
  const [sendingVerification, setSendingVerification] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createdUser, setCreatedUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState(null);

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
          email: user.email ?? "",
          emailVerifiedAt: user.email_verified_at ?? null,
          role: user.role,
          status: user.status,
          password: "",
          confirmPassword: "",
        };

        if (!controller.signal.aborted) {
          setForm(loadedForm);
          setOriginalForm(loadedForm);
          setIsOwner(user.is_owner === true);
          setLoadedUserId(userId);
          setError("");
          setMessage("");
          setLoading(false);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setLoadedUserId(null);
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
    if (sendingVerification) return;

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
    if (saving || sendingVerification) return;

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

    if (saving || sendingVerification || formUnavailable) {
      return;
    }

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

    // ==================================================
    // Sprint 4: Validate and normalize optional email
    // ==================================================

    const cleanEmail = form.email.trim().toLowerCase();

    if (cleanEmail.length > 254) {
      setError(
        "Email address cannot exceed 254 characters."
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (cleanEmail && !emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
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
    // Verification status is controlled only by the server.
    const userData = {
      name: form.employee.trim(),
      username: form.username.trim(),
      role: form.role,
      status: form.status,

      // Send email when creating a user or changing
      // an existing user's email address.
      ...(
        (!isEditing ||
          cleanEmail !== originalForm.email.trim().toLowerCase()) &&
        {
          email: cleanEmail || null,
        }
      ),

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
          email: data.user.email ?? "",
          emailVerifiedAt:
            data.user.email_verified_at ?? null,
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
  // Sprint 4: Request email verification
  // ==================================================

  async function handleSendVerification() {
    if (!canSendVerification) return;

    setError("");
    setMessage("");
    setSendingVerification(true);

    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(userId)}/verify-email`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json().catch(() => null);

      // Display the server-controlled rate-limit information.
      if (response.status === 429) {
        const retryAfter = Number(
          response.headers.get("Retry-After") ||
          data?.retryAfter ||
          0
        );

        if (
          Number.isFinite(retryAfter) &&
          retryAfter > 0
        ) {
          const waitTime =
            retryAfter >= 60
              ? `${Math.ceil(retryAfter / 60)} minute(s)`
              : `${Math.ceil(retryAfter)} second(s)`;

          throw new Error(
            `Too many verification requests. Please try again in ${waitTime}.`
          );
        }

        throw new Error(
          "Too many verification requests. Please try again later."
        );
      }

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          "Unable to send verification email."
        );
      }

      // Successful delivery does NOT mean that the
      // employee's email address has been verified.
      //
      // Only the confirmation endpoint may update
      // email_verified_at after validating the token.
      setMessage(
        "Verification email sent successfully. The account holder must open the email, sign in, and confirm their email address."
      );
    } catch (err) {
      setError(
        err.message ||
        "Unable to send verification email. Please try again."
      );
    } finally {
      setSendingVerification(false);
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
    (
      loading ||
      loadedUserId !== userId ||
      (error && !form.employee) ||
      invalidUserId
    );

  // Determine whether the email has been changed
  // since the account was loaded or last saved.
  const emailChanged =
    form.email.trim().toLowerCase() !==
    originalForm.email.trim().toLowerCase();

  // An edited email must not display as verified.
  const emailIsVerified =
    isEditing &&
    Boolean(form.email.trim()) &&
    Boolean(form.emailVerifiedAt) &&
    !emailChanged;

  // Verification requests must use saved account information.
  // Do not send an email while account changes are unsaved.
  const hasUnsavedChanges =
    isEditing &&
    (
      form.employee.trim() !== originalForm.employee.trim() ||
      form.username.trim() !== originalForm.username.trim() ||
      emailChanged ||
      form.role !== originalForm.role ||
      form.status !== originalForm.status ||
      Boolean(form.password || form.confirmPassword)
    );

  const canSendVerification =
    isEditing &&
    !formUnavailable &&
    !saving &&
    !sendingVerification &&
    !hasUnsavedChanges &&
    Boolean(originalForm.email.trim()) &&
    originalForm.status === "Active" &&
    form.status === "Active" &&
    !emailIsVerified;

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
                    email address, or password.
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
                      disabled={sendingVerification}
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
                        disabled={sendingVerification}
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
                        disabled={
                          (isEditing && isOwner) ||
                          sendingVerification
                        }
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

                {/* Sprint 4: Optional Email Address */}
                <div>
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="email"
                      className="font-semibold text-black"
                    >
                      Email Address
                    </label>

                    {isEditing && form.email.trim() && (
                      <span
                        className={`text-xs font-semibold ${
                          emailIsVerified
                            ? "text-green-700"
                            : "text-amber-700"
                        }`}
                      >
                        {emailChanged
                          ? "Unsaved change"
                          : emailIsVerified
                            ? "Verified"
                            : "Not verified"}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
                    />

                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      disabled={sendingVerification}
                      onChange={(event) =>
                        updateField(
                          "email",
                          event.target.value
                        )
                      }
                      placeholder="Enter email address..."
                      autoComplete="off"
                      maxLength={254}
                      aria-describedby="email-help"
                      className={`${inputStyle} pl-10`}
                    />
                  </div>

                  <p
                    id="email-help"
                    className="mt-1 text-xs text-gray-600"
                  >
                    Optional. Used for password recovery once
                    email verification is completed.
                  </p>

                  {isEditing &&
                    emailChanged &&
                    originalForm.emailVerifiedAt && (
                      <p className="mt-1 text-xs text-amber-700">
                        Changing or removing this address will
                        clear its verification status.
                      </p>
                    )}

                  {/* Account must exist before verification. */}
                  {!isEditing && form.email.trim() && (
                    <p className="mt-2 text-xs text-gray-600">
                      After creating this account, open Edit User
                      to send a verification email.
                    </p>
                  )}

                  {/* Sprint 4: Email verification controls */}
                  {isEditing &&
                    Boolean(form.email.trim()) &&
                    !emailIsVerified && (
                      <div className="mt-3 rounded-md border border-gray-300 bg-white p-3">
                        <button
                          type="button"
                          onClick={handleSendVerification}
                          disabled={!canSendVerification}
                          aria-busy={sendingVerification}
                          className="inline-flex items-center justify-center gap-2 rounded-md border border-green-900 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Send size={17} />

                          {sendingVerification
                            ? "Sending Verification Email..."
                            : "Send Verification Email"}
                        </button>

                        {hasUnsavedChanges ? (
                          <p className="mt-2 text-xs text-amber-700">
                            Save the account changes before
                            sending a verification email.
                          </p>
                        ) : form.status !== "Active" ? (
                          <p className="mt-2 text-xs text-amber-700">
                            Inactive accounts cannot verify
                            email addresses.
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-gray-600">
                            The account holder must open the
                            verification email and sign in
                            to complete verification.
                            The link expires after 24 hours.
                          </p>
                        )}
                      </div>
                    )}

                  {/* Verified status comes from PostgreSQL. */}
                  {emailIsVerified && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-green-700">
                      <Shield size={16} />
                      This email address has been verified.
                    </div>
                  )}
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
                      disabled={sendingVerification}
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
                      disabled={sendingVerification}
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
                      disabled={
                        (isEditing && isOwner) ||
                        sendingVerification
                      }
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
                      disabled={
                        (isEditing && isOwner) ||
                        sendingVerification
                      }
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
                    disabled={saving || sendingVerification}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-500 bg-white px-5 py-2 font-semibold text-black hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw size={20} />
                    {isEditing ? "Reset" : "Clear"}
                  </button>

                  <button
                    type="submit"
                    disabled={saving || sendingVerification}
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