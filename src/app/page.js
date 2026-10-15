
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserRound, LockKeyhole, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{
        backgroundImage: "url('/logos/officeBuilding.jpeg')",
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

        {/* Login form */}
        <div className="mx-auto mt-6 max-w-[390px] border-t border-gray-400 pt-5">
          <div className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-lg font-bold text-black"
              >
                Username
              </label>

              <div className="flex items-center rounded-md border border-gray-500 bg-white px-3">
                <UserRound
                  size={22}
                  className="shrink-0 text-gray-800"
                />

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username..."
                  autoComplete="username"
                  className="w-full bg-transparent px-3 py-3 text-base text-black outline-none placeholder:italic placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-lg font-bold text-black"
              >
                Password
              </label>

              <div className="flex items-center rounded-md border border-gray-500 bg-white px-3">
                <LockKeyhole
                  size={22}
                  className="shrink-0 text-gray-800"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password..."
                  autoComplete="off"
                  className="w-full bg-transparent px-3 py-3 text-base text-black outline-none placeholder:italic placeholder:text-gray-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-green-950 hover:text-emerald-600"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={22} />
                  ) : (
                    <Eye size={22} />
                  )}
                </button>
              </div>
            </div>

            {/* Sprint 1 placeholder navigation */}
            <Link
              href="/main-dashboard"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-green-800 bg-emerald-600 px-4 py-3 text-lg font-bold italic text-white shadow-sm transition hover:bg-emerald-700"
            >
              <LogIn size={24} />
              Sign In
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          Sprint 1 prototype — authentication not yet implemented
        </p>
      </div>
    </main>
  );
}
