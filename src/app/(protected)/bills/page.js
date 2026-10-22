//Placeholder for bill entry

"use client";

import { useState } from "react";
import { Search,ArrowDown } from "lucide-react";
import Link from "next/link";
import FarmLayout from "@/app/FarmLayout";

//Demo data (database isn't implemented yet)
const vendorName = [
    {id: "V001", name: "Valley Farm Supply"},
    {id: "V002", name: "Nature's Own Pestisides"},
    {id: "V003", name: "Ron's Distribustions"}
];

const emptyBill = {
    vendorId: "",
    invoiceNum: "",
    dateIssued: "",
    dueDate: "",
    description: "",
    amountOwed: "",
    accNum: "",
};

const billColumns = [
    { key: "vendorName", label: "Vendor" },
    { key: "invoiceNum", label: "Invoice #" },
    { key: "dateIssued", label: "Date" },
    { key: "dueDate", label: "Due Date" },
    { key: "descrpition", label: "Description" },
    { key: "amountOwed", label: "Amount" },
    { key: "accNum", label: "Account" }
];

function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(Number(value))
};

export default function BillPage() {
    const [form, setForm] = useState(emptyBill);
    const [bills, setBills] = useState([]);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");

    // Updates the form when filled

    function updateField(event){
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }
    function handleSubmit(event) {
    event.preventDefault();

    // Sprint 1 prototype: no database saving yet.
    setMessage(
      "Prototype only: Bill information has not been saved."
    );
  }

  return (
    <FarmLayout>
        <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-4xl font-bold text-black">
                    Bills
                </h2>
                {/* Bills table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-500 text-left text-sm text-black">
                        <thead className="bg-gray-100">
                            <tr>
                                {[
                                "Vendor Name",
                                "Invoice #",
                                "Date",
                                "Due Date",
                                "Description",
                                "Amount",
                                "Account #"
                                ].map((column) => (
                                <th
                                    key={column}
                                    className="border border-gray-500 px-3 py-4 font-bold"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                    {column}
                                    {(column === "Vendor Name" ||
                                        column === "Invoice #") && (
                                        <ArrowDown size={14} />
                                    )}
                                    </div>
                                </th>
                                ))}
                            </tr>
                        </thead>
                    </table>
                </div>

                {/* Temporary pagination display */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-black">

                    <div className="flex items-center gap-4">
                        <span className="rounded-md bg-gray-800 px-3 py-2 text-white">
                        1
                        </span>
                        <span>2</span>
                        <span>3</span>
                        <span>...</span>
                        <span>19</span>
                        <span>20</span>
                        <span className="rounded-md bg-gray-300 px-3 py-2">
                            Next →
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </FarmLayout>
  );
} 