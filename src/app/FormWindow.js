
import Link from "next/link";
import { LogOut } from "lucide-react";
import FarmLayout from "./FarmLayout";

// Shared button and input styles for the payroll / sales / report pages
export const styles = {
  primaryButton:
    "inline-flex items-center justify-center gap-2 rounded-md border border-green-900 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700",
  secondaryButton:
    "inline-flex items-center justify-center gap-2 rounded-md border border-gray-500 bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-gray-100",
  input:
    "w-full rounded-md border border-gray-400 bg-white px-2 py-1.5 text-sm text-black outline-none focus:border-emerald-600",
  filterLabel: "mb-1 block text-xs font-semibold text-white",
  tableHeading:
    "sticky top-0 border border-gray-400 bg-emerald-50 px-2 py-2 text-left text-xs font-bold whitespace-nowrap",
  tableCell: "border border-gray-300 px-2 py-1.5 text-xs whitespace-nowrap",
};

// EXIT button - returns to the Main Dashboard
export function ExitButton() {
  return (
    <Link href="/main-dashboard" className={styles.secondaryButton}>
      <LogOut size={18} className="text-red-700" />
      EXIT
    </Link>
  );
}

// Yellow prototype message shown after clicking a button that has no backend yet
export function PrototypeMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="status"
      className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-900"
    >
      {message}
    </p>
  );
}

// Window-style panel that matches the Figma mockups, placed inside the shared
// FarmLayout (header, farm background, bottom navigation).
// Gray title strip on top, page content, then a row of footer buttons.
export default function FormWindow({
  title,
  icon: TitleIcon,
  footer,
  message,
  maxWidth = "max-w-6xl",
  children,
}) {
  return (
    <FarmLayout>
      <section
        className={`mx-auto w-full ${maxWidth} overflow-hidden rounded-lg border border-gray-300 bg-[#f8f9f6] text-black shadow-lg`}
      >
        {/* Title strip */}
        <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-200 px-4 py-2">
          {TitleIcon && (
            <TitleIcon size={20} className="shrink-0 text-green-950" />
          )}
          <h2 className="font-semibold text-black">{title}</h2>
        </div>

        {/* Page content */}
        <div className="p-4">
          {children}

          {/* Footer buttons */}
          {footer && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {footer}
            </div>
          )}

          <PrototypeMessage message={message} />

          <p className="mt-3 text-center text-xs text-gray-500">
            Sprint 1 prototype — demonstration records only
          </p>
        </div>
      </section>
    </FarmLayout>
  );
}
