
"use client";

import { useEffect, useState } from "react";
import { ChartColumnIncreasing, ArrowUpDown } from "lucide-react";
import FormWindow, { ExitButton, styles } from "@/app/FormWindow";
import { apiRequest } from "@/lib/apiClient";

// Sales come from PostgreSQL through /api/sales-history (SFBMSR-290).

const columns = [
  { key: "orderDate", label: "Order Date" },
  { key: "orderNo", label: "Order #" },
  { key: "type", label: "Type" },
  { key: "description", label: "Description" },
  { key: "proc", label: "Proc" },
  { key: "customer", label: "Customer" },
  { key: "factor", label: "Factor" },
  { key: "quantity", label: "Quantity" },
  { key: "lbs", label: "Lbs" },
  { key: "price", label: "Price", money: true },
  { key: "total", label: "Total", money: true },
];

// Shown for columns that need the orders and invoices tables (not built yet)
const notAvailable = "—";

function display(value) {
  return value === null || value === undefined || value === "" ? notAvailable : value;
}

function money(value) {
  if (value === null || value === undefined) {
    return notAvailable;
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function HistoricalSalesPage() {
  // Newest sales first; click a column heading to sort by it, again to reverse
  const [sort, setSort] = useState({ key: "orderDate", ascending: false });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Load recorded sales when the page opens
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { ok, data } = await apiRequest("/api/sales-history");
      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!ok) {
        setLoadError(data.error ?? "Unable to load sales history.");
        return;
      }

      setSales(data.sales);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = [...sales].sort((a, b) => {
    const first = a[sort.key];
    const second = b[sort.key];

    // Empty values always sort last
    if (first === null && second === null) return 0;
    if (first === null) return 1;
    if (second === null) return -1;

    const order =
      typeof first === "number"
        ? first - second
        : String(first).localeCompare(String(second));
    return sort.ascending ? order : -order;
  });

  function toggleSort(key) {
    setSort((previous) => ({
      key,
      ascending: previous.key === key ? !previous.ascending : true,
    }));
  }

  return (
    <FormWindow
      showPrototypeNote={false}
      title="Historical Sales"
      icon={ChartColumnIncreasing}
      footer={
        <div className="ml-auto">
          <ExitButton />
        </div>
      }
    >
      <div className="max-h-[440px] overflow-auto rounded-md border border-gray-500 bg-white">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={styles.tableHeading}>
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="inline-flex items-center gap-1 hover:text-emerald-700"
                  >
                    {column.label}
                    <ArrowUpDown
                      size={12}
                      className={
                        sort.key === column.key
                          ? "text-emerald-700"
                          : "text-gray-400"
                      }
                    />
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className={styles.tableCell}>
                    {column.money ? money(row[column.key]) : display(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-sm text-gray-500"
                >
                  {loading
                    ? "Loading sales history…"
                    : loadError || "No sales have been recorded yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-gray-600">
        Order #, Type, Customer, Price, and Total fill in once orders and invoices
        are added to the system.
      </p>
    </FormWindow>
  );
}
