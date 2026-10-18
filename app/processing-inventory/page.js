"use client";

import { useState } from "react";
import { Box } from "lucide-react";
import SidebarLayout, { PageTitle, Pagination } from "../SidebarLayout";

const demoProcRecords = [
  { proc: 1001, description: "Black Beans", product: "BB", mStatus: "Clean", closeError: "", outLb: 1500, rerunLb: "", soldLbs: 300, bulkInvLbs: 1200, closed: false },
  { proc: 1002, description: "Split Peas", product: "SP", mStatus: "Clean", closeError: "", outLb: 2000, rerunLb: "", soldLbs: 500, bulkInvLbs: 1500, closed: false },
  { proc: 1003, description: "Pinto Beans", product: "PB", mStatus: "Rerun", closeError: 0, outLb: 900, rerunLb: 900, soldLbs: "", bulkInvLbs: 0, closed: true },
  { proc: 1004, description: "Green Peas", product: "GP", mStatus: "Clean", closeError: 0, outLb: 1200, rerunLb: "", soldLbs: 1200, bulkInvLbs: 0, closed: true },
  { proc: 1005, description: "Yellow Peas", product: "YP", mStatus: "Rerun", closeError: 0, outLb: 750, rerunLb: 750, soldLbs: "", bulkInvLbs: 0, closed: true },
  { proc: 1006, description: "Kidney Beans", product: "KB", mStatus: "Screening", closeError: 0, outLb: 600, rerunLb: "", soldLbs: 600, bulkInvLbs: 0, closed: true },
  { proc: 1007, description: "Navy Beans", product: "NB", mStatus: "Clean", closeError: 0, outLb: 1000, rerunLb: "", soldLbs: 1000, bulkInvLbs: 0, closed: true },
  { proc: 1008, description: "Chickpeas", product: "CP", mStatus: "Screening", closeError: 0, outLb: 850, rerunLb: "", soldLbs: 850, bulkInvLbs: 0, closed: true },
  { proc: 1009, description: "Lima Beans", product: "LB", mStatus: "Screening", closeError: 0, outLb: 700, rerunLb: "", soldLbs: 700, bulkInvLbs: 0, closed: true },
  { proc: 1010, description: "Snow Peas", product: "SN", mStatus: "Screening", closeError: 0, outLb: 950, rerunLb: "", soldLbs: 950, bulkInvLbs: 0, closed: true },
  { proc: 1011, description: "Red Beans", product: "RB", mStatus: "Screening", closeError: 0, outLb: 500, rerunLb: "", soldLbs: 500, bulkInvLbs: 0, closed: true },
];

const columns = [
  { key: "proc", label: "Proc", align: "text-left" },
  { key: "description", label: "Description", align: "text-left" },
  { key: "product", label: "Product", align: "text-left" },
  { key: "mStatus", label: "MStatus", align: "text-left" },
  { key: "closeError", label: "Proc Close Error", align: "text-right" },
  { key: "outLb", label: "Proc Out lb", align: "text-right" },
  { key: "rerunLb", label: "Rerun lb", align: "text-right" },
  { key: "soldLbs", label: "Sold lbs", align: "text-right" },
  { key: "bulkInvLbs", label: "Bulk Inv lbs", align: "text-right" },
  { key: "baggedInv", label: "Bagged Inv", align: "text-right" },
  { key: "adjLbs", label: "Adj lbs", align: "text-right" },
];

const cellStyle = "border-x border-gray-300 px-2 py-1";

const filterStyle =
  "w-full rounded-md border border-gray-400 bg-white px-2 py-1.5 text-sm text-black outline-none focus:border-emerald-600";

const initialFilters = {
  proc: "All processes",
  product: "All products",
  mStatus: "All statuses",
  openClosed: "All records",
};

const actionButtonStyle =
  "rounded-md border border-gray-400 bg-white px-5 py-1.5 text-sm font-semibold text-green-950 hover:bg-emerald-50";

export default function ProcInventoryPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [selectedProc, setSelectedProc] = useState(1001);

  function updateFilter(field, value) {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  return (
    <SidebarLayout activeItem={{ label: "Inventory", href: "/processing-inventory", icon: Box }}>
      <PageTitle
        title="Proc Inventory"
        subtitle="Process balances and closure status"
      />

      {/* Filters */}
      <div className="mb-3 grid grid-cols-2 items-end gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]">
        <label className="text-sm font-bold text-black">
          Proc
          <select
            value={filters.proc}
            onChange={(event) => updateFilter("proc", event.target.value)}
            className={`${filterStyle} mt-1 font-normal`}
          >
            <option>All processes</option>
            {demoProcRecords.map((record) => (
              <option key={record.proc}>{record.proc}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-bold text-black">
          Product
          <select
            value={filters.product}
            onChange={(event) => updateFilter("product", event.target.value)}
            className={`${filterStyle} mt-1 font-normal`}
          >
            <option>All products</option>
            {demoProcRecords.map((record) => (
              <option key={record.product}>{record.description}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-bold text-black">
          MStatus
          <select
            value={filters.mStatus}
            onChange={(event) => updateFilter("mStatus", event.target.value)}
            className={`${filterStyle} mt-1 font-normal`}
          >
            <option>All statuses</option>
            <option>Clean</option>
            <option>Rerun</option>
            <option>Screening</option>
          </select>
        </label>

        <label className="text-sm font-bold text-black">
          Open / Closed
          <select
            value={filters.openClosed}
            onChange={(event) => updateFilter("openClosed", event.target.value)}
            className={`${filterStyle} mt-1 font-normal`}
          >
            <option>All records</option>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </label>

        <button
          type="button"
          className="rounded-md bg-emerald-600 px-10 py-1.5 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Search
        </button>

        <button
          type="button"
          onClick={() => setFilters(initialFilters)}
          className="rounded-md border border-gray-400 bg-white px-10 py-1.5 text-sm font-bold text-black hover:bg-gray-100"
        >
          Clear
        </button>
      </div>

      {/* Record actions */}
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={actionButtonStyle}>Close Item</button>
        <button type="button" className={actionButtonStyle}>Reopen Item</button>
        <button type="button" className={actionButtonStyle}>View Sales</button>
        <button type="button" className={actionButtonStyle}>View Proc Detail</button>
        <button type="button" className={actionButtonStyle}>Adjust Bulk lbs</button>
      </div>

      {/* Proc inventory table */}
      <div className="overflow-x-auto border border-gray-400">
        <table className="w-full min-w-[820px] border-collapse text-left text-xs text-black">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${cellStyle} border-b border-gray-400 py-1.5 text-left font-bold leading-tight`}
                >
                  {column.label}
                </th>
              ))}
              <th className={`${cellStyle} border-b border-gray-400 py-1.5 text-center font-bold`}>
                Closed
              </th>
            </tr>
          </thead>

          <tbody>
            {demoProcRecords.map((record) => (
              <tr
                key={record.proc}
                onClick={() => setSelectedProc(record.proc)}
                className={`cursor-pointer ${
                  selectedProc === record.proc
                    ? "bg-emerald-50"
                    : "even:bg-gray-100"
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className={`${cellStyle} ${column.align}`}>
                    {record[column.key]}
                  </td>
                ))}
                <td className={`${cellStyle} text-center`}>
                  <input
                    type="checkbox"
                    defaultChecked={record.closed}
                    className="h-4 w-4 accent-emerald-600"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination start={1} end={11} total={100} />

      <p className="mt-3 text-xs text-gray-700">
        All weights are shown in lb.
      </p>
      <p className="mt-1 text-xs text-gray-700">
        Closed when bulk inventory is 0, bagged inventory is blank, and close error has a value.
      </p>
    </SidebarLayout>
  );
}
