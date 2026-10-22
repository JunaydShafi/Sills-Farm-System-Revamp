
"use client";

import { useState } from "react";
import { LockKeyhole, X } from "lucide-react";

export default function AccessDeniedButton({
  children,
  className = "",
}) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowPopup(true)}
        className={className}
      >
        {children}
      </button>

      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="access-denied-title"
            aria-describedby="access-denied-description"
            className="w-full max-w-md rounded-lg border border-red-300 bg-white p-6 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                aria-label="Close"
                className="rounded p-1 text-gray-600 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <LockKeyhole
              size={48}
              className="mx-auto mb-4 text-red-600"
            />

            <h2
              id="access-denied-title"
              className="text-2xl font-bold text-red-700"
            >
              Access Denied
            </h2>

            <p
              id="access-denied-description"
              className="mt-3 text-base text-gray-700"
            >
              Administrator privileges are required to
              access this section.
            </p>

            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="mt-6 rounded-md bg-emerald-600 px-8 py-2 font-semibold text-white transition hover:bg-emerald-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
