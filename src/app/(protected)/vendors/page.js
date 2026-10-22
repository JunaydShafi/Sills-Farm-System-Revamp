//Placeholder data for Sprint 1

"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowDown } from "lucide-react";
import FarmLayout from "@/app/FarmLayout";

//Placeholeder data table no database

const sampleVendors = [
    {
        id: "V001",
        name: "Valley Farm Supply",
        pNum: "(700) 555-0011",
        street: "123 Harvest Road",
        city: "Vallejo",
        state: "CA",
        postCode: "94590",
        taxId: "44-4444444",
        defaultAcc: "FS5100",
        custAccId: "C-2001"
    },
    {
        id: "V002",
        name: "Nature's Own Pestisides",
        pNum: "(777) 234-2362",
        street: "43 Rat Way",
        city: "Compton",
        state: "CA",
        postCode: "90210",
        taxId: "12-2543532",
        defaultAcc: "PS3402",
        custAccId: "C-2002"
    },
    {
        id: "V003",
        name: "Ron's Distributions",
        pNum: "(234) 555-9840",
        street: "1850 Revolution Street",
        city: "Fresno",
        state: "CA",
        postCode: "92520",
        taxId: "77-7777777",
        defaultAcc: "DI1233",
        custAccId: "C-2003"
    },
    {
        id: "V004",
        name: "Seeds-A-Plenty",
        pNum: "(544) 873-4236",
        street: "1234 Johnny Road",
        city: "Sacramento",
        state: "CA",
        postCode: "94254",
        taxId: "84-2308764",
        defaultAcc: "SD5400",
        custAccId: "C-2004"
    },
];

const uniqueValues = (field) =>
  [...new Set(sampleVendors.map((record) => record[field]))];

const initialFilters = {
    id: "",
    name: "",
    pNum: "",
    street: "",
    city: "",
    state: "",
    postCode: "",
    taxId: "",
    defaultAcc: "",
    custAccId:""
};

export default function VendorsPage() {
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [search, setSearch] = useState("");

    function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setAppliedFilters({ ...filters });
  }

  const filteredVendor = sampleVendors.filter((record) =>
    (!appliedFilters.name || record.name === appliedFilters.name) &&
    (!appliedFilters.taxId || record.taxId === appliedFilters.taxId) &&
    (!appliedFilters.defaultAcc || record.defaultAcc === appliedFilters.defaultAcc) &&
    (!appliedFilters.custAccId || record.custAccId >= appliedFilters.custAccId) &&
    (!appliedFilters.id || record.id <= appliedFilters.id)
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
                                "Address",
                                "City",
                                "State",
                                "Phone",
                                "Tax Id",
                                "Default Account",
                                "Cust Account Id"
                            ].map((column) => (
                                <th
                                    key={column}
                                    className="border border-gray-500 px-3 py-4 font-bold"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                    {column}
                                    {(column === "Vendor Id" ||
                                        column === "Vendor Name") && (
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
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
                    <p>
                        Showing {filteredVendor.length ? 1 : 0}-{filteredVendor.length} of{" "}
                        {filteredVendor.length} Records
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