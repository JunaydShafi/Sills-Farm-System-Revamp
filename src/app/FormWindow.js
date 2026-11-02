
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

// EXIT button - returns to the Main Dashboard.
// Pages with unsaved changes can pass onNavigate and call
// event.preventDefault() to show a warning before leaving.
export function ExitButton({ onNavigate }) {
  return (
    <Link
      href="/main-dashboard"
      onNavigate={onNavigate}
      className={styles.secondaryButton}
    >
      <LogOut size={18} className="text-red-700" />
      EXIT
    </Link>
  );
}

const messageTones = {
  info: "border-amber-300 bg-amber-50 text-amber-900",
  success: "border-emerald-300 bg-emerald-50 text-emerald-900",
  error: "border-red-300 bg-red-50 text-red-900",
};

// Message strip under the footer buttons. "info" (yellow) is the default,
// used for prototype notices; "success" and "error" are for action results.
export function PrototypeMessage({ message, tone = "info" }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`mt-4 rounded-md border p-3 text-center text-sm ${
        messageTones[tone] ?? messageTones.info
      }`}
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
  messageTone = "info",
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

          <PrototypeMessage message={message} tone={messageTone} />

          <p className="mt-3 text-center text-xs text-gray-500">
            Sprint 1 prototype — demonstration records only
          </p>
        </div>
      </section>
    </FarmLayout>
  );
}
