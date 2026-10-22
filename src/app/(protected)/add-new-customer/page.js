// Sprint 1 placeholder submission.
// Customer information is not saved until database integration is implemented.

"use client";

import { useState } from "react";
import Link from "next/link";
import FarmLayout from "@/app/FarmLayout";

const initialForm = {
  code: "",
  name: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  status: "Active",
};

export default function AddNewCustomerPage() {
  // Stores the customer's form entries and the submission message.
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  // Updates the corresponding field whenever the user enters information.
  function updateField(event) {
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
      "Prototype only: Customer information has not been saved."
    );
  }

  const fieldClass =
    "w-full rounded-sm border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-emerald-700";

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-4xl text-black">
        {/* Breadcrumb */}
        <div className="mb-3 text-sm font-semibold">
          <Link
            href="/customers"
            className="text-emerald-700 hover:underline"
          >
            Customers
          </Link>
          {" > "} Add New Customer
        </div>

        <h2 className="text-4xl font-bold">
          Add New Customers
        </h2>

        <p className="mb-4 mt-1 font-semibold text-gray-600">
          Enter the customer’s information below.
        </p>

        {/* Form container */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#cecece] px-7 py-6"
        >
          <div className="grid grid-cols-1 gap-x-20 gap-y-8 sm:grid-cols-2">

            {/* Customer Code */}
            <div>
              <label
                htmlFor="customer-code"
                className="mb-2 block font-bold"
              >
                Customer Code <span className="text-red-700">*</span>
              </label>
              <input
                id="customer-code"
                name="code"
                value={form.code}
                onChange={updateField}
                placeholder="Enter customer code..."
                className={fieldClass}
                required
              />
            </div>

            {/* Customer Name */}
            <div>
              <label
                htmlFor="customer-name"
                className="mb-2 block font-bold"
              >
                Customer Name <span className="text-red-700">*</span>
              </label>
              <input
                id="customer-name"
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Enter customer name..."
                className={fieldClass}
                required
              />
            </div>

            {/* Street Address */}
            <div>
              <label
                htmlFor="street-address"
                className="mb-2 block font-bold"
              >
                Street Address <span className="text-red-700">*</span>
              </label>
              <input
                id="street-address"
                name="address"
                value={form.address}
                onChange={updateField}
                placeholder="Enter street address..."
                className={fieldClass}
                required
              />
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="mb-2 block font-bold"
              >
                City <span className="text-red-700">*</span>
              </label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={updateField}
                placeholder="Enter city..."
                className={fieldClass}
                required
              />
            </div>

            {/* State */}
            <div>
              <label
                htmlFor="state"
                className="mb-2 block font-bold"
              >
                State <span className="text-red-700">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={form.state}
                onChange={updateField}
                className={fieldClass}
                required
              >
                <option value="">Select state...</option>
                <option value="CA">California</option>
                <option value="IL">Illinois</option>
                <option value="FL">Florida</option>
              </select>
            </div>

            {/* ZIP Code */}
            <div>
              <label
                htmlFor="zip"
                className="mb-2 block font-bold"
              >
                Zip Code <span className="text-red-700">*</span>
              </label>
              <input
                id="zip"
                name="zip"
                value={form.zip}
                onChange={updateField}
                placeholder="Enter ZIP code..."
                className={fieldClass}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block font-bold"
              >
                Phone <span className="text-red-700">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="(XXX)-XXX-XXXX"
                className={fieldClass}
                required
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block font-bold"
              >
                Status <span className="text-red-700">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={updateField}
                className={fieldClass}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-7 flex flex-wrap justify-end gap-6">
            <Link
              href="/customers"
              className="min-w-32 rounded-lg border border-gray-700 bg-[#bcbfbc] px-6 py-2 text-center font-bold hover:bg-gray-300"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="min-w-40 rounded-lg border border-green-950 bg-[#50966d] px-6 py-2 font-bold text-white hover:bg-green-700"
            >
              + Add Customer
            </button>
          </div>

          {message && (
            <p
              role="status"
              className="mt-4 text-center text-sm font-semibold text-gray-800"
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </CustomerLayout>
  );
}
