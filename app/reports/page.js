
"use client";

import { useState } from "react";
import { ChartColumnIncreasing, Search } from "lucide-react";
import FormWindow, { ExitButton, styles } from "../FormWindow";

const reportOptions = ["Report 1", "Report 2", "Report 3", "Cash Receipts"];

// Placeholder dropdown choices (Sprint 1 - no database yet)
const demoNames = ["All Customers", "Acme Foods", "Valley Grocers", "Sunrise Mills"];
const demoProducts = ["All Products", "Popcorn", "Wheat", "Hay Bales"];

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
    name: demoNames[0],
    product: demoProducts[0],
  });
  const [message, setMessage] = useState("");

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
      `Sprint 1 prototype: ${report} is not generated yet. Report data will be added in a future sprint.`
    );
  }

  return (
    <FormWindow
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
                {demoNames.map((name) => (
                  <option key={name}>{name}</option>
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
                {demoProducts.map((product) => (
                  <option key={product}>{product}</option>
                ))}
              </select>
            </div>
          </div>
        </Panel>
      </div>
    </FormWindow>
  );
}
