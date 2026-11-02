
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import LogoutButton from "./LogoutButton";
import AccessDeniedButton from "./AccessDeniedButton";
import FarmHeader from "@/components/FarmHeader";

import {
  ShoppingCart,
  Users,
  Truck,
  UserRound,
  Package,
  Landmark,
  ChartColumnIncreasing,
  FilePlus,
  FileSearch,
  Receipt,
  History,
  ClipboardList,
  Tags,
  Contact,
  Box,
  CreditCard,
  Wallet,
  CircleDollarSign,
  Banknote,
  BookOpen,
  Download,
  Settings,
  ChartNoAxesColumn,
  FileClock,
  Factory,
  ShoppingBag,
  List,
} from "lucide-react";

// Dashboard sections and their navigation buttons
const dashboardSections = [
  {
    title: "ORDERS & SALES",
    icon: ShoppingCart,
    items: [
      { label: "Enter Orders", href: "/order-details", icon: FilePlus },
      { label: "View Orders", href: "/orders-view", icon: ClipboardList },
      { label: "New Invoice", href: "/invoice-details", icon: Receipt },
      { label: "View Invoice", href: "/invoices-view", icon: FileSearch },
      {
        label: "History Sales",
        href: "/sales-history",
        icon: ChartColumnIncreasing,
      },
      { label: "Order Ship Cost", href: "/shipping", icon: Truck },
    ],
  },
  {
    title: "CUSTOMERS",
    icon: Users,
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Cust Product List", href: "/customer-products", icon: List },
      { label: "Cust Price List", href: "/customer-prices", icon: Tags },
      { label: "Cust Contacts", href: "/customer-contacts", icon: Contact },
      { label: "Sale Items", href: "/sale-items", icon: Box },
      { label: "Sale Item Prices", href: "/sale-prices", icon: Tags },
    ],
  },
  {
    title: "VENDORS & BILLS",
    icon: Truck,
    items: [
      { label: "Vendors", href: "/vendors", icon: Users },
      { label: "Enter Bills", href: "/bills", icon: FilePlus },
      { label: "Pay Bills", href: "/pay-bills", icon: CreditCard },
      {
        label: "Unpaid Invoices",
        href: "/unpaid-invoices",
        icon: FileClock,
      },
      { label: "View Payments", href: "/payments", icon: Wallet },
    ],
  },
  {
    title: "EMPLOYEES & PAYROLL",
    icon: Users,
    items: [
      { label: "Employees", href: "/employees", icon: UserRound },
      { label: "Pay Employees", href: "/pay-employees", icon: Banknote },
      { label: "View Payroll", href: "/payroll", icon: ClipboardList },
      {
        label: "Pay/Earnings Qry",
        href: "/earnings",
        icon: ChartNoAxesColumn,
      },
    ],
  },
  {
    title: "INVENTORY",
    icon: ShoppingBag,
    items: [
      { label: "Bagging Data", href: "/bagging", icon: Package },
      { label: "Bag Inventory", href: "/bag-inventory", icon: ShoppingBag },
      {
        label: "Proc Inventory",
        href: "/processing-inventory",
        icon: Factory,
      },
    ],
  },
  {
    title: "BANKING & FINANCE",
    icon: CircleDollarSign,
    adminOnly: true,
    items: [
      { label: "Bank Accounts", href: "/bank-accounts", icon: Landmark },
      { label: "View Banking", href: "/banking", icon: List },
      { label: "Reconciliation", href: "/reconciliation", icon: Receipt },
      { label: "Ledger Accounts", href: "/ledger", icon: BookOpen },
      {
        label: "Deposit Receivables",
        href: "/receivables",
        icon: Download,
      },
    ],
  },
  {
    title: "Reports",
    icon: ChartColumnIncreasing,
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: ChartColumnIncreasing,
      },
    ],
  },
];

// Reusable dashboard card
function DashboardSection({ section, isAdmin }) {
  const SectionIcon = section.icon;
  const restricted = section.adminOnly && !isAdmin;

  return (
    <section className="w-full self-start overflow-hidden rounded-md border border-gray-700 bg-white/95 shadow-md">
      {/* Green section heading */}
      <div className="flex items-center gap-2 bg-emerald-600 px-3 py-2 text-sm font-bold text-black">
        <SectionIcon size={23} strokeWidth={2.5} />
        <span>{section.title}</span>
      </div>

      {/* Navigation buttons */}
      <div className="space-y-1 p-1.5">
        {section.items.map((item) => {
          const ButtonIcon = item.icon;

          const buttonContent = (
            <>
              <ButtonIcon
                size={21}
                strokeWidth={2.2}
                className="shrink-0 text-green-900"
              />

              <span className="flex-1 text-center">
                {item.label} &gt;
              </span>
            </>
          );

          const buttonClass =
            "flex min-h-9 w-full items-center gap-3 rounded border border-gray-500 bg-white px-2.5 py-1 text-sm text-gray-900 transition hover:bg-emerald-100";

          if (restricted) {
            return (
              <AccessDeniedButton
                key={item.label}
                className={buttonClass}
              >
                {buttonContent}
              </AccessDeniedButton>
            );
          }

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
      </div>
    </section>
  );
}

// Bottom dashboard navigation
const bottomNavigation = [
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

// Main dashboard page
export default async function Home() {
  // STEP 1: Read and verify the session cookie.
  const userId = await getSessionUserId();

  // No valid session: redirect to Login.
  if (!userId) {
    redirect("/");
  }

  // STEP 2: Find the authenticated user in PostgreSQL.
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      status: true,
    },
  });

  // STEP 3: Only active accounts may access the dashboard.
  if (!user || user.status !== "Active") {
    redirect("/");
  }

  // Determine whether the authenticated user is an Administrator.
  const isAdmin = user.role === "Administrator";

  // STEP 4: Render the dashboard for the authenticated user.
  return (
    <main className="flex min-h-screen flex-col bg-gray-100">
      
      {/* DASHBOARD BACKGROUND */}
      <div
        className="flex flex-1 flex-col bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/logos/backroundImage.png')",
          backgroundSize: "100% 100%",
        }}
      >
        {/* Main dashboard modules */}
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardSections.map((section) => (
            <DashboardSection
              key={section.title}
              section={section}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {/* Bottom navigation */}
        <div className="mt-auto flex flex-wrap items-center justify-around gap-4 pt-5">
          {bottomNavigation.map((item) => {
            const BottomIcon = item.icon;

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

            const buttonClass =
              "flex min-h-16 w-auto min-w-[190px] items-center justify-center gap-3 rounded-md border border-gray-600 bg-white/95 px-5 py-2 text-green-950 shadow-md transition hover:bg-emerald-100";

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
        </div>
      </div>
    </main>
  );
}
