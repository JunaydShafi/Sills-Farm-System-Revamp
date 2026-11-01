//Sprint 1 placeholder for vendor
//Real vendor data won't be saved until database implementation

"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import FarmLayout from "@/app/FarmLayout";

const initialForm = {
    id: "",
    name: "",
    pNum: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    taxId: "",
    defaultAcc: "",
    custAccId: ""
};

export default function AddNewVendorPage() {
    //Will store the vendor information for adding new vendors
    const [form, setForm] = useState(initialForm);
    const [input, setinput] = useState({taxId: false});
    const [message, setMessage] = useState("");

     // Updates the corresponding field whenever the user enters information.
    function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setinputs((value) => ({
      ...value,
      [name]: value
    }))
  }

    function handleSubmit(event) {
    event.preventDefault();

    // Sprint 1 prototype: no database saving yet.
    setMessage(
      "Demo only: Vendor information has not been saved."
    );
  }

  const fieldClass =
    "w-full rounded-sm border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-emerald-700";


  return (
    <FarmLayout>
      <div className="mx-auto max-w-4xl text-black">
        <div className="mb-3 text-sm font-semibold">
          <Link
            href="/vendors"
            className="text-emerald-700 hover:underline"
          >
            Vendors
          </Link>
          {" > "} Add New Vendor
        </div>

        <h2 className="text-4xl font-bold">
          Add New Vendor
        </h2>

        <p className="mb-4 mt-1 font-semibold text-gray-600">
          Enter new vendor information
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-[#cecece] px-7 py-6"
        >
          <div className="grid grid-cols-1 gap-x-20 gap-y-8 sm:grid-cols-2">

            {/* Vendor Id */}
            <div>
              <label
                htmlFor="vendor-id"
                className="mb-2 block font-bold"
              >
                Vendor Id <span className="text-red-700">*</span>
              </label>
              <input
                id="vendor-id"
                name="id"
                value={form.code}
                onChange={updateField}
                placeholder="Enter vendor id..."
                className={fieldClass}
                required
              />
            </div>

            {/* Vendor Name */}
            <div>
              <label
                htmlFor="vendor-name"
                className="mb-2 block font-bold"
              >
                Vendor Name <span className="text-red-700">*</span>
              </label>
              <input
                id="vendor-name"
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Enter vendor name..."
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
                name="street"
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
                name="zipCode"
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
                name="pNum"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="(XXX)-XXX-XXXX"
                className={fieldClass}
                required
              />
            </div>

            {/* Tax Id */}
            <div>
              <label
                htmlFor="tax-id"
                className="mb-2 block font-bold"
              >
                Tax Id <span className="text-red-700">*</span>
              </label>
              <input
                type="checkbox"
                id="tax"
                name="taxId"
                checked={input.taxId}
                value={form.tax}
                onChange={updateField}
                className={fieldClass}
                required
              />
            </div>

            {/* Default Account Id */}
            <div>
              <label
                htmlFor="account-id"
                className="mb-2 block font-bold"
              >
                Account Id <span className="text-red-700">*</span>
              </label>
              <input
                id="default"
                name="defaultAcc"
                value={form.default}
                onChange={updateField}
                placeholder="X-XXXX"
                className={fieldClass}
                required
              />
            </div>
            {/* Custom Account Id */}
            <div>
              <label
                htmlFor="custom-id"
                className="mb-2 block font-bold"
              >
                Custom Id <span className="text-red-700">*</span>
              </label>
              <input
                id="custom"
                name="custAccId"
                value={form.custom}
                onChange={updateField}
                placeholder="XXXX"
                className={fieldClass}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-7 flex flex-wrap justify-end gap-6">
            <Link
              href="/vendors"
              className="min-w-32 rounded-lg border border-gray-700 bg-[#bcbfbc] px-6 py-2 text-center font-bold hover:bg-gray-300"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="min-w-40 rounded-lg border border-green-950 bg-[#50966d] px-6 py-2 font-bold text-white hover:bg-green-700"
            >
              + Add Vendor
            </button>
          </div>
        </form>
      </div>
    </FarmLayout>
  );
}