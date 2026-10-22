
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import LogoutButton from "@/app/(protected)/main-dashboard/LogoutButton";
import AccessDeniedButton from "@/app/(protected)/main-dashboard/AccessDeniedButton";

import {
  FilePlus,
  Settings,
  History,
} from "lucide-react";

// Shared bottom navigation
const navigation = [
  {
    label: "Federal Reporting",
    subtitle: "W2, 1099, 943, 940",
    href: "/federal-reporting",
    icon: FilePlus,
  },
  {
    label: "User Management",
    subtitle: "Add/Edit Users",
    href: "/user-management",
    icon: Settings,
    adminOnly: true,
  },
  {
    label: "Activity History",
    subtitle: "View System Changes",
    href: "/activity-history",
    icon: History,
  },
];

export default function FarmLayout({ children }) {
  // Authenticated user information
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Retrieve the logged-in user from our existing authentication API.
  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to retrieve user information.");
        }

        const data = await response.json();

        if (!data.authenticated || !data.user) {
          throw new Error("Invalid authentication response.");
        }

        setUser(data.user);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load user:", error);
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => controller.abort();
  }, []);

  // Only an authenticated Administrator can use admin-only links.
  const isAdmin = user?.role === "Administrator";

  return (
    <main className="flex min-h-screen flex-col bg-gray-100">

      {/* HEADER - Matches Main Dashboard */}
      <header className="relative grid grid-cols-1 items-center gap-4 border-b-2 border-emerald-700 bg-white px-6 py-3 shadow-sm md:grid-cols-[185px_1fr_210px]">

        {/* Farm logo - Click to return to dashboard */}
        <Link
          href="/main-dashboard"
          className="flex justify-center"
          aria-label="Return to Main Dashboard"
          title="Return to Main Dashboard"
        >
          <Image
            src="/logos/greenLogoTractor.png"
            alt="Pleasant Grove Farms tractor logo"
            width={185}
            height={135}
            className="h-auto w-[185px] object-contain"
            priority
          />
        </Link>

        {/* Centered farm title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-950 lg:text-3xl">
            PLEASANT GROVE FARMS
          </h1>

          <p className="mt-1 text-lg font-semibold text-emerald-700 lg:text-xl">
            Business Management System
          </p>
        </div>

        {/* Display the actual authenticated user's name and role */}
        <div className="flex items-center justify-center rounded-lg border border-green-900 bg-emerald-600 px-4 py-4 text-black">
          <div className="text-center">
            <p className="font-bold">
              {isLoadingUser
                ? "Loading..."
                : user?.name || "User unavailable"}
            </p>

            <p className="text-sm">
              {isLoadingUser
                ? "Verifying account"
                : user?.role || "Unknown role"}
            </p>
          </div>
        </div>
      </header>

      {/* FARM BACKGROUND */}
      <div
        className="flex flex-1 flex-col bg-center bg-no-repeat px-5 py-4"
        style={{
          backgroundImage: "url('/logos/backroundImage.png')",
          backgroundSize: "100% 100%",
        }}
      >

        {/* Page content */}
        <div className="flex w-full flex-1 flex-col">
          {children}
        </div>

        {/* BOTTOM NAVIGATION - Matches Main Dashboard */}
        <nav className="mt-auto flex flex-wrap items-center justify-around gap-4 pt-5">

          {navigation.map((item) => {
            const BottomIcon = item.icon;

            // Reusable navigation button content
            const buttonContent = (
              <>
                <BottomIcon
                  size={28}
                  strokeWidth={2.3}
                  className="shrink-0 text-green-900"
                />

                <div className="text-left">
                  <p className="font-semibold">
                    {item.label}
                  </p>

                  <p className="text-xs text-gray-700">
                    {item.subtitle}
                  </p>
                </div>
              </>
            );

            // Preserve the original button styling
            const buttonClass =
              "flex min-h-16 w-auto min-w-[190px] items-center justify-center gap-3 rounded-md border border-gray-600 bg-white/95 px-5 py-2 text-green-950 shadow-md transition hover:bg-emerald-100";

            // User Management requires Administrator privileges.
            if (item.adminOnly && !isAdmin) {
              return (
                <AccessDeniedButton
                  key={item.label}
                  className={buttonClass}
                >
                  {buttonContent}
                </AccessDeniedButton>
              );
            }

            // Normal navigation for permitted pages.
            return (
              <Link
                key={item.label}
                href={item.href}
                className={buttonClass}
              >
                {buttonContent}
              </Link>
            );
          })}

          {/* Functional logout button */}
          <LogoutButton />

        </nav>
      </div>
    </main>
  );
}
