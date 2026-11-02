"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { styles } from "@/app/FormWindow";

// Reusable confirmation dialog (used for Delete and unsaved-changes warnings).
// Render it with a `dialog` object to open it, or `null` to keep it closed:
//   { title, message, confirmLabel, cancelLabel, onConfirm }
// Cancel, the Escape key, or clicking the backdrop all call onCancel.
export default function ConfirmDialog({ dialog, onCancel }) {
  const cancelButtonRef = useRef(null);

  // Put focus on the safe choice (Cancel) when the dialog opens, and let
  // Escape close it.
  useEffect(() => {
    if (!dialog) {
      return;
    }

    cancelButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialog, onCancel]);

  if (!dialog) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-md overflow-hidden rounded-lg border border-gray-300 bg-[#f8f9f6] text-black shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-200 px-4 py-2">
          <AlertTriangle size={20} className="shrink-0 text-amber-700" />
          <h2 id="confirm-dialog-title" className="font-semibold">
            {dialog.title}
          </h2>
        </div>

        <p id="confirm-dialog-message" className="px-4 py-5 text-sm">
          {dialog.message}
        </p>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-300 bg-gray-50 px-4 py-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className={styles.secondaryButton}
          >
            {dialog.cancelLabel ?? "Cancel"}
          </button>

          <button
            type="button"
            onClick={dialog.onConfirm}
            className={
              dialog.danger
                ? "inline-flex items-center justify-center gap-2 rounded-md border border-red-900 bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800"
                : styles.primaryButton
            }
          >
            {dialog.confirmLabel ?? "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
