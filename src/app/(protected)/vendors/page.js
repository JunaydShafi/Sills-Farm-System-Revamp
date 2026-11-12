"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import FarmLayout from "../../FarmLayout";

const vendors = [
    {
        id: "V001",
        name: "Valley Farm Supply",
        pNum: "(700) 555-0011",
        street: "123 Harvest Road",
        city: "Vallejo",
        state: "CA",
        zip: "94590",
        taxId: true,
        defaultAcc: "FS5100",
        custAccId: "C-2001",
    },
    {
        id: "V002",
        name: "Nature's Own Pestisides",
        pNum: "(777) 234-2362",
        street: "43 Rat Way",
        city: "Compton",
        state: "CA",
        zip: "90210",
        taxId: false,
        defaultAcc: "PS3402",
        custAccId: "C-2002",
    },
    {
        id: "V003",
        name: "Ron's Distributions",
        pNum: "(234) 555-9840",
        street: "1850 Revolution Street",
        city: "Fresno",
        state: "CA",
        zip: "92520",
        taxId: true,
        defaultAcc: "DI1233",
        custAccId: "C-2003",
    },
    {
        id: "V004",
        name: "Seeds-A-Plenty",
        pNum: "(544) 873-4236",
        street: "1234 Johnny Road",
        city: "Sacramento",
        state: "CA",
        zip: "94254",
        taxId: false,
        defaultAcc: "SD5400",
        custAccId: "C-2004",
    },
];

export default function VendorsPage() {
    const [search, setSearch] = useState("");
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Retrieve vendors from the database when the page loads.
    useEffect(() => {
        async function fetchVendors() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/vendors", {
                    method: "GET",
                    cache: "no-store",
                });

                const responseText = await response.text();

                console.log("Vendor API Status:", response.status);
                console.log("Vendor API Response:", responseText);

                let data;

                try {
                    data = JSON.parse(responseText);
                } catch (err) {
                    throw new Error(
                        `Vendor API returned something other than JSON. Status: ${response.status}. Check the browser console.`
                    );
                }

                if (!response.ok) {
                    throw new Error(
                        data.error || "Failed to retrieve vendors."
                    );
                }

                setVendors(data.vendors || []);

            } catch (err) {
                console.error("Error fetching vendors:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchVendors();
    }, []);

    // Filter database vendors by name, ID, or city.
    const filteredVendors = vendors.filter((vendor) =>
        vendor.name.toLowerCase().includes(search.toLowerCase()) ||
        vendor.id.toLowerCase().includes(search.toLowerCase()) ||
        vendor.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <FarmLayout>    
            <div className="mx-auto max-w-6xl">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-4xl font-bold text-black">
                        Vendors
                    </h2>

                    <Link
                        href="/add-new-vendor"
                        className="rounded-lg border border-green-950 bg-[#50966d] px-5 py-3 font-semibold text-white hover:bg-green-700"
                    >
                        + New Vendor
                    </Link>
                </div>
                {/* Vendor Search */}
                <div className="relative mb-4 max-w-lg">
                    <input
                        type="text"
                        placeholder="Search Vendors"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 pr-11 text-sm text-black outline-none focus:border-green-700"
                    />

                    <Search
                        size={19}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black"
                    />
                </div>
                {/* Vendor table */}
                <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-500 text-left text-sm text-black">
                    <thead className="bg-gray-100">
                        <tr>
                            {[
                                 "Vendor Id",
                                 "Vendor Name",
                                 "City",
                                 "State",
                                 "Phone",
                                 "Account Id",
                                 "Tax",
                            ].map((column) => (
                                <th
                                    key={column}
                                    className="border border-gray-500 px-3 py-4 font-bold"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                    {column}
                                    {(column === "Vendor Id" ||
                                        column === "Vendor Name") && (
                                        <ChevronDown size={14} />
                                    )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center">
                                    Loading vendors...
                                </td>
                            </tr>
                        )}

                        {error && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-red-600">
                                    {error}
                                </td>
                            </tr>
                        )}

                        {!loading && !error && filteredVendors.map((vendor, index) => (
                            <tr
                            key={vendor.id}
                            className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                            >
                            <td className="border-x border-gray-500 px-3 py-4 font-semibold">
                                {vendor.id}
                            </td>
                            <td className="border-x border-gray-500 px-3 py-4 font-semibold">
                                {vendor.name}
                            </td>
                            <td className="border-x border-gray-500 px-3 py-4">
                                {vendor.city}
                            </td>
                            <td className="border-x border-gray-500 px-3 py-4">
                                {vendor.state}
                            </td>
                            <td className="border-x border-gray-500 px-3 py-4">
                                {vendor.pNum}
                            </td>
                            <td className="border-x border-gray-500 px-3 py-4">
                                {vendor.custAccId}
                            </td>
                            <td className="border-x border-gray-500 px-2 py-3">
                                <span
                                className={`block rounded-md px-2 py-1 font-semibold ${
                                    vendor.taxId === true
                                    ? "bg-green-100"
                                    : "bg-gray-200"
                                }`}
                                >
                                {vendor.taxId ? "Yes" : "No"}
                                </span>
                            </td>
                            </tr>
                        ))}
                        {!loading && !error && filteredVendors.length === 0 && (
                            <tr>
                            <td colSpan={6} className="px-4 py-8 text-center">
                                No matching vendors found.
                            </td>
                            </tr>
                        )}
                    </tbody>


                </table>
                </div>

                {/* Temporary pagination display */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
                    <p>
                        Showing {filteredVendors.length ? 1 : 0}-{filteredVendors.length} of{" "}
                        {filteredVendors.length} Records
                    </p>

                    <div className="flex items-center gap-4">
                        <span className="rounded-md bg-gray-800 px-3 py-2 text-white">1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>...</span>
                        <span>21</span>
                        <span>22</span>
                        <span className="rounded-md bg-gray-300 px-3 py-2">Next →</span>
                    </div>
                </div>
            </div>
        </FarmLayout>
    );
}