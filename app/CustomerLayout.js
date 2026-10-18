// Shared layout for the seven Customer-related Figma pages.
// Keeps the header and sidebar consistent across all pages.

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  Users,
  List,
  Tag,
  FileText,
  Package,
  ChevronDown,
} from "lucide-react";

const navigation = [
  { label: "Home", href: "/main-dashboard", icon: House },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Products", href: "/customer-products", icon: List },
  { label: "Price List", href: "/customer-prices", icon: Tag },
  { label: "Contacts", href: "/customer-contacts", icon: FileText },
  { label: "Sale Items", href: "/sale-items", icon: Package },
  { label: "Sale Item Prices", href: "/sale-prices", icon: Tag },
];

export default function CustomerLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <div className="flex min-h-screen w-full flex-1 flex-col bg-white">

        {/* Shared farm header */}
        <header className="flex flex-wrap items-center justify-between gap-5 bg-white px-6 py-4">
          <Link href="/main-dashboard" aria-label="Main Dashboard">
            <Image
              src="/logos/greenLogoTractor.png"
              alt="Pleasant Grove Farms logo"
              width={210}
              height={145}
              className="h-auto w-[210px] object-contain"
              priority
            />
          </Link>

          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-green-950 lg:text-4xl">
              PLEASANT GROVE FARMS
            </h1>
            <p className="text-lg font-semibold text-emerald-700 lg:text-2xl">
              Business Management System
            </p>
          </div>

          <div className="flex min-h-24 min-w-56 items-center justify-center rounded-lg border border-green-950 bg-[#50966d] px-5 text-black">
            <div className="text-center">
              <div className="flex items-center gap-4 font-bold">
                Edward M. Sills
                <ChevronDown size={18} />
              </div>
              <p className="mt-2 text-sm font-semibold">Administrator</p>
            </div>
          </div>
        </header>

        {/* Sidebar and page content */}
        <div className="flex min-h-[calc(100vh-180px)] flex-1 flex-col md:flex-row">
          <aside className="w-full shrink-0 bg-[#e2e2e2] px-3 py-7 md:w-64">
            <nav className="space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href === "/customers" &&
                    pathname === "/add-new-customer");

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-5 rounded-md px-5 py-3 text-lg transition hover:bg-green-100 ${
                      active
                        ? "bg-[#d5f5d5] font-bold text-black"
                        : "text-black"
                    }`}
                  >
                    <Icon size={25} className="shrink-0 text-green-950" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 bg-white px-6 py-5">
     {children}
        </main>
        </div>
      </div>
    </div>
  );
}
