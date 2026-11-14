"use client";

import { Dialog } from "radix-ui";
import { X } from "lucide-react";

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
                Update customer information. All fields are required.
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
                      aria-invalid={Boolean(editErrors[field])}
                      aria-describedby={
                        editErrors[field] ? `edit-${field}-error` : undefined
                      }
                      disabled={savingEdit}
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
