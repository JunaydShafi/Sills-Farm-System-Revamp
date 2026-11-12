"use client";

import { useState } from "react";
import { Check, Form } from "lucide-react";
import Link from "next/link";
import FarmLayout from "../../FarmLayout";

import { UsaStates } from "usa-states";

const usStates = new UsaStates().states;

const initialForm = {
    id: "",
    name: "",
    pNum: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    taxId: "",
    defaultAcc: "",
    custAccId: "",
};

const requiredFields = {
  id: "Vendor Id",
  name: "Vendor Name",
  pNum: "Phone",
  street: "Street Address",
  city: "City",
  state: "State",
  zip: "Zip Code",
  defaultAcc: "Account Number",
  custAccId: "Account Id",
};

const maxLengths = {
  id: 30,
  name: 150,
  street: 300,
  city: 150,
  state: 2,
  zip: 10,
  pNum: 25,
  defaultAcc: 30,
  custAccId: 20,
};

// Validate customer information before submission.
function validateForm(form) {
  const errors = {};

  Object.entries(requiredFields).forEach(([field, label]) => {
    const value = form[field].trim();

    if (!value) {
      errors[field] = `${label} is required.`;
    } else if (value.length > maxLengths[field]) {
      errors[field] = `${label} is too long.`;
    }
  });

  // ZIP codes must contain exactly five digits.
  if (form.zip.trim() && !/^\d{5}$/.test(form.zip.trim())) {
    errors.zip = "ZIP Code must contain exactly 5 digits.";
  }

  // Accept common US phone formats containing 10 digits.
  const phone = form.pNum.trim();
  const phoneDigits = phone.replace(/\D/g, "");

  if (phone && (!/^[\d\s()+.-]+$/.test(phone) || phoneDigits.length !== 10)) {
    errors.pNum = "Enter a valid 10-digit phone number.";
  }

  // Check whether the selected state is valid.
  if (
    form.state &&
    !usStates.some((state) => state.abbreviation === form.state)
  ) {
    errors.state = "Please select a valid U.S. state.";
  }

  return errors;
}

export default function AddNewVendorPage() {
  //Will store the vendor information for adding new vendors
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [input, setInput] = useState({taxId: false});

     // Updates the corresponding field whenever the user enters information.
  function updateField(event) {
    const { name } = event.target;
    let { value } = event.target;

        // Formating for phone numbers
    if (name === "pNum") {
      const digits = value.replace(/\D/g, "").slice(0, 10);

      if (digits.length > 6) {
        value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        value = digits;
      }
    }

    

    const updatedForm = {...form, [name]: value};

    setForm(updatedForm);
    setMessage("");
    setServerError("");

    if (submitted){
      setErrors(validateForm(updatedForm))
    }
  }

    async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSubmitted(true);
    setServerError("");
    setMessage("");

    const validationErrors= validateForm(form);
    setErrors(validationErrors);

      // Reject if any fields are empty
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);

        try {
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          ...form,
          taxId: input.taxId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        }

        setServerError(result.error || "Unable to add vendor.");
        return;
      }

      // Vendor was successfully created in PostgreSQL.
      setMessage("Vendor added successfully!");
      setForm({ ...initialForm });
      setInput({ taxId: false});
      setErrors({});
      setSubmitted(false);
    } catch {
      setServerError("Unable to connect to the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "w-full rounded-sm border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-emerald-700";

    // Display consistent input fields and validation messages.
  function renderInput(label, name, placeholder, type = "text") {
    return (
      <div>
        <label htmlFor={name} className="mb-2 block font-bold">
          {label} <span className="text-red-700">*</span>
        </label>

        <input
          id={name}
          name={name}
          type={type}
          value={form[name]}
          onChange={updateField}
          disabled={saving}
          maxLength={maxLengths[name]}
          placeholder={placeholder}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          className={`${fieldClass} ${errors[name] ? "border-red-600" : ""}`}
        />

        {errors[name] && (
          <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
            {errors[name]}
          </p>
        )}
      </div>
    );
  }

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
          noValidate
          className="bg-[#cecece] px-7 py-6"
        >
          <div className="grid grid-cols-1 gap-x-20 gap-y-8 sm:grid-cols-2">

            {/* Vendor Id
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
            </div> */}
            {renderInput("Vendor Id", "id", "Enter vendor id...")}

            {/* Vendor Name
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
            </div> */}
            {renderInput("Vendor Name", "name", "Enter vendor name")}

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
                value={form.street}
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
              <label htmlFor="state" className="mb-2 block font-bold">
                State <span className="text-red-700">*</span>
              </label>

              <select
                id="state"
                name="state"
                value={form.state}
                onChange={updateField}
                disabled={saving}
                aria-invalid={Boolean(errors.state)}
                aria-describedby={errors.state ? "state-error" : undefined}
                className={`${fieldClass} ${
                  errors.state ? "border-red-600" : ""
                }`}
              >
                <option value="">Select state...</option>
                {usStates.map((state) => (
                  <option key={state.abbreviation} value={state.abbreviation}>
                    {state.name}
                  </option>
                ))}
              </select>

              {errors.state && (
                <p id="state-error" className="mt-1 text-sm text-red-700">
                  {errors.state}
                </p>
              )}
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
            {/* <div>
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
            </div> */}
            {renderInput("Phone", "pNum", "(XXX)XXX-XXXX", "tel")}

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
                onChange={ (event) => 
                  setInput({ taxId: event.target.checked })
                }
                className={fieldClass}
                required = {false}
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
                value={form.defaultAcc}
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
                value={form.custAccId}
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
              disabled={saving}
              className="min-w-40 rounded-lg border border-green-950 bg-[#50966d] px-6 py-2 font-bold text-white hover:bg-green-700"
            >
              {saving? "Saving..." : "+ Add Vendor"}
            </button>
          </div>

          {/* Backend error */}
          {serverError && (
            <p
              role="alert"
              className="mt-4 text-center text-sm font-semibold text-red-700"
            >
              {serverError}
            </p>
          )}

          {/* Successful database submission */}
          {message && (
            <p
              role="status"
              className="mt-4 text-center text-sm font-semibold text-green-900"
            >
              {message}
            </p>
          )}

        </form>
      </div>
    </FarmLayout>
  );
}