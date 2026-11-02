"use client";

import { useState } from "react";
import Link from "next/link";
import CustomerLayout from "@/app/CustomerLayout";
import AddressAutocomplete from "@/components/AddressAutocomplete";

import { UsaStates } from "usa-states";

const usStates = new UsaStates().states;

// Initial form values.
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

const requiredFields = {
  code: "Customer Code",
  name: "Customer Name",
  address: "Street Address",
  city: "City",
  state: "State",
  zip: "ZIP Code",
  phone: "Phone",
  status: "Status",
};

const maxLengths = {
  code: 30,
  name: 150,
  address: 255,
  city: 100,
  state: 2,
  zip: 10,
  phone: 25,
  status: 20,
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
  const phone = form.phone.trim();
  const phoneDigits = phone.replace(/\D/g, "");

  if (phone && (!/^[\d\s()+.-]+$/.test(phone) || phoneDigits.length !== 10)) {
    errors.phone = "Enter a valid 10-digit phone number.";
  }

  // Check whether the selected state is valid.
  if (
    form.state &&
    !usStates.some((state) => state.abbreviation === form.state)
  ) {
    errors.state = "Please select a valid U.S. state.";
  }

  if (!["Active", "Inactive"].includes(form.status)) {
    errors.status = "Please select a valid status.";
  }

  return errors;
}

export default function AddNewCustomerPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [zipWarning, setZipWarning] = useState("");
  // Update fields and revalidate after a submission attempt.

  function updateField(event) {
    const { name } = event.target;
    let { value } = event.target;

    // Phone: format up to 10 digits.
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);

      if (digits.length > 6) {
        value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        value = digits;
      }
    }

    // ZIP: allow only 5 digits and warn about invalid characters.
    if (name === "zip") {
      const containsInvalidCharacters = /[^\d]/.test(value);

      value = value.replace(/\D/g, "").slice(0, 5);

      if (containsInvalidCharacters) {
        setZipWarning("ZIP Code must contain numbers only.");
      } else {
        setZipWarning("");
      }
    }

    const updatedForm = { ...form, [name]: value };

    setForm(updatedForm);
    setMessage("");
    setServerError("");

    if (submitted) {
      setErrors(validateForm(updatedForm));
    }
  }

  function handleAddressSelect(item) {
    const updatedForm = {
      ...form,
      address: item.street || item.label || form.address,
      city: item.city || form.city,
      state: item.state?.toUpperCase() || form.state,
      zip: item.zip || form.zip,
    };

    setForm(updatedForm);
    setMessage("");
    setServerError("");
    setZipWarning("");
    if (submitted) {
      setErrors(validateForm(updatedForm));
    }
  }

  // Validate and send customer information to the backend.
  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSubmitted(true);
    setMessage("");
    setServerError("");

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    // Stop if any field is missing or invalid.
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        }

        setServerError(result.error || "Unable to add customer.");
        return;
      }

      // Customer was successfully created in PostgreSQL.
      setMessage("Customer added successfully!");
      setForm({ ...initialForm });
      setErrors({});
      setSubmitted(false);
      setZipWarning("");
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
        {/* Breadcrumb */}
        <div className="mb-3 text-sm font-semibold">
          <Link href="/customers" className="text-emerald-700 hover:underline">
            Customers
          </Link>
          {" > "} Add New Customer
        </div>

        <h2 className="text-4xl font-bold">Add New Customers</h2>

        <p className="mb-4 mt-1 font-semibold text-gray-600">
          Enter the customer&apos;s information below.
        </p>

        {/* Customer form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-[#cecece] px-7 py-6"
        >
          <div className="grid grid-cols-1 gap-x-20 gap-y-8 sm:grid-cols-2">
            {renderInput("Customer Code", "code", "Enter customer code...")}

            {renderInput("Customer Name", "name", "Enter customer name...")}

            <div>
              <label htmlFor="address" className="mb-2 block font-bold">
                Street Address <span className="text-red-700">*</span>
              </label>

              <AddressAutocomplete
                value={form.address}
                onChange={updateField}
                onSelect={handleAddressSelect}
                disabled={saving}
                className={`${fieldClass} ${
                  errors.address ? "border-red-600" : ""
                }`}
                error={errors.address}
              />

              {errors.address && (
                <p id="address-error" className="mt-1 text-sm text-red-700">
                  {errors.address}
                </p>
              )}
            </div>

            {renderInput("City", "city", "Enter city...")}

            {/* State dropdown */}
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

            <div>
              <label htmlFor="zip" className="mb-2 block font-bold">
                ZIP Code <span className="text-red-700">*</span>
              </label>

              <input
                id="zip"
                name="zip"
                value={form.zip}
                onChange={updateField}
                disabled={saving}
                inputMode="numeric"
                maxLength={5}
                placeholder="Enter 5-digit ZIP code..."
                aria-invalid={Boolean(errors.zip || zipWarning)}
                aria-describedby={
                  errors.zip
                    ? "zip-error"
                    : zipWarning
                      ? "zip-warning"
                      : undefined
                }
                className={`${fieldClass} ${
                  errors.zip || zipWarning ? "border-red-600" : ""
                }`}
              />

              {errors.zip && (
                <p id="zip-error" className="mt-1 text-sm text-red-700">
                  {errors.zip}
                </p>
              )}

              {!errors.zip && zipWarning && (
                <p
                  id="zip-warning"
                  role="status"
                  className="mt-1 text-sm text-amber-800"
                >
                  {zipWarning}
                </p>
              )}
            </div>

            {renderInput("Phone", "phone", "(XXX)-XXX-XXXX", "tel")}

            {/* Customer status dropdown */}
            <div>
              <label htmlFor="status" className="mb-2 block font-bold">
                Status <span className="text-red-700">*</span>
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={updateField}
                disabled={saving}
                aria-invalid={Boolean(errors.status)}
                aria-describedby={errors.status ? "status-error" : undefined}
                className={`${fieldClass} ${
                  errors.status ? "border-red-600" : ""
                }`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              {errors.status && (
                <p id="status-error" className="mt-1 text-sm text-red-700">
                  {errors.status}
                </p>
              )}
            </div>
          </div>

          {/* Form buttons */}
          <div className="mt-7 flex flex-wrap justify-end gap-6">
            <Link
              href="/customers"
              className="min-w-32 rounded-lg border border-gray-700 bg-[#bcbfbc] px-6 py-2 text-center font-bold hover:bg-gray-300"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="min-w-40 rounded-lg border border-green-950 bg-[#50966d] px-6 py-2 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "+ Add Customer"}
            </button>
          </div>

          {/* Validation summary */}
          {Object.keys(errors).length > 0 && (
            <p
              role="alert"
              className="mt-4 text-center text-sm font-semibold text-red-700"
            >
              Please correct the highlighted fields.
            </p>
          )}

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
