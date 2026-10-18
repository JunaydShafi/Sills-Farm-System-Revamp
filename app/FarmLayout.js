
import Image from "next/image";
import Link from "next/link";

import {
    FilePlus,
    Settings,
    History,
    LogOut,
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
    },
    {
        label: "Activity History",
        subtitle: "View System Changes",
        href: "/activity-history",
        icon: History,
    },
    {
        label: "Exit System",
        subtitle: "Close Application",
        href: "/",
        icon: LogOut,
    },
];

export default function FarmLayout({ children }) {
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

                {/* Placeholder administrator display */}
                <div className="flex items-center justify-center rounded-lg border border-green-900 bg-emerald-600 px-4 py-4 text-black">
                    <div className="text-center">
                        <p className="font-bold">
                            Edward M. Sills
                        </p>
                        <p className="text-sm">
                            Administrator
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

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex min-h-16 w-auto min-w-[190px] items-center justify-center gap-3 rounded-md border border-gray-600 bg-white/95 px-5 py-2 text-green-950 shadow-md transition hover:bg-emerald-100"
                            >
                                <BottomIcon
                                    size={28}
                                    strokeWidth={2.3}
                                    className={
                                        item.label === "Exit System"
                                            ? "shrink-0 text-red-700"
                                            : "shrink-0 text-green-900"
                                    }
                                />

                                <div className="text-left">
                                    <p
                                        className={
                                            item.label === "Exit System"
                                                ? "font-semibold text-red-700"
                                                : "font-semibold"
                                        }
                                    >
                                        {item.label}
                                    </p>

                                    <p className="text-xs text-gray-700">
                                        {item.subtitle}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </main>
    );
}
