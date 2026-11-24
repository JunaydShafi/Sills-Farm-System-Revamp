"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ArrowLeft,
  LoaderCircle,
  Check,
  Circle,
} from "lucide-react";

// ======================================================
// Page configuration
// ======================================================

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_BYTES = 72;

const PRIMARY_BUTTON =
  "flex w-full items-center justify-center gap-3 rounded-md border border-green-800 bg-emerald-600 px-4 py-3 text-lg font-bold italic text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";

const SECONDARY_BUTTON =
  "flex w-full items-center justify-center gap-2 text-sm font-medium text-green-900 hover:underline disabled:opacity-60";

const INVALID_TOKEN_MESSAGE =
  "This password reset link is invalid or has expired. Please request a new password reset link.";

// ======================================================
// Token validation
// ======================================================

function isValidToken(token) {
  return (
    typeof token === "string" &&
    /^[a-f0-9]{64}$/.test(token)
  );
}

// ======================================================
// Password input component
// ======================================================

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggleVisibility,
  disabled,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-lg font-bold text-black"
      >
        {label}
      </label>

      <div className="flex items-center rounded-md border border-gray-500 bg-white px-3 focus-within:ring-2 focus-within:ring-emerald-500">
        <LockKeyhole
          size={22}
          className="shrink-0 text-gray-800"
        />

        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          autoComplete="new-password"
          required
          disabled={disabled}
          className="min-w-0 w-full bg-transparent px-3 py-3 text-base text-black outline-none placeholder:italic placeholder:text-gray-500 disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          className="shrink-0 text-green-950 hover:text-emerald-600 disabled:opacity-60"
          aria-label={
            showPassword
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff size={22} />
          ) : (
            <Eye size={22} />
          )}
        </button>
      </div>
    </div>
  );
}

// ======================================================
// Password requirement indicator
// ======================================================

function PasswordRequirement({
  satisfied,
  children,
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm ${
        satisfied
          ? "text-emerald-700"
          : "text-gray-600"
      }`}
    >
      {satisfied ? (
        <Check
          size={16}
          className="shrink-0"
          aria-label="Requirement satisfied"
        />
      ) : (
        <Circle
          size={14}
          className="shrink-0"
          aria-label="Requirement not yet satisfied"
        />
      )}

      <span>{children}</span>
    </div>
  );
}

// ======================================================
// Reset Password page
// ======================================================

export default function ResetPasswordPage() {
  const submittingRef = useRef(false);

  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // ====================================================
  // Derived password validation
  // ====================================================

  const passwordBytes =
    new TextEncoder().encode(password).length;

  const hasMinimumLength =
    password.length >= MIN_PASSWORD_LENGTH;

  const hasValidByteLength =
    password.length > 0 &&
    passwordBytes <= MAX_PASSWORD_BYTES;

  const hasNonWhitespace =
    password.trim().length > 0;

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  const passwordIsValid =
    hasMinimumLength &&
    hasValidByteLength &&
    hasNonWhitespace &&
    passwordsMatch;

  // ====================================================
  // Retrieve the password reset token
  // ====================================================

  useEffect(() => {
    // Initialize browser-specific information after mount.
    // This follows the same initialization pattern used
    // by our email verification page.
    const initializationTimer = window.setTimeout(() => {
      try {
        const url = new URL(window.location.href);

        // Password reset links use URL fragments.
        // The token is not included in the initial
        // HTTP request to the server.
        const fragment = new URLSearchParams(
          url.hash.slice(1)
        );

        const incomingToken = fragment.get("token");

        // Remove the token from the browser address bar
        // and replace the current history entry.
        if (url.hash || url.search) {
          window.history.replaceState(
            window.history.state,
            "",
            "/reset-password"
          );
        }

        // Only accept correctly formatted reset tokens.
        // Actual token validity is checked by the API.
        if (!isValidToken(incomingToken)) {
          setToken(null);
          setStatus("invalid");
          setMessage(INVALID_TOKEN_MESSAGE);

          return;
        }

        // Keep the token in temporary component memory.
        // Do not store password reset tokens in
        // localStorage or sessionStorage.
        setToken(incomingToken);
        setStatus("ready");
        setMessage("");
      } catch {
        setToken(null);
        setStatus("invalid");

        setMessage(
          "Unable to prepare password recovery. Please reopen the link from your email."
        );
      }
    }, 0);

    return () => {
      window.clearTimeout(initializationTimer);
    };
  }, []);

  // ====================================================
  // Clear sensitive form information
  // ====================================================

  function clearSensitiveInformation() {
    setToken(null);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  // ====================================================
  // Submit password reset
  // ====================================================

  async function handlePasswordReset(event) {
    event.preventDefault();

    // Prevent simultaneous submissions.
    if (submittingRef.current) {
      return;
    }

    setMessage("");

    // ==================================================
    // Validate reset token
    // ==================================================

    if (!isValidToken(token)) {
      clearSensitiveInformation();
      setStatus("invalid");
      setMessage(INVALID_TOKEN_MESSAGE);

      return;
    }

    // ==================================================
    // Validate password requirements
    // ==================================================

    if (!hasNonWhitespace) {
      setMessage(
        "Please enter and confirm your new password."
      );

      return;
    }

    if (!hasMinimumLength) {
      setMessage(
        "Password must contain at least 12 characters."
      );

      return;
    }

    if (!hasValidByteLength) {
      setMessage(
        "Password must not exceed 72 UTF-8 bytes."
      );

      return;
    }

    if (!passwordsMatch) {
      setMessage("Passwords do not match.");

      return;
    }

    // ==================================================
    // Send the reset request
    // ==================================================

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({
            token,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json().catch(
        () => null
      );

      // ================================================
      // Handle request throttling
      // ================================================

      if (response.status === 429) {
        const retryAfter = Number(
          response.headers.get("Retry-After") ??
            data?.retryAfter
        );

        setMessage(
          Number.isFinite(retryAfter) &&
            retryAfter > 0
            ? `Too many attempts. Please try again in ${Math.ceil(
                retryAfter
              )} seconds.`
            : "Too many attempts. Please try again later."
        );

        return;
      }

      // ================================================
      // Handle invalid or expired reset tokens
      // ================================================

      if (
        response.status === 400 &&
        data?.error === INVALID_TOKEN_MESSAGE
      ) {
        clearSensitiveInformation();
        setStatus("invalid");
        setMessage(INVALID_TOKEN_MESSAGE);

        return;
      }

      // ================================================
      // Handle other validation or server errors
      // ================================================

      if (!response.ok || data?.success !== true) {
        setMessage(
          data?.error ||
            "Unable to reset your password. Please try again."
        );

        return;
      }

      // ================================================
      // Password reset completed successfully
      // ================================================

      clearSensitiveInformation();

      setStatus("success");

      setMessage(
        "Your password has been reset successfully. Please sign in with your new password."
      );
    } catch {
      // Do not log sensitive reset tokens or passwords.
      setMessage(
        "Unable to confirm the password reset result. You may try signing in with your new password or request a new reset link."
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  // ====================================================
  // Navigation
  // ====================================================

  function handleReturnToLogin() {
    if (submittingRef.current) {
      return;
    }

    clearSensitiveInformation();

    // Password reset does not automatically authenticate
    // the user. Always return to the login screen.
    window.location.replace("/");
  }

  // ====================================================
  // Page appearance
  // ====================================================

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{
        backgroundImage:
          "url('/logos/officeBuilding.jpeg')",
      }}
    >
      <div className="w-full max-w-[540px] rounded-lg border border-gray-500 bg-[#f1f2ef] px-8 py-7 shadow-2xl sm:px-12">

        {/* Farm logo and title */}
        <div className="flex flex-col items-center">
          <Image
            src="/logos/blackTractorLogin.png"
            alt="Sills Farm tractor logo"
            width={220}
            height={120}
            className="h-auto w-auto max-w-full object-contain"
            priority
          />

          <h1 className="mt-2 text-center text-2xl font-bold leading-tight text-black">
            Sills Farm
            <span className="block">
              Business Management System
            </span>
          </h1>
        </div>

        <div className="mx-auto mt-6 max-w-[390px] border-t border-gray-400 pt-6">

          {/* Loading state */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <LoaderCircle
                size={40}
                className="animate-spin text-emerald-700"
              />

              <p
                role="status"
                className="text-center text-gray-700"
              >
                Preparing password recovery...
              </p>
            </div>
          )}

          {/* Password reset form */}
          {status === "ready" && (
            <div className="space-y-5">

              {/* Page heading */}
              <div className="flex flex-col items-center gap-3">
                <LockKeyhole
                  size={48}
                  className="text-emerald-700"
                />

                <h2 className="text-center text-xl font-bold text-black">
                  Reset Your Password
                </h2>

                <p className="text-center text-sm leading-relaxed text-gray-700">
                  Enter and confirm your new password
                  to regain access to your business
                  system account.
                </p>
              </div>

              <form
                onSubmit={handlePasswordReset}
                className="space-y-5"
              >

                {/* New password */}
                <PasswordInput
                  id="new-password"
                  label="New Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter new password..."
                  showPassword={showPassword}
                  onToggleVisibility={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  disabled={isSubmitting}
                />

                {/* Confirm new password */}
                <PasswordInput
                  id="confirm-password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm new password..."
                  showPassword={showConfirmPassword}
                  onToggleVisibility={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  disabled={isSubmitting}
                />

                {/* Password requirements */}
                <div className="space-y-2 rounded-md border border-gray-300 bg-white/60 px-4 py-3">
                  <p className="text-sm font-bold text-gray-800">
                    Password Requirements
                  </p>

                  <PasswordRequirement
                    satisfied={hasMinimumLength}
                  >
                    At least 12 characters
                  </PasswordRequirement>

                  <PasswordRequirement
                    satisfied={hasValidByteLength}
                  >
                    Maximum 72 UTF-8 bytes
                  </PasswordRequirement>

                  <PasswordRequirement
                    satisfied={hasNonWhitespace}
                  >
                    Cannot contain only whitespace
                  </PasswordRequirement>

                  <PasswordRequirement
                    satisfied={passwordsMatch}
                  >
                    Passwords must match
                  </PasswordRequirement>
                </div>

                {/* Existing session warning */}
                <p className="text-center text-xs leading-relaxed text-gray-600">
                  Resetting your password will sign
                  your account out of all existing
                  sessions.
                </p>

                {/* Error message */}
                {message && (
                  <p
                    role="alert"
                    className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {message}
                  </p>
                )}

                {/* Reset Password button */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting || !passwordIsValid
                  }
                  className={PRIMARY_BUTTON}
                >
                  {isSubmitting ? (
                    <LoaderCircle
                      size={24}
                      className="animate-spin"
                    />
                  ) : (
                    <LockKeyhole size={24} />
                  )}

                  {isSubmitting
                    ? "Resetting Password..."
                    : "Reset Password"}
                </button>

                {/* Cancel password reset */}
                <button
                  type="button"
                  onClick={handleReturnToLogin}
                  disabled={isSubmitting}
                  className={SECONDARY_BUTTON}
                >
                  <ArrowLeft size={16} />
                  Cancel and Return to Login
                </button>
              </form>
            </div>
          )}

          {/* Successful password reset */}
          {status === "success" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2
                  size={56}
                  className="text-emerald-700"
                />

                <h2 className="text-center text-xl font-bold text-emerald-800">
                  Password Successfully Reset
                </h2>

                <p
                  role="status"
                  className="text-center text-sm leading-relaxed text-gray-700"
                >
                  {message}
                </p>

                <p className="text-center text-sm text-gray-600">
                  All previous sessions for your
                  account have been revoked.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReturnToLogin}
                className={PRIMARY_BUTTON}
              >
                <LogIn size={24} />
                Return to Login
              </button>
            </div>
          )}

          {/* Invalid or expired reset link */}
          {status === "invalid" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle
                  size={48}
                  className="text-red-700"
                />

                <h2 className="text-center text-xl font-bold text-red-700">
                  Unable to Reset Password
                </h2>

                <p
                  role="alert"
                  className="text-center text-sm leading-relaxed text-gray-700"
                >
                  {message}
                </p>

                <p className="text-center text-sm text-gray-600">
                  Request a new password reset email
                  or contact your Administrator
                  for assistance.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReturnToLogin}
                className={PRIMARY_BUTTON}
              >
                <LogIn size={24} />
                Return to Login
              </button>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          Pleasant Grove Farms — Business Management System
        </p>
      </div>
    </main>
  );
}