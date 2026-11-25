"use client";

import { useEffect, useState } from "react";
import CustomerLayout from "../../CustomerLayout";

const PAGE_SIZE = 5;

const EMPTY_FILTERS = {
  customer: "",
  product: "",
  size: "",
};

export default function CustomerProductListPage() {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [size, setSize] = useState("");

  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState({
    customers: [],
    products: [],
    sizes: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load customer product records from PostgreSQL through our API.
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          pageSize: String(PAGE_SIZE),
        });

        if (appliedFilters.customer) {
          params.set("customer", appliedFilters.customer);
        }

        if (appliedFilters.product) {
          params.set("product", appliedFilters.product);
        }

        if (appliedFilters.size) {
          params.set("size", appliedFilters.size);
        }

        const response = await fetch(
          `/api/customer-products?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to retrieve customer products.",
          );
        }

        if (controller.signal.aborted) return;

        if (currentPage > data.pagination.totalPages) {
          setCurrentPage(data.pagination.totalPages);
          return;
        }
        setProducts(data.products);
        setPagination(data.pagination);
        setOptions(data.options);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(err.message || "Unable to load customer products.");
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [appliedFilters, currentPage]);

  // Apply filters only when Search is clicked.
  function handleSearch(event) {
    event.preventDefault();

    setAppliedFilters({ customer, product, size });
    setCurrentPage(1);
  }

  const totalPages = pagination.totalPages;

  const firstRecord =
    pagination.total === 0 ? 0 : (pagination.page - 1) * PAGE_SIZE + 1;

  const lastRecord = Math.min(pagination.page * PAGE_SIZE, pagination.total);

  // Display up to five page buttons instead of hundreds at once.
  const firstPageButton = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - 4),
  );

  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstPageButton + index,
  );

  const selectStyle =
    "w-full border border-gray-600 bg-white px-3 py-2 text-sm text-black outline-none focus:border-green-700";

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-5xl text-black">
        <h2 className="mb-4 text-3xl font-bold">Customer Product List</h2>

        {/* Filters */}
        <form
          onSubmit={handleSearch}
          className="mb-4 grid grid-cols-1 items-end gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <label
              htmlFor="filter-customer"
              className="mb-1 block text-sm font-semibold"
            >
              Customer
            </label>

            <select
              id="filter-customer"
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              className={selectStyle}
            >
              <option value="">All Customers</option>

              {options.customers.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-product"
              className="mb-1 block text-sm font-semibold"
            >
              Product
            </label>

            <select
              id="filter-product"
              value={product}
              onChange={(event) => setProduct(event.target.value)}
              className={selectStyle}
            >
              <option value="">All Products</option>

              {options.products.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-size"
              className="mb-1 block text-sm font-semibold"
            >
              Size
            </label>

            <select
              id="filter-size"
              value={size}
              onChange={(event) => setSize(event.target.value)}
              className={selectStyle}
            >
              <option value="">All Sizes</option>

              {options.sizes.map((option) => (
                <option key={option} value={String(option)}>
                  {option}LB
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-green-950 bg-[#50966d] px-6 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            Search
          </button>
        </form>

        {/* Display loading and API error states */}
        {error && (
          <p
            role="alert"
            className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        {/* Customer Product List table */}
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
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="border border-gray-500 px-3 py-8 text-center"
                  >
                    Loading customer products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={3}
                    className="border border-gray-500 px-3 py-8 text-center"
                  >
                    Unable to display customer products.
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="border border-gray-500 px-3 py-8 text-center"
                  >
                    No customer products found.
                  </td>
                </tr>
              ) : (
                products.map((item, index) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Database-backed pagination */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p>
            Showing {firstRecord}-{lastRecord} of {pagination.total} Records
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading || currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-md border border-gray-400 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                disabled={loading}
                onClick={() => setCurrentPage(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`rounded-md px-3 py-2 disabled:opacity-50 ${
                  currentPage === page
                    ? "bg-gray-800 text-white"
                    : "border border-gray-400 bg-white text-black"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={loading || currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="rounded-md border border-gray-400 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
