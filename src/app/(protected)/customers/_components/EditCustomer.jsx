"use client";

import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";

export default function EditCustomer({
  editingCustomer,
  editForm,
  editErrors,
  savingEdit,
  actionError,
  closeEditCustomer,
  handleEditChange,
  saveEditCustomer,
  usStates,
  handleShippingAddressSelect,
}) {
  return (
    <Dialog.Root
      open={editingCustomer !== null}
      onOpenChange={(open) => {
        if (!open) closeEditCustomer();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 text-black shadow-2xl">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-2xl font-bold">
                Edit Customer
              </Dialog.Title>

              <Dialog.Description className="mt-1 text-sm text-gray-600">
                Update customer information and shipping details. Fields marked
                with * are required.{" "}
              </Dialog.Description>
            </div>

            <button
              type="button"
              onClick={closeEditCustomer}
              disabled={savingEdit}
              aria-label="Close edit customer dialog"
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {editForm && (
            <form onSubmit={saveEditCustomer} noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    field: "code",
                    label: "Customer Code",
                    maxLength: 30,
                  },
                  {
                    field: "name",
                    label: "Customer Name",
                    maxLength: 150,
                  },
                  {
                    field: "address",
                    label: "Address",
                    maxLength: 255,
                  },
                  {
                    field: "city",
                    label: "City",
                    maxLength: 100,
                  },
                  {
                    field: "zip",
                    label: "ZIP Code",
                    maxLength: 10,
                  },
                  {
                    field: "phone",
                    label: "Phone",
                    maxLength: 25,
                  },
                ].map(({ field, label, maxLength }) => (
                  <div
                    key={field}
                    className={field === "address" ? "sm:col-span-2" : ""}
                  >
                    <label
                      htmlFor={`edit-${field}`}
                      className="mb-1 block text-sm font-semibold"
                    >
                      {label}
                      {field === "code" ? " (Automatic)" : " *"}
                    </label>

                    <input
                      id={`edit-${field}`}
                      type="text"
                      required={field !== "code"}
                      maxLength={maxLength}
                      value={editForm[field]}
                      onChange={(event) =>
                        handleEditChange(field, event.target.value)
                      }
                      aria-invalid={Boolean(editErrors[field])}
                      aria-describedby={
                        editErrors[field] ? `edit-${field}-error` : undefined
                      }
                      disabled={savingEdit || field === "code"}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-green-700 focus:outline-none disabled:opacity-60"
                    />

                    {editErrors[field] && (
                      <p
                        id={`edit-${field}-error`}
                        className="mt-1 text-xs text-red-700"
                      >
                        {editErrors[field]}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <label
                    htmlFor="edit-state"
                    className="mb-1 block text-sm font-semibold"
                  >
                    State *
                  </label>

                  <select
                    id="edit-state"
                    required
                    value={editForm.state.toUpperCase()}
                    onChange={(event) =>
                      handleEditChange("state", event.target.value)
                    }
                    disabled={savingEdit}
                    aria-invalid={Boolean(editErrors.state)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-green-700 focus:outline-none disabled:opacity-60"
                  >
                    <option value="">Select a state</option>

                    {usStates.map((state) => (
                      <option
                        key={state.abbreviation}
                        value={state.abbreviation}
                      >
                        {state.name}
                      </option>
                    ))}
                  </select>

                  {editErrors.state && (
                    <p className="mt-1 text-xs text-red-700">
                      {editErrors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Status
                  </label>

                  <div className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm">
                    {editForm.status}
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Change status using the Customers table.
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mt-6 border-t border-gray-200 pt-5">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Shipping Address
                </h3>

                <label className="mb-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editForm.shipping_same_as_main}
                    onChange={(event) =>
                      handleEditChange(
                        "shipping_same_as_main",
                        event.target.checked,
                      )
                    }
                    disabled={savingEdit}
                    className="h-4 w-4 accent-green-700"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Same as main address
                  </span>
                </label>

                {editForm.shipping_same_as_main ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                    <p className="font-semibold">Using main address</p>
                    <p className="mt-1">{editForm.address}</p>
                    <p>
                      {editForm.city}, {editForm.state} {editForm.zip}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="edit-shipping_address"
                        className="mb-1 block text-sm font-semibold"
                      >
                        Shipping Street Address *
                      </label>

                      <AddressAutocomplete
                        value={editForm.shipping_address}
                        onChange={(event) =>
                          handleEditChange(
                            "shipping_address",
                            event.target.value,
                          )
                        }
                        onSelect={handleShippingAddressSelect}
                        disabled={savingEdit}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-green-700 focus:outline-none disabled:opacity-60"
                        error={editErrors.shipping_address}
                      />

                      {editErrors.shipping_address && (
                        <p className="mt-1 text-xs text-red-700">
                          {editErrors.shipping_address}
                        </p>
                      )}
                    </div>

                    {[
                      {
                        field: "shipping_city",
                        label: "Shipping City",
                        maxLength: 100,
                      },
                      {
                        field: "shipping_zip",
                        label: "Shipping ZIP Code",
                        maxLength: 10,
                      },
                    ].map(({ field, label, maxLength }) => (
                      <div key={field}>
                        <label
                          htmlFor={`edit-${field}`}
                          className="mb-1 block text-sm font-semibold"
                        >
                          {label} *
                        </label>

                        <input
                          id={`edit-${field}`}
                          type="text"
                          required
                          maxLength={maxLength}
                          value={editForm[field]}
                          onChange={(event) =>
                            handleEditChange(field, event.target.value)
                          }
                          disabled={savingEdit}
                          aria-invalid={Boolean(editErrors[field])}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-green-700 focus:outline-none disabled:opacity-60"
                        />

                        {editErrors[field] && (
                          <p className="mt-1 text-xs text-red-700">
                            {editErrors[field]}
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="edit-shipping-state"
                        className="mb-1 block text-sm font-semibold"
                      >
                        Shipping State *
                      </label>

                      <select
                        id="edit-shipping-state"
                        required
                        value={editForm.shipping_state.toUpperCase()}
                        onChange={(event) =>
                          handleEditChange("shipping_state", event.target.value)
                        }
                        disabled={savingEdit}
                        aria-invalid={Boolean(editErrors.shipping_state)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-green-700 focus:outline-none disabled:opacity-60"
                      >
                        <option value="">Select a state</option>

                        {usStates.map((state) => (
                          <option
                            key={state.abbreviation}
                            value={state.abbreviation}
                          >
                            {state.name}
                          </option>
                        ))}
                      </select>

                      {editErrors.shipping_state && (
                        <p className="mt-1 text-xs text-red-700">
                          {editErrors.shipping_state}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {actionError && ( //Display validation errors returned by the customer API
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
                >
                  {actionError}
                </p>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={closeEditCustomer}
                  disabled={savingEdit}
                  className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
