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

        

        {/* Sidebar and page content */}
        <div className="flex min-h-[calc(100vh-180px)] flex-1 flex-col md:flex-row">
          

          <main className="min-w-0 flex-1 bg-white px-6 py-5">
     {children}
        </main>
        </div>
      </div>
    </div>
  );
}
