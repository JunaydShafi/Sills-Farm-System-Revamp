
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

        
      </div>
    </main>
  );
}
