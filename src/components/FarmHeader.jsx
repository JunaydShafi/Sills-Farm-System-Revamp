
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/app/(protected)/main-dashboard/LogoutButton";

export default function FarmHeader({ user }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <header className="relative z-50 flex-none grid grid-cols-1 items-center gap-4 border-b-2 border-emerald-700 bg-white px-6 py-3 shadow-sm md:grid-cols-[185px_1fr_210px]">

      {/* Farm logo - Navigate to main dashboard */}
      <div className="flex justify-center">
        <Link
          href="/main-dashboard"
          aria-label="Go to main dashboard"
          className="cursor-pointer"
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
      </div>

      {/* Centered farm title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-950 lg:text-3xl">
          PLEASANT GROVE FARMS
        </h1>

        <p className="mt-1 text-lg font-semibold text-emerald-700 lg:text-xl">
          Business Management System
        </p>
      </div>

      {/* Authenticated user and dropdown */}
      <div
        className="relative flex justify-center"
        ref={userMenuRef}
      >
        <button
          type="button"
          onClick={() => setShowUserMenu((prev) => !prev)}
          aria-expanded={showUserMenu}
          aria-haspopup="true"
          className="flex w-full items-center justify-between rounded-lg border border-green-900 bg-emerald-600 px-4 py-4 text-black transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-800"
        >
          <div className="flex-1 text-center">
            <p className="font-bold">
              {user?.name ?? "User"}
            </p>

            <p className="text-sm">
              {user?.role ?? ""}
            </p>
          </div>

          <span className="text-sm">
            {showUserMenu ? "▲" : "▼"}
          </span>
        </button>

        {/* User dropdown */}
        {showUserMenu && (
          <div
            className="absolute right-0 top-full mt-2 z-[60] w-full min-w-[230px] rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
            role="menu"
          >
            <div className="mb-3 border-b border-gray-200 px-2 pb-3">
              <p className="font-bold text-green-950">
                {user?.name ?? "User"}
              </p>

              <p className="text-sm text-gray-500">
                {user?.role ?? ""}
              </p>
            </div>

            {/* Existing logout functionality */}
            <LogoutButton />
          </div>
        )}
      </div>

    </header>
  );
}
