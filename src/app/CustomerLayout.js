// Shared layout for the seven Customer-related Figma pages.
// Keeps the header and sidebar consistent across all pages.

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";



export default function CustomerLayout({ children }) {

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
