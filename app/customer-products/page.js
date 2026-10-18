
"use client";

import { useState } from "react";
import CustomerLayout from "../CustomerLayout";

const sampleProducts = [
  { id: 1, customer: "Amy Kitchen, Inc", product: "Black Beans", size: "50LB" },
  { id: 2, customer: "Amy Kitchen, Inc", product: "Split Peas", size: "25LB" },
  { id: 3, customer: "Amy Kitchen, Inc", product: "Small Red Beans", size: "50LB" },
  { id: 4, customer: "Amy Kitchen, Inc", product: "White Corn", size: "50LB" },
  { id: 5, customer: "Amy Kitchen, Inc", product: "Yellow Corn", size: "20LB" },
  { id: 6, customer: "Amy Kitchen, Inc", product: "Split Peas", size: "25LB" },
  { id: 7, customer: "Amy Kitchen, Inc", product: "Black Beans", size: "50LB" },
  { id: 8, customer: "Amy Kitchen, Inc", product: "Split Peas", size: "25LB" },
  { id: 9, customer: "Amy Kitchen, Inc", product: "Black Beans", size: "50LB" },
  { id: 10, customer: "Amy Kitchen, Inc", product: "Split Peas", size: "25LB" },
];

const customerOptions = ["Amy Kitchen, Inc"];
const productOptions = [...new Set(sampleProducts.map((item) => item.product))];
const sizeOptions = [...new Set(sampleProducts.map((item) => item.size))];

export default function CustomerProductListPage() {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [size, setSize] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    customer: "",
    product: "",
    size: "",
  });

  const filteredProducts = sampleProducts.filter((item) => {
    return (
      (!appliedFilters.customer || item.customer === appliedFilters.customer) &&
      (!appliedFilters.product || item.product === appliedFilters.product) &&
      (!appliedFilters.size || item.size === appliedFilters.size)
    );
  });

  function handleSearch(event) {
    event.preventDefault();
    setAppliedFilters({ customer, product, size });
  }

  const selectStyle =
    "w-full border border-gray-600 bg-white px-3 py-2 text-sm text-black outline-none focus:border-green-700";

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-5xl text-black">
        <h2 className="mb-4 text-3xl font-bold">
          Customer Product List
        </h2>

        {/* Filters */}
        <form
          onSubmit={handleSearch}
          className="mb-4 grid grid-cols-1 items-end gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label htmlFor="filter-customer" className="mb-1 block text-sm font-semibold">
              Customer
            </label>
            <select
              id="filter-customer"
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              className={selectStyle}
            >
              <option value="">All Customers</option>
              {customerOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-product" className="mb-1 block text-sm font-semibold">
              Product
            </label>
            <select
              id="filter-product"
              value={product}
              onChange={(event) => setProduct(event.target.value)}
              className={selectStyle}
            >
              <option value="">All Products</option>
              {productOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-size" className="mb-1 block text-sm font-semibold">
              Size
            </label>
            <select
              id="filter-size"
              value={size}
              onChange={(event) => setSize(event.target.value)}
              className={selectStyle}
            >
              <option value="">All Sizes</option>
              {sizeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg border border-green-950 bg-[#50966d] px-6 py-2 font-semibold text-white hover:bg-green-700"
          >
            Search
          </button>
        </form>

        {/* Product table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-500 text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                {["Customer", "Product", "Size"].map((heading) => (
                  <th
                    key={heading}
                    className="border border-gray-500 px-3 py-3 font-bold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="border-x border-gray-500 px-3 py-3 font-semibold">
                    {item.customer}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-3 font-semibold">
                    {item.product}
                  </td>
                  <td className="border-x border-gray-500 px-3 py-3">
                    {item.size}
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="border border-gray-500 px-3 py-8 text-center">
                    No products match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p>
            Showing {filteredProducts.length === 0 ? 0 : 1}-
            {filteredProducts.length} of {filteredProducts.length} Records
          </p>

          <div className="flex items-center gap-4">
            <span className="rounded-md bg-gray-800 px-3 py-2 text-white">1</span>
            <span>2</span>
            <span>3</span>
            <span>...</span>
            <span>99</span>
            <span>100</span>
            <span className="rounded-md bg-gray-300 px-3 py-2">
              Next →
            </span>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
