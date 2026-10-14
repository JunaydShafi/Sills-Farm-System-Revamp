
import Image from "next/image";
import Link from "next/link";

import {
  ShoppingCart,
  Users,
  Truck,
  UserRound,
  Package,
  Landmark,
  ChartColumnIncreasing,
  FilePlus,
  FileText,
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
  LogOut,
  ChevronDown,
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
      { label: "Enter Orders", href: "/orders", icon: FilePlus },
      { label: "View Orders", href: "/orders", icon: ClipboardList },
      { label: "New Invoice", href: "/invoices", icon: Receipt },
      { label: "View Invoice", href: "/invoices", icon: FileSearch },
      { label: "History Sales", href: "/sales-history", icon: ChartColumnIncreasing },
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
      { label: "Pay Bills", href: "/bills", icon: CreditCard },
      { label: "Unpaid Invoices", href: "/unpaid-invoices", icon: FileClock },
      { label: "View Payments", href: "/payments", icon: Wallet },
    ],
  },
  {
    title: "EMPLOYEES & PAYROLL",
    icon: Users,
    items: [
      { label: "Employees", href: "/employees", icon: UserRound },
      { label: "Pay Employees", href: "/payroll", icon: Banknote },
      { label: "View Payroll", href: "/payroll", icon: ClipboardList },
      { label: "Pay/Earnings Qry", href: "/earnings", icon: ChartNoAxesColumn },
    ],
  },
  {
    title: "INVENTORY",
    icon: ShoppingBag,
    items: [
      { label: "Bagging Data", href: "/bagging", icon: Package },
      { label: "Bag Inventory", href: "/bag-inventory", icon: ShoppingBag },
      { label: "Proc Inventory", href: "/processing-inventory", icon: Factory },
    ],
  },
  {
    title: "BANKING & FINANCE",
    icon: CircleDollarSign,
    items: [
      { label: "Bank Accounts", href: "/bank-accounts", icon: Landmark },
      { label: "View Banking", href: "/banking", icon: List },
      { label: "Reconciliation", href: "/reconciliation", icon: Receipt },
      { label: "Ledger Accounts", href: "/ledger", icon: BookOpen },
      { label: "Deposit Receivables", href: "/receivables", icon: Download },
    ],
  },
  {
    title: "Reports",
    icon: ChartColumnIncreasing,
    items: [
      { label: "Reports", href: "/reports", icon: ChartColumnIncreasing },
    ],
  },
];

// Reusable dashboard card
function DashboardSection({ section }) {
  const SectionIcon = section.icon;

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

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-h-9 items-center gap-3 rounded border border-gray-500 bg-white px-2.5 py-1 text-sm text-gray-900 transition hover:bg-emerald-100"
            >
              <ButtonIcon
                size={21}
                strokeWidth={2.2}
                className="shrink-0 text-green-900"
              />

              <span className="flex-1 text-center">
                {item.label} &gt;
              </span>
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

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-100">
      {/* HEADER */}
      <header className="relative grid grid-cols-1 items-center gap-4 border-b-2 border-emerald-700 bg-white px-6 py-3 shadow-sm md:grid-cols-[185px_1fr_210px]">
        {/* Farm logo */}
        <div className="flex justify-center">
          <Image
            src="/logos/greenLogoTractor.png"
            alt="Pleasant Grove Farms tractor logo"
            width={185}
            height={135}
            className="h-auto w-[185px] object-contain"
            priority
          />
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

        {/* Placeholder administrator display */}
        <div className="flex items-center justify-center gap-3 rounded-lg border border-green-900 bg-emerald-600 px-4 py-4 text-black">
          <div className="text-center">
            <p className="font-bold">Edward M. Sills</p>
            <p className="text-sm">Administrator</p>
          </div>

          <ChevronDown size={18} />
        </div>
      </header>

      {/* DASHBOARD BACKGROUND */}
      <div
        className="flex flex-1 flex-col bg-center bg-no-repeat px-5 py-4"
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
            />
          ))}
        </div>

        {/* Bottom navigation */}
        <div className="mt-auto flex flex-wrap items-center justify-around gap-4 pt-5">
          {bottomNavigation.map((item) => {
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
        </div>
      </div>
    </main>
  );
}
