
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Users,
  Truck,
  ChevronDown,
  ShoppingCart,
  ShoppingBag,
  CircleDollarSign,
  ChartColumnIncreasing,
} from "lucide-react";

const navigation = [
  { label: "Home", href: "/main-dashboard", icon: House },
  { label: "Orders & Sales", href:"#", icon: ShoppingCart, children: [
    { label: "Enter Orders", href: "/order-details",},
      { label: "View Orders", href: "/orders-view",},
      { label: "New Invoice", href: "/invoice-details",},
      { label: "View Invoice", href: "/invoices-view",},
      { label: "History Sales", href: "/sales-history",},
      { label: "Order Ship Cost", href: "/shipping",},
  ] },
  { label: "Customers", href: "#", icon: Users, children: [
      { label: "Customers", href: "/customers", },
      { label: "Cust Product List", href: "/customer-products", },
      { label: "Cust Price List", href: "/customer-prices", },
      { label: "Cust Contacts", href: "/customer-contacts", },
      { label: "Sale Items", href: "/sale-items", },
      { label: "Sale Item Prices", href: "/sale-prices", },
  ]},
  { label: "Vendors & Bills", href: "#", icon: Truck, children: [
      { label: "Vendors", href: "/vendors", },
      { label: "Enter Bills", href: "/bills", },
      { label: "Pay Bills", href: "/pay-bills", },
      { label: "Unpaid Invoices", href: "/unpaid-invoices", },
      { label: "View Payments", href: "/payments", },
  ],},
  { label: "Employees & Payroll", href: "#", icon: Users, children: [
      { label: "Employees", href: "/employees", },
      { label: "Pay Employees", href: "/pay-employees", },
      { label: "View Payroll", href: "/payroll", },
      { label: "Pay/Earnings Qry", href: "/earnings", },
  ], },
  { label: "Inventory", href: "#", icon: ShoppingBag, children: [
      { label: "Bagging Data", href: "/bagging", },
      { label: "Bag Inventory", href: "/bag-inventory", },
      { label: "Proc Inventory", href: "/processing-inventory", },
  ], },
  { label: "Banking & Finance", href: "#", icon: CircleDollarSign, children: [
      { label: "Bank Accounts", href: "/bank-accounts", },
      { label: "View Banking", href: "/banking", },
      { label: "Reconciliation", href: "/reconciliation", },
      { label: "Ledger Accounts", href: "/ledger", },
      { label: "Deposit Receivables", href: "/receivables", },
  ], },
  { label: "Reports", href: "#", icon: ChartColumnIncreasing, children:[
      { label: "Federal Reporting", href: "/federal-reporting", },
      { label: "Reports", href: "/reports", },
  ] },
];

export default function FarmSidebar() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState(null);
  
   // Automatically expand the section containing the current page.
  useEffect(() => {
    const activeSection = navigation.find(
      (item) =>
        item.children?.some(
          (child) =>
            pathname === child.href ||
            pathname.startsWith(`${child.href}/`)
        )
    );

      if (activeSection) {
      setOpenSection(activeSection.label);
    }
  }, [pathname]);

  function handleSectionClick(item) {
    if (!item.children?.length) return;

    setOpenSection((current) =>
      current === item.label ? null : item.label
    );
  }

  function isActive(href) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

   return (
    <nav
      aria-label="Main navigation"
      className="flex h-full min-h-0 shrink-0 flex-col gap-2 overflow-y-auto bg-gray-200 px-3 py-6 md:w-[250px]"
      >
      {navigation.map((item) => {
        const NavIcon = item.icon;
        const hasChildren = Boolean(item.children?.length);
        const isOpen = openSection === item.label;
        const sectionActive = item.children?.some((child) =>
          isActive(child.href)
        );

        return (
          <div key={item.label}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => handleSectionClick(item)}
                aria-expanded={isOpen}
                className={`flex w-full items-center gap-3 rounded-sm px-4 py-2.5 text-left text-base transition ${
                  sectionActive
                    ? "bg-green-200 font-bold text-black"
                    : "text-black hover:bg-gray-300"
                }`}
              >
                <NavIcon
                  size={22}
                  strokeWidth={1.8}
                  className="shrink-0 text-green-900"
                />

                <span className="flex-1">{item.label}</span>

                <ChevronDown
                  size={18}
                  className={`shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  />
              </button>
            ) : (
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-sm px-4 py-2.5 text-base transition ${
                  isActive(item.href)
                    ? "bg-green-200 font-bold text-black"
                    : "text-black hover:bg-gray-300"
                }`}
              >
                <NavIcon
                  size={22}
                  strokeWidth={1.8}
                  className="shrink-0 text-green-900"
                />
                {item.label}
              </Link>
            )}      
            {hasChildren && isOpen && (
              <div className="ml-5 mt-1 flex flex-col gap-1 border-l-2 border-emerald-700 pl-3">
                {item.children.map((child) => {
                  const childActive = isActive(child.href);
                  return (
                  <Link
                  key={child.href}
                  href={child.href}
                  aria-current={childActive ? "page" : undefined}
                  className={`flex items-center rounded-sm px-3 py-2 text-sm transition ${
                    childActive
                    ? "bg-green-100 font-bold text-black"
                    : "text-gray-800 hover:bg-gray-300"
                  }`}
                  >
                    {child.label}
                    </Link>
                    );
                    })}
                    </div>
                  )}
          </div>
        );
      })}
    </nav>
  );
}
