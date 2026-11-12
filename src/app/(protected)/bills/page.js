//Placeholder for bill entry

"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import FarmLayout from "../../FarmLayout";

const emptyBill = {
    vendorId: "",
    invoiceNum: "",
    dateIssued: "",
    dueDate: "",
    description: "",
    amountOwed: "",
    accNum: "",
};

const PAGE_SIZE = 10;

function formatCurrency(value){
    const number = Number(value);
    return Number.isFinite(number)
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(number) : "-";
}

function formatDate(value){
    if(!value) return "-";
    //Date-only values
    return String(value).slice(0,10);
}

export default function BillPage() {
  const [form, setForm] = useState(emptyBill);
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadBills(){
    const response = await fetch("/api/bills", { cache: "no-store"});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to retrieve bills.");
    if(!Array.isArray(result.bills)) throw new Error("Invalid bills response.");
    setBills(result.bills);
  }

    useEffect(() => {
        let cancelled = false;
        async function loadData() {
            try {
                const [billsResponse, vendorsResponse] = await Promise.all([
                fetch("/api/bills", { cache: "no-store" }),
                fetch("/api/vendors", { cache: "no-store" }),
                ]);
                const [billsResult, vendorsResult] = await Promise.all([
                billsResponse.json(), vendorsResponse.json(),
                ]);
                if (!billsResponse.ok) throw new Error(billsResult.error || "Unable to retrieve bills.");
                if (!vendorsResponse.ok) throw new Error(vendorsResult.error || "Unable to retrieve vendors.");
                if (!Array.isArray(billsResult.bills) || !Array.isArray(vendorsResult.vendors)) {
                throw new Error("Unexpected API response.");
                }
                if (!cancelled) {
                setBills(billsResult.bills);
                setVendors(vendorsResult.vendors);
                }
            } 
            catch (err) {
                if (!cancelled) setError(err.message || "Unable to load bills.");
            } 
            finally {
                if (!cancelled) setLoading(false);
            }
        }
            loadData();

            return () => { cancelled = true; };
    },
    );
    const vendorNames = useMemo(
        () => new Map(vendors.map((vendor) => [String(vendor.id), vendor.name])),
        [vendors]
    );

    const filteredBills = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return bills;
        return bills.filter((bill) => {
        const vendorId = String(bill.vendorId ?? bill.vendor_id ?? "");
        const vendorName = bill.vendorName || vendorNames.get(vendorId) || vendorId;
        return [vendorName, bill.invoiceNum, bill.description, bill.accNum]
            .some((value) => String(value ?? "").toLowerCase().includes(term));
        });
    }, [bills, search, vendorNames]);

    const totalPages = Math.max(1, Math.ceil(filteredBills.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const visibleBills = filteredBills.slice(start, start + PAGE_SIZE);

    function updateField(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setError("");
        setMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (saving) return;
        setError("");
        setMessage("");

        if (Object.values(form).some((value) => !String(value).trim())) {
        setError("Please complete every bill field.");
        return;
        }
        if (form.dueDate < form.dateIssued) {
        setError("Due date cannot be earlier than the issue date.");
        return;
        }
        if (!Number.isFinite(Number(form.amountOwed)) || Number(form.amountOwed) <= 0) {
        setError("Amount owed must be greater than zero.");
        return;
        }

        setSaving(true);
        try {
        const response = await fetch("/api/bills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(form),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to save bill.");
        await loadBills();
        setForm({ ...emptyBill });
        setShowForm(false);
        setPage(1);
        setMessage("Bill added successfully!");
        } catch (err) {
        setError(err.message || "Unable to save bill.");
        } finally {
        setSaving(false);
        }
    }

    const inputClass = "w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-emerald-700";
    const fields = [
        { name: "invoiceNum", label: "Invoice Number", maxLength: 30 },
        { name: "dateIssued", label: "Date Issued", type: "date" },
        { name: "dueDate", label: "Due Date", type: "date" },
        { name: "amountOwed", label: "Amount Owed", type: "number", min: "0.01", step: "0.01" },
        { name: "accNum", label: "Account Number", maxLength: 20 },
    ];

    return (
        <FarmLayout>
        <div className="mx-auto max-w-6xl text-black">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-4xl font-bold">Bills</h2>
            <button type="button" onClick={() => setShowForm((open) => !open)}
                className="rounded-lg border border-green-950 bg-[#50966d] px-5 py-3 font-semibold text-white hover:bg-green-700">
                {showForm ? "Cancel" : "+ New Bill"}
            </button>
            </div>

            {message && <p role="status" className="mb-4 rounded bg-green-100 px-4 py-3 text-green-900">{message}</p>}
            {error && <p role="alert" className="mb-4 rounded bg-red-100 px-4 py-3 text-red-800">{error}</p>}

            {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 bg-[#cecece] px-7 py-6">
                <h3 className="mb-4 text-xl font-bold">Add New Bill</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="vendorId" className="mb-2 block font-bold">Vendor *</label>
                    <select id="vendorId" name="vendorId" required value={form.vendorId}
                    onChange={updateField} disabled={saving} className={inputClass}>
                    <option value="">Select a vendor</option>
                    {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name} ({vendor.id})</option>
                    ))}
                    </select>
                </div>
                {fields.map((field) => (
                    <div key={field.name}>
                    <label htmlFor={field.name} className="mb-2 block font-bold">{field.label} *</label>
                    <input id={field.name} name={field.name} type={field.type || "text"}
                        value={form[field.name]} onChange={updateField} required disabled={saving}
                        maxLength={field.maxLength} min={field.min} step={field.step}
                        className={inputClass} />
                    </div>
                ))}
                <div className="sm:col-span-2">
                    <label htmlFor="description" className="mb-2 block font-bold">Description *</label>
                    <textarea id="description" name="description" value={form.description}
                    onChange={updateField} required disabled={saving} maxLength={300}
                    rows={3} className={inputClass} />
                </div>
                </div>
                <button type="submit" disabled={saving || vendors.length === 0}
                className="mt-5 rounded-lg bg-[#50966d] px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                {saving ? "Saving..." : "Add Bill"}
                </button>
                {vendors.length === 0 && <p className="mt-2 text-sm">No vendors available. Add a vendor first.</p>}
            </form>
            )}

            <div className="relative mb-4 max-w-lg">
            <input type="search" placeholder="Search Bills" value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 pr-11 text-sm outline-none focus:border-green-700" />
            <Search size={19} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black" />
            </div>

            <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-500 text-left text-sm">
                <thead className="bg-gray-100">
                <tr>
                    {["Vendor Name", "Invoice #", "Date", "Due Date", "Description", "Amount", "Account #"].map((column) => (
                    <th key={column} className="border border-gray-500 px-3 py-4 font-bold">
                        <div className="flex items-center justify-between gap-2">{column}
                        {(column === "Vendor Name" || column === "Invoice #") && <ChevronDown size={14} />}
                        </div>
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {visibleBills.map((bill, index) => {
                    const vendorId = String(bill.vendorId ?? bill.vendor_id ?? "");
                    return (
                    <tr key={bill.id ?? `${vendorId}-${bill.invoiceNum}-${index}`}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="border border-gray-500 px-3 py-4 font-semibold">{bill.vendorName || vendorNames.get(vendorId) || vendorId}</td>
                        <td className="border border-gray-500 px-3 py-4 font-semibold">{bill.invoiceNum}</td>
                        <td className="border border-gray-500 px-3 py-4">{formatDate(bill.dateIssued)}</td>
                        <td className="border border-gray-500 px-3 py-4">{formatDate(bill.dueDate)}</td>
                        <td className="border border-gray-500 px-3 py-4">{bill.description}</td>
                        <td className="border border-gray-500 px-3 py-4">{formatCurrency(bill.amountOwed)}</td>
                        <td className="border border-gray-500 px-3 py-4">{bill.accNum}</td>
                    </tr>
                    );
                })}
                {!loading && visibleBills.length === 0 && (
                    <tr><td colSpan={7} className="border border-gray-500 px-4 py-8 text-center">
                    {error ? "Unable to display bills." : "No matching bills found."}
                    </td></tr>
                )}
                {loading && <tr><td colSpan={7} className="px-4 py-8 text-center">Loading bills...</td></tr>}
                </tbody>
            </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
            <p>Showing {filteredBills.length ? start + 1 : 0}–{Math.min(start + PAGE_SIZE, filteredBills.length)} of {filteredBills.length} Records</p>
            <div className="flex items-center gap-3">
                <button type="button" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md bg-gray-300 px-3 py-2 disabled:opacity-50">Previous</button>
                <span className="rounded-md bg-gray-800 px-3 py-2 text-white">{currentPage} / {totalPages}</span>
                <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md bg-gray-300 px-3 py-2 disabled:opacity-50">Next →</button>
            </div>
            </div>
        </div>
        </FarmLayout>
    );
    }