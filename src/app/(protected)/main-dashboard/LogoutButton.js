
"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setIsLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout request failed.");
      }

      // Full navigation clears the previous account's client-side
      // router cache before displaying the login page.
      window.location.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Unable to log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex min-h-16 w-auto min-w-[190px] items-center justify-center gap-3 rounded-md border border-gray-600 bg-white/95 px-5 py-2 text-green-950 shadow-md transition hover:bg-emerald-100 disabled:opacity-60"
      >
        <LogOut
          size={28}
          strokeWidth={2.3}
          className="shrink-0 text-red-700"
        />

        <div className="text-left">
          <p className="font-semibold text-red-700">
            {isLoggingOut ? "Logging Out..." : "Exit System"}
          </p>
          <p className="text-xs text-gray-700">
            Close Application
          </p>
        </div>
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
