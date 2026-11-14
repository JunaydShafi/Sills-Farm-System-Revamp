"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Search, Plus } from "lucide-react";
import SidebarLayout, { PageTitle } from "@/app/SidebarLayout";
import { validateBaggingRecord } from "@/lib/baggingValidation";

const cellStyle = "border-x border-gray-300 px-2 py-1.5";

const rowsPerPage = 12;

const pageButtonStyle =
  "flex items-center gap-1 rounded bg-gray-200 px-4 py-1.5 hover:bg-gray-300 disabled:opacity-50";

const inputStyle =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-black outline-none focus:border-emerald-600";

const emptyForm = {
  date: "",
  quantity: "",
  size: "",
  productId: "",
  procId: "",
  adjustment: "0",
};

// 2026-09-14 -> 9/14/2026, without time zone shifts
function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${Number(month)}/${Number(day)}/${year}`;
}

function formatAdjustment(value) {
  if (value === 0) return "—";
  return value > 0 ? `+${value}` : String(value);
}

async function fetchBagging() {
  const response = await fetch("/api/bagging", { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-bold text-black">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

export default function BaggingDataPage() {
  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Entry form: editingId is null when adding a new record
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [message, setMessage] = useState("");

  const applyResult = useCallback((request) => {
    return request
      .then((data) => {
        setRecords(data.records);
        setProducts(data.products);
        setProcesses(data.processes);
        setLoadError("");
      })
      .catch((error) => {
        setRecords([]);
        setLoadError(error.message || "Unable to load bagging records.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    applyResult(fetchBagging());
  }, [applyResult]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setSaveError("");
  }

  function openNewRecord() {
    setEditingId(null);
    setForm({ ...emptyForm, date: new Date().toLocaleDateString("en-CA") });
    setFieldErrors({});
    setSaveError("");
    setMessage("");
    setFormOpen(true);
  }

  function openExistingRecord(record) {
    setEditingId(record.id);
    setForm({
      date: record.date,
      quantity: String(record.quantity),
      size: String(record.size),
      productId: String(record.productId),
      procId: String(record.procId),
      adjustment: String(record.adjustment),
    });
    setFieldErrors({});
    setSaveError("");
    setMessage("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setFieldErrors({});
    setSaveError("");
  }

  async function handleSave(event) {
    event.preventDefault();

    // Same rules the server applies, checked first for instant feedback
    const { errors } = validateBaggingRecord(form);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSaveError("Please correct the highlighted fields.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        editingId ? `/api/bagging/${editingId}` : "/api/bagging",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setFieldErrors(data.errors ?? {});
        setSaveError(data.error || "Unable to save bagging record.");
        return;
      }

      setMessage(data.message);
      closeForm();
      setLoading(true);
      await applyResult(fetchBagging());
    } catch {
      setSaveError("Unable to save bagging record.");
    } finally {
      setSaving(false);
    }
  }

  const searchText = search.toLowerCase();
  const filteredRecords = records.filter(
    (record) =>
      record.product.toLowerCase().includes(searchText) ||
      String(record.proc).includes(search)
  );

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount);
  const firstRow = (currentPage - 1) * rowsPerPage;
  const visibleRecords = filteredRecords.slice(firstRow, firstRow + rowsPerPage);

  return (
    <SidebarLayout>
      <PageTitle title="Bag Data" subtitle="Bagging Inventory Entry" />

      {/* Search and add */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full max-w-[340px] items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5">
          <Search size={16} className="text-gray-700" />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by product or process number..."
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-500"
          />
        </div>

        <button
          type="button"
          onClick={openNewRecord}
          disabled={loading || Boolean(loadError)}
          className="flex items-center gap-1 rounded-md bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <Plus size={16} strokeWidth={3} />
          Add record
        </button>
      </div>

      {loadError && (
        <p
          role="alert"
          className="mb-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          {loadError}
        </p>
      )}

      {message && !formOpen && (
        <p
          role="status"
          className="mb-3 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {message}
        </p>
      )}

      {/* Bagging entry form */}
      {formOpen && (
        <form
          onSubmit={handleSave}
          noValidate
          className="mb-4 rounded-md border border-gray-300 bg-gray-50 p-4"
        >
          <h3 className="mb-3 font-bold text-black">
            {editingId ? "Edit bagging record" : "New bagging record"}
          </h3>

          {(products.length === 0 || processes.length === 0) && (
            <p className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              Products and processing records must exist in the database before
              bagging can be recorded.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Date" htmlFor="date" error={fieldErrors.date}>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                className={inputStyle}
              />
            </Field>

            <Field label="Product" htmlFor="productId" error={fieldErrors.productId}>
              <select
                id="productId"
                value={form.productId}
                onChange={(event) => updateField("productId", event.target.value)}
                className={inputStyle}
              >
                <option value="">Select a product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.code})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Proc" htmlFor="procId" error={fieldErrors.procId}>
              <select
                id="procId"
                value={form.procId}
                onChange={(event) => updateField("procId", event.target.value)}
                className={inputStyle}
              >
                <option value="">Select a process...</option>
                {processes.map((process) => (
                  <option key={process.id} value={process.id}>
                    {process.number} · {process.description}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Quantity (bags)" htmlFor="quantity" error={fieldErrors.quantity}>
              <input
                id="quantity"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                className={inputStyle}
              />
            </Field>

            <Field label="Size (lbs per bag)" htmlFor="size" error={fieldErrors.size}>
              <input
                id="size"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                list="bag-sizes"
                value={form.size}
                onChange={(event) => updateField("size", event.target.value)}
                className={inputStyle}
              />
              <datalist id="bag-sizes">
                <option value="25" />
                <option value="50" />
              </datalist>
            </Field>

            <Field label="Adjustment (+/- bags)" htmlFor="adjustment" error={fieldErrors.adjustment}>
              <input
                id="adjustment"
                type="number"
                step="1"
                value={form.adjustment}
                onChange={(event) => updateField("adjustment", event.target.value)}
                className={inputStyle}
              />
            </Field>
          </div>

          {saveError && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {saveError}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md border border-emerald-700 bg-emerald-600 px-10 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-gray-400 bg-white px-8 py-1.5 text-sm font-semibold text-green-950 hover:bg-emerald-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Bag data table */}
      <div className="overflow-x-auto border border-gray-400">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm text-black">
          <thead>
            <tr className="bg-gray-100">
              {["Date", "Quantity", "Size", "Product", "Proc", "Adjustment"].map(
                (heading) => (
                  <th
                    key={heading}
                    className={`${cellStyle} border-b border-gray-400 font-bold`}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {visibleRecords.map((record) => (
              <tr
                key={record.id}
                onClick={() => openExistingRecord(record)}
                title="Click to edit this record"
                className={`cursor-pointer hover:bg-emerald-50 ${
                  editingId === record.id ? "bg-emerald-50" : "even:bg-gray-100"
                }`}
              >
                <td className={cellStyle}>{formatDate(record.date)}</td>
                <td className={`${cellStyle} text-right`}>{record.quantity}</td>
                <td className={`${cellStyle} text-right`}>{record.size}</td>
                <td className={cellStyle}>{record.product}</td>
                <td className={cellStyle}>{record.proc}</td>
                <td className={`${cellStyle} text-center`}>
                  {formatAdjustment(record.adjustment)}
                </td>
              </tr>
            ))}

            {visibleRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  {loading ? "Loading records..." : "No matching records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record count and page buttons */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
        <p>
          Showing {filteredRecords.length === 0 ? 0 : firstRow + 1}–
          {firstRow + visibleRecords.length} of {filteredRecords.length} records
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={pageButtonStyle}
          >
            <ArrowLeft size={14} />
            Previous
          </button>

          <span className="px-2">
            Page {currentPage} of {pageCount}
          </span>

          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === pageCount}
            className={pageButtonStyle}
          >
            Next
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
}
