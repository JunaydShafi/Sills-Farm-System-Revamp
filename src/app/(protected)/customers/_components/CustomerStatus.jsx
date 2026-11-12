"use client";
import { AlertDialog } from "radix-ui";

export default function CustomerStatus({
  pendingCustomer,
  pendingStatus,
  updatingStatusId,
  actionError,
  cancelStatusChange,
  confirmStatusChange,
}) {
  return (
    <AlertDialog.Root
      open={pendingCustomer !== null}
      onOpenChange={(open) => {
        if (!open) cancelStatusChange();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[100] bg-black/50" />

        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 text-black shadow-2xl">
          <AlertDialog.Title className="mb-3 text-xl font-bold">
            {pendingStatus === "Inactive"
              ? "Deactivate Customer?"
              : "Reactivate Customer?"}
          </AlertDialog.Title>

          <AlertDialog.Description className="mb-5 text-sm leading-6 text-gray-600">
            Are you sure you want to{" "}
            {pendingStatus === "Inactive" ? "deactivate" : "reactivate"}{" "}
            <strong>
              {pendingCustomer?.name} ({pendingCustomer?.customer_code})
            </strong>
            ?
            <span className="mt-2 block">
              {pendingStatus === "Inactive"
                ? "The customer will be marked Inactive, but their information will remain in the database."
                : "The customer will be marked Active again."}
            </span>
          </AlertDialog.Description>

          {actionError && (
            <p role="alert" className="mb-4 text-sm font-medium text-red-700">
              {actionError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={updatingStatusId !== null}
                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                type="button"
                disabled={updatingStatusId !== null}
                onClick={(event) => {
                  event.preventDefault();
                  void confirmStatusChange();
                }}
                className={`rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50 ${
                  pendingStatus === "Inactive"
                    ? "bg-red-700 hover:bg-red-800"
                    : "bg-green-700 hover:bg-green-800"
                }`}
              >
                {updatingStatusId !== null
                  ? "Saving..."
                  : pendingStatus === "Inactive"
                    ? "Deactivate Customer"
                    : "Reactivate Customer"}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
