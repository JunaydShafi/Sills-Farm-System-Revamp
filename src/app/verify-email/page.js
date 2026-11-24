"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  MailCheck,
  CheckCircle2,
  AlertCircle,
  LockKeyhole,
  LogIn,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";

const TOKEN_STORAGE_KEY = "sills_farm_email_verification";

const PRIMARY_BUTTON =
  "flex w-full items-center justify-center gap-3 rounded-md border border-green-800 bg-emerald-600 px-4 py-3 text-lg font-bold italic text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";

const SECONDARY_BUTTON =
  "flex w-full items-center justify-center gap-2 text-sm font-medium text-green-900 hover:underline disabled:opacity-60";

// ======================================================
// Validate the expected token format
// ======================================================

function isValidToken(token) {
  return (
    typeof token === "string" &&
    /^[a-f0-9]{64}$/.test(token)
  );
}

// ======================================================
// Email verification page
// ======================================================

export default function VerifyEmailPage() {
  const submittingRef = useRef(false);

  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ====================================================
  // Retrieve the verification token
  // ====================================================

  useEffect(() => {
    // Initialize browser-specific information after mount.
    // Scheduling the initialization avoids synchronous
    // state updates directly inside the effect.
    const initializationTimer = window.setTimeout(() => {
      try {
        const url = new URL(window.location.href);

        // New verification links use a URL fragment.
        const fragment = new URLSearchParams(
          url.hash.slice(1)
        );

        const fragmentToken = fragment.get("token");

        // Temporarily support older query-style links
        // during local development.
        const queryToken =
          process.env.NODE_ENV === "development"
            ? url.searchParams.get("token")
            : null;

        const incomingToken =
          fragmentToken ?? queryToken;

        // Remove the token from the visible browser URL.
        if (url.hash || url.search) {
          window.history.replaceState(
            window.history.state,
            "",
            "/verify-email"
          );
        }

        let verificationToken;

        if (incomingToken !== null) {
          // A new link replaces any previously stored token.
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);

          verificationToken = incomingToken;
        } else {
          // Restore the token after authentication.
          verificationToken = sessionStorage.getItem(
            TOKEN_STORAGE_KEY
          );
        }

        if (!isValidToken(verificationToken)) {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);

          setToken(null);
          setStatus("invalid");
          setMessage(
            "This verification link is missing or invalid. Please contact your Administrator."
          );

          return;
        }

        // Preserve the token within the current browser tab.
        sessionStorage.setItem(
          TOKEN_STORAGE_KEY,
          verificationToken
        );

        setToken(verificationToken);
        setMessage("");
        setStatus("ready");
      } catch {
        try {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
          // Storage may be unavailable.
        }

        setToken(null);
        setStatus("invalid");
        setMessage(
          "Unable to prepare email verification. Please reopen the link from your email."
        );
      }
    }, 0);

    // Prevent initialization after the component unmounts.
    // This also supports React Strict Mode in development.
    return () => {
      window.clearTimeout(initializationTimer);
    };
  }, []);

  // ====================================================
  // Remove the temporary verification token
  // ====================================================

  function clearVerificationToken() {
    setToken(null);

    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Storage may be unavailable.
    }
  }

  // ====================================================
  // Submit email verification
  // ====================================================

  async function handleVerification() {
    if (submittingRef.current) {
      return;
    }

    if (!isValidToken(token)) {
      clearVerificationToken();

      setStatus("invalid");
      setMessage(
        "This verification link is invalid. Please contact your Administrator."
      );

      return;
    }

    // Prevent multiple simultaneous submissions.
    submittingRef.current = true;
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/auth/verify-email/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({
            token,
          }),
        }
      );

      const data = await response.json();

      // Authentication is required before confirmation.
      if (response.status === 401) {
        setStatus("login-required");
        setMessage(
          "Please sign in to the account associated with this verification email."
        );

        return;
      }

      // Preserve the token when temporarily rate limited.
      if (response.status === 429) {
        setStatus("ready");
        setMessage(
          data.retryAfter
            ? `Too many attempts. Please try again in ${data.retryAfter} seconds.`
            : "Too many attempts. Please try again later."
        );

        return;
      }

      // The token may be invalid, expired, revoked,
      // previously used, or assigned to another account.
      if (response.status === 400) {
        setStatus("invalid");
        setMessage(
          data.error ||
            "This verification link is invalid, expired, or does not belong to your account."
        );

        return;
      }

      // Handle denied or inactive accounts.
      if (response.status === 403) {
        setStatus("login-required");
        setMessage(
          "Please ensure you are signed in to the correct active account."
        );

        return;
      }

      // Unexpected errors may be retried.
      if (!response.ok || data.success !== true) {
        setStatus("ready");
        setMessage(
          data.error ||
            "Unable to verify your email address. Please try again."
        );

        return;
      }

      // Verification completed successfully.
      clearVerificationToken();

      setStatus("success");
      setMessage(
        "Your email address has been verified successfully."
      );
    } catch {
      setStatus("ready");
      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  // ====================================================
  // Navigation
  // ====================================================

  function handleSignIn() {
    // Only a fixed internal destination is permitted.
    window.location.replace(
      "/?continue=verify-email"
    );
  }

  function handleCancel() {
    clearVerificationToken();
    window.location.replace("/");
  }

  function handleDashboard() {
    clearVerificationToken();
    window.location.replace("/main-dashboard");
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
                Preparing email verification...
              </p>
            </div>
          )}

          {/* Verification confirmation */}
          {status === "ready" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <MailCheck
                  size={48}
                  className="text-emerald-700"
                />

                <h2 className="text-center text-xl font-bold text-black">
                  Verify Your Email Address
                </h2>

                <p className="text-center text-sm leading-relaxed text-gray-700">
                  Confirm your email address to enable
                  secure password recovery for your
                  business system account.
                </p>
              </div>

              {message && (
                <p
                  role="alert"
                  className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={handleVerification}
                disabled={isSubmitting}
                className={PRIMARY_BUTTON}
              >
                {isSubmitting ? (
                  <LoaderCircle
                    size={24}
                    className="animate-spin"
                  />
                ) : (
                  <MailCheck size={24} />
                )}

                {isSubmitting
                  ? "Verifying..."
                  : "Verify Email Address"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className={SECONDARY_BUTTON}
              >
                <ArrowLeft size={16} />
                Cancel and Return to Login
              </button>
            </div>
          )}

          {/* Authentication required */}
          {status === "login-required" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <LockKeyhole
                  size={48}
                  className="text-emerald-700"
                />

                <h2 className="text-center text-xl font-bold text-black">
                  Sign In Required
                </h2>

                <p className="text-center text-sm leading-relaxed text-gray-700">
                  {message}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignIn}
                className={PRIMARY_BUTTON}
              >
                <LogIn size={24} />
                Sign In
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className={SECONDARY_BUTTON}
              >
                Cancel Verification
              </button>
            </div>
          )}

          {/* Successful verification */}
          {status === "success" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2
                  size={56}
                  className="text-emerald-700"
                />

                <h2 className="text-center text-xl font-bold text-emerald-800">
                  Email Successfully Verified
                </h2>

                <p
                  role="status"
                  className="text-center text-sm leading-relaxed text-gray-700"
                >
                  {message}
                </p>

                <p className="text-center text-sm text-gray-600">
                  Your email address is now eligible for
                  password recovery.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDashboard}
                className={PRIMARY_BUTTON}
              >
                Return to Main Dashboard
              </button>
            </div>
          )}

          {/* Invalid or expired verification link */}
          {status === "invalid" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle
                  size={48}
                  className="text-red-700"
                />

                <h2 className="text-center text-xl font-bold text-red-700">
                  Unable to Verify Email
                </h2>

                <p
                  role="alert"
                  className="text-center text-sm leading-relaxed text-gray-700"
                >
                  {message}
                </p>

                <p className="text-center text-sm text-gray-600">
                  Make sure you are using the correct
                  account, or contact your Administrator
                  for a new verification email.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  isValidToken(token)
                    ? handleSignIn
                    : handleCancel
                }
                className={PRIMARY_BUTTON}
              >
                <LogIn size={24} />
                Return to Login
              </button>

              {isValidToken(token) && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className={SECONDARY_BUTTON}
                >
                  Cancel Verification
                </button>
              )}
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