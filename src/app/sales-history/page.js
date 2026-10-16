
"use client";

import { useState } from "react";
import { ChartColumnIncreasing, ArrowUpDown } from "lucide-react";
import FormWindow, { ExitButton, styles } from "../FormWindow";

// Demo sales history (Sprint 1 - no database yet)
const demoSales = [
  { id: 1, orderDate: "2001-01-01", orderNo: "0001", type: "Regular", description: "Popcorn", proc: "", customer: "Acme Foods", factor: "", quantity: 45, lbs: 450, price: 4500.0, total: 4500.0 },
  { id: 2, orderDate: "2001-01-01", orderNo: "0002", type: "Regular", description: "Popcorn", proc: "", customer: "Valley Grocers", factor: "", quantity: 32, lbs: 320, price: 320.0, total: 3200.0 },
  { id: 3, orderDate: "2001-01-02", orderNo: "0003", type: "Bulk", description: "Wheat", proc: "Acme", customer: "Sunrise Mills", factor: "", quantity: 7000, lbs: 700, price: 73000.0, total: 73000.0 },
  { id: 4, orderDate: "2001-01-02", orderNo: "0004", type: "Regular", description: "Hay Bales", proc: "", customer: "Green Acres Co.", factor: "", quantity: 29, lbs: 209, price: 209.0, total: 2090.0 },
];

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

function money(value) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function HistoricalSalesPage() {
  // Click a column heading to sort by it; click again to reverse
  const [sort, setSort] = useState({ key: "orderDate", ascending: true });

  const rows = [...demoSales].sort((a, b) => {
    const first = a[sort.key];
    const second = b[sort.key];
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
                    {column.money ? money(row[column.key]) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FormWindow>
  );
}
