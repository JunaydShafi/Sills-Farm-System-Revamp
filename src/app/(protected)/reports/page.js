
"use client";

import { useEffect, useState } from "react";
import { ChartColumnIncreasing, Search } from "lucide-react";
import FormWindow, { ExitButton, styles } from "@/app/FormWindow";
import { apiRequest } from "@/lib/apiClient";

// Report names are placeholders until the Product Owner confirms the list
const reportOptions = ["Report 1", "Report 2", "Report 3", "Cash Receipts"];

// Customer and product choices come from PostgreSQL through
// /api/report-options (SFBMSR-291)
const allCustomers = "All Customers";
const allProducts = "All Products";

// Dark green panel heading used by both boxes
function Panel({ title, children }) {
  return (
    <div className="overflow-hidden rounded-md border-4 border-emerald-700 bg-white">
      <h3 className="bg-green-950 px-4 py-2 font-semibold text-white">
        {title}
      </h3>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function ReportsPage() {
  const [report, setReport] = useState(reportOptions[0]);
  const [params, setParams] = useState({
    startDate: "",
    endDate: "",
    name: allCustomers,
    product: allProducts,
  });
  const [customerNames, setCustomerNames] = useState([allCustomers]);
  const [productNames, setProductNames] = useState([allProducts]);
  const [message, setMessage] = useState("");

  // Load the customer and product dropdown choices when the page opens
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { ok, data } = await apiRequest("/api/report-options");
      if (cancelled) {
        return;
      }

      if (!ok) {
        setMessage(data.error ?? "Unable to load customers and products.");
        return;
      }

      setCustomerNames([allCustomers, ...data.customers.map((item) => item.name)]);
      setProductNames([allProducts, ...data.products.map((item) => item.name)]);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateParam(key, value) {
    setParams((previous) => ({ ...previous, [key]: value }));
    setMessage("");
  }

  function handleShow() {
    if (params.startDate && params.endDate && params.endDate < params.startDate) {
      setMessage("End Date must be on or after Start Date.");
      return;
    }

    setMessage(
      `${report} isn't available yet. Its contents are waiting on confirmation from the Product Owner.`
    );
  }

  return (
    <FormWindow
      showPrototypeNote={false}
      title="Sills Farms Reports"
      icon={ChartColumnIncreasing}
      maxWidth="max-w-4xl"
      message={message}
      footer={
        <div className="ml-auto flex gap-3">
          <button
            type="button"
            onClick={handleShow}
            className={styles.primaryButton}
          >
            <Search size={18} />
            SHOW
          </button>
          <ExitButton />
        </div>
      }
    >
      <div className="grid gap-5 rounded-md bg-gray-200 p-5 md:grid-cols-2">
        {/* Select Report */}
        <Panel title="Select Report">
          <fieldset className="space-y-4">
            <legend className="sr-only">Report to run</legend>
            {reportOptions.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-3 text-black"
              >
                <input
                  type="radio"
                  name="report"
                  value={option}
                  checked={report === option}
                  onChange={() => {
                    setReport(option);
                    setMessage("");
                  }}
                  className="h-4 w-4 accent-emerald-600"
                />
                {option}
              </label>
            ))}
          </fieldset>
        </Panel>

        {/* Enter Parameters */}
        <Panel title="Enter Parameters">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="report-start"
                  className="mb-1 block font-semibold text-black"
                >
                  Start Date
                </label>
                <input
                  id="report-start"
                  type="date"
                  value={params.startDate}
                  onChange={(event) =>
                    updateParam("startDate", event.target.value)
                  }
                  className={styles.input}
                />
              </div>

              <div>
                <label
                  htmlFor="report-end"
                  className="mb-1 block font-semibold text-black"
                >
                  End Date
                </label>
                <input
                  id="report-end"
                  type="date"
                  value={params.endDate}
                  onChange={(event) =>
                    updateParam("endDate", event.target.value)
                  }
                  className={styles.input}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="report-name"
                className="mb-1 block font-semibold text-black"
              >
                Name
              </label>
              <select
                id="report-name"
                value={params.name}
                onChange={(event) => updateParam("name", event.target.value)}
                className={styles.input}
              >
                {customerNames.map((name, nameIndex) => (
                  // Index in the key: two customers can share a name
                  <option key={`${nameIndex}-${name}`}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="report-product"
                className="mb-1 block font-semibold text-black"
              >
                Product
              </label>
              <select
                id="report-product"
                value={params.product}
                onChange={(event) =>
                  updateParam("product", event.target.value)
                }
                className={styles.input}
              >
                {productNames.map((product, productIndex) => (
                  <option key={`${productIndex}-${product}`}>{product}</option>
                ))}
              </select>
            </div>
          </div>
        </Panel>
      </div>
    </FormWindow>
  );
}
