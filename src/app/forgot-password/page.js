"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Mail,
  MailCheck,
  KeyRound,
  ArrowLeft,
  LogIn,
  LoaderCircle,
} from "lucide-react";

// ======================================================
// Page configuration
// ======================================================

const PRIMARY_BUTTON =
  "flex w-full items-center justify-center gap-3 rounded-md border border-green-800 bg-emerald-600 px-4 py-3 text-lg font-bold italic text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";

const SECONDARY_BUTTON =
  "flex w-full items-center justify-center gap-2 text-sm font-medium text-green-900 hover:underline disabled:opacity-60";

const RECOVERY_MESSAGE =
  "If an active account with a verified email address exists, a password reset link will be sent to that address.";

// ======================================================
// Forgot Password page
// ======================================================

export default function ForgotPasswordPage() {
  const submittingRef = useRef(false);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("ready");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ====================================================
  // Submit password recovery request
  // ====================================================

  async function handlePasswordRecovery(event) {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    setMessage("");

    // ==================================================
    // Validate and normalize the email address
    // ==================================================

    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanEmail ||
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setMessage("Please enter a valid email address.");
      return;
    }

    // Prevent simultaneous submissions.
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({
            email: cleanEmail,
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
            ? `Too many recovery requests. Please try again in ${Math.ceil(
                retryAfter
              )} seconds.`
            : "Too many recovery requests. Please try again later."
        );

        return;
      }

      // ================================================
      // Handle validation and server errors
      // ================================================

      if (!response.ok || data?.success !== true) {
        setMessage(
          data?.error ||
            "Unable to process your password recovery request. Please try again."
        );

        return;
      }

      // ================================================
      // Recovery request completed
      // ================================================

      // Always display the same confirmation message.
      // Do not reveal whether the email address belongs
      // to an existing or eligible account.
      setEmail("");
      setMessage(RECOVERY_MESSAGE);
      setStatus("success");
    } catch {
      // Do not log submitted email addresses.
      setMessage(
        "Unable to confirm your recovery request. Please check your email before trying again."
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

    setEmail("");
    setMessage("");

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

          {/* Password recovery request form */}
          {status === "ready" && (
            <div className="space-y-5">

              {/* Page heading */}
              <div className="flex flex-col items-center gap-3">
                <KeyRound
                  size={48}
                  className="text-emerald-700"
                />

                <h2 className="text-center text-xl font-bold text-black">
                  Forgot Your Password?
                </h2>

                <p className="text-center text-sm leading-relaxed text-gray-700">
                  Enter the email address associated
                  with your business system account
                  to request a secure password reset link.
                </p>
              </div>

              <form
                onSubmit={handlePasswordRecovery}
                className="space-y-5"
              >

                {/* Email address */}
                <div>
                  <label
                    htmlFor="recovery-email"
                    className="mb-1 block text-lg font-bold text-black"
                  >
                    Email Address
                  </label>

                  <div className="flex items-center rounded-md border border-gray-500 bg-white px-3 focus-within:ring-2 focus-within:ring-emerald-500">
                    <Mail
                      size={22}
                      className="shrink-0 text-gray-800"
                    />

                    <input
                      id="recovery-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="Enter your email address..."
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      maxLength={254}
                      required
                      disabled={isSubmitting}
                      className="min-w-0 w-full bg-transparent px-3 py-3 text-base text-black outline-none placeholder:italic placeholder:text-gray-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Error message */}
                {message && (
                  <p
                    role="alert"
                    className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {message}
                  </p>
                )}

                {/* Request reset link */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !email.trim()
                  }
                  className={PRIMARY_BUTTON}
                >
                  {isSubmitting ? (
                    <LoaderCircle
                      size={24}
                      className="animate-spin"
                    />
                  ) : (
                    <Mail size={24} />
                  )}

                  {isSubmitting
                    ? "Processing Request..."
                    : "Send Reset Link"}
                </button>

                {/* Administrator assistance */}
                <p className="text-center text-xs leading-relaxed text-gray-600">
                  If you do not have a verified email
                  address associated with your account,
                  please contact your Administrator
                  for assistance.
                </p>

                {/* Return to Login */}
                <button
                  type="button"
                  onClick={handleReturnToLogin}
                  disabled={isSubmitting}
                  className={SECONDARY_BUTTON}
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </form>
            </div>
          )}

          {/* Generic recovery confirmation */}
          {status === "success" && (
            <div className="space-y-5">

              <div className="flex flex-col items-center gap-3">
                <MailCheck
                  size={56}
                  className="text-emerald-700"
                />

                <h2 className="text-center text-xl font-bold text-emerald-800">
                  Check Your Email
                </h2>

                <p
                  role="status"
                  className="text-center text-sm leading-relaxed text-gray-700"
                >
                  {message}
                </p>

                <p className="text-center text-sm leading-relaxed text-gray-600">
                  The password reset link expires
                  after 15 minutes and can only
                  be used once.
                </p>
              </div>

              {/* Additional assistance */}
              <div className="space-y-2 rounded-md border border-gray-300 bg-white/60 px-4 py-3">

                <p className="text-sm font-bold text-gray-800">
                  Did not receive an email?
                </p>

                <p className="text-sm leading-relaxed text-gray-600">
                  Check your spam or junk folder.
                  If you still do not receive an
                  email, please contact your
                  Administrator for assistance.
                </p>
              </div>

              {/* Return to Login */}
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