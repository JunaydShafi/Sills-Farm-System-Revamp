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

            {/* HEADER - Matches Main Dashboard */}
            <header className="relative grid grid-cols-1 items-center gap-4 bg-white px-6 py-3 md:grid-cols-[185px_1fr_auto_230px]">

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

                {/* Divider */}
                <div className="hidden h-[70px] w-px bg-gray-500 md:block" />

                {/* Placeholder administrator display */}
                <div className="relative flex items-center justify-center rounded-lg border border-green-900 bg-emerald-600 px-4 py-5 text-black">
                    <div className="text-center">
                        <p className="font-bold">
                            Edward M. Sills
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                            Administrator
                        </p>
                    </div>

                    <ChevronDown
                        size={18}
                        strokeWidth={2.5}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                    />
                </div>
            </header>

            <div className="flex flex-1 flex-col md:flex-row">

                {/* SIDEBAR */}
                <nav className="flex shrink-0 flex-col gap-2 bg-gray-200 px-3 py-6 md:w-[220px]">
                    {sectionItems.map((item) => (
                        <SidebarLink
                            key={item.href}
                            item={item}
                            active={item.href === pathname}
                        />
                    ))}
                </nav>

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
