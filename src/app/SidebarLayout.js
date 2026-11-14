"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Package,
    ShoppingBag,
    Factory,
    Landmark,
    List,
    Receipt,
    BookOpen,
    Download,
    ChevronDown,
    ArrowRight,
} from "lucide-react";

// Sidebar tabs for each dashboard section. Labels and hrefs match main-dashboard/page.js
const sidebarSections = [
    [
        { label: "Bagging Data", href: "/bagging", icon: Package },
        { label: "Bag Inventory", href: "/bag-inventory", icon: ShoppingBag },
        { label: "Proc Inventory", href: "/processing-inventory", icon: Factory },
    ],
    [
        { label: "Bank Accounts", href: "/bank-accounts", icon: Landmark },
        { label: "View Banking", href: "/banking", icon: List },
        { label: "Reconciliation", href: "/reconciliation", icon: Receipt },
        { label: "Ledger Accounts", href: "/ledger", icon: BookOpen },
        { label: "Deposit Receivables", href: "/receivables", icon: Download },
    ],
];

function SidebarLink({ item, active = false }) {
    const NavIcon = item.icon;

    return (
        <Link
            href={item.href}
            className={`flex items-center gap-4 rounded-sm px-4 py-2.5 text-lg transition ${
                active
                    ? "bg-green-200 font-bold text-black"
                    : "text-black hover:bg-gray-300"
            }`}
        >
            <NavIcon
                size={24}
                strokeWidth={1.8}
                className="shrink-0 text-green-900"
            />
            {item.label}
        </Link>
    );
}

// Shared layout with header and left sidebar
export default function SidebarLayout({ children }) {
    const pathname = usePathname();

    const sectionItems =
        sidebarSections.find((section) =>
            section.some((item) => item.href === pathname)
        ) ?? [];

    return (
        <main className="flex min-h-screen flex-col bg-white text-black">

            <div className="flex flex-1 flex-col md:flex-row">

                {/* Page content */}
                <div className="flex min-w-0 flex-1 flex-col px-6 py-4">
                    {children}
                </div>
            </div>
        </main>
    );
}

// Shared page heading
export function PageTitle({ title, subtitle }) {
    return (
        <div className="mb-3">
            <h2 className="text-3xl font-bold text-black">
                {title}
            </h2>
            <p className="text-sm text-gray-700">
                {subtitle}
            </p>
        </div>
    );
}

// Shared table footer with record count and page buttons
export function Pagination({ start, end, total }) {
    return (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
            <p>
                Showing {start}–{end} of {total} records
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="h-8 w-8 rounded bg-gray-800 font-semibold text-white"
                >
                    1
                </button>
                <button type="button" className="h-8 w-8 rounded hover:bg-gray-100">
                    2
                </button>
                <button type="button" className="h-8 w-8 rounded hover:bg-gray-100">
                    3
                </button>
                <span className="px-1">…</span>
                <button
                    type="button"
                    className="ml-3 flex items-center gap-1 rounded bg-gray-200 px-4 py-1.5 hover:bg-gray-300"
                >
                    Next
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
