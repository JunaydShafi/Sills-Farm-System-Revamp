"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

// Reusable address autocomplete component powered by Geoapify.
// Allows users to search for addresses and populate customer address fields.
export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  disabled,
  className,
  error,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch address suggestions when the user enters at least 3 characters.
  useEffect(() => {
    if (!open || value.trim().length < 3) {
      return;
    }
    // Cancel outdated requests when the user continues typing.
    const controller = new AbortController();

    // Debounce requests for 300ms to reduce unnecessary API calls.
    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        // Call the Next.js API route instead of exposing the Geoapify API key.
        const response = await fetch(
          `/api/address-autocomplete?text=${encodeURIComponent(value)}`,
          { signal: controller.signal },
        );

        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        // Ignore canceled requests and clear suggestions on other errors.
        if (error.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    // Clean up pending requests when the input changes or unmounts.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, open]);

  return (
    //Street Address Input
    <div className="relative">
      <input
        id="address"
        name="address"
        value={value}
        disabled={disabled}
        autoComplete="off"
        placeholder="Start typing street address..."
        role="combobox"
        aria-autocomplete="list"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "address-error" : undefined}
        aria-expanded={open && suggestions.length > 0}
        aria-controls="address-suggestions"
        onChange={(event) => {
          onChange(event);
          setOpen(true);
          setSuggestions([]);
        }}
        className={className}
      />
      {open && suggestions.length > 0 && (
        //Display suggested addresses returned by Geopify
        <div
          id="address-suggestions"
          role="listbox"
          aria-label="Address suggestions"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
        >
          {suggestions.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => {
                // Populate the customer form and close the suggestions.
                onSelect(item);
                setOpen(false);
                setSuggestions([]);
              }}
              className="flex w-full items-start gap-2 border-b px-3 py-3 text-left text-sm hover:bg-green-100"
            >
              <MapPin size={17} className="shrink-0 text-green-800" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
      {open &&
        loading && ( //informs users while address suggestions are loading
          <p className="mt-1 text-xs text-gray-600">Searching addresses...</p>
        )}

      <p className="mt-1 text-xs text-gray-600">
        Powered by{" "}
        <a
          href="https://www.geoapify.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Geoapify
        </a>
      </p>
    </div>
  );
}
