
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

// Retrieve address suggestions from Geoapify for authenticated users.
export async function GET(request) {
// Prevent unauthenticated users from accessing address search.
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }
  // Read the address entered by the user from the URL query.
  const text = new URL(request.url).searchParams.get("text")?.trim();

  // Require at least 3 characters and limit the input length.
  if (!text || text.length < 3 || text.length > 150) {
    return NextResponse.json({ suggestions: [] });
  }
  // Keep the Geoapify API key on the server instead of exposing it to the browser.
  if (!process.env.GEOAPIFY_API_KEY) {
    return NextResponse.json(
      { error: "Address autocomplete is not configured." },
      { status: 503 }
    );
  }
  // Build the Geoapify request for up to 5 U.S. address suggestions.
  const url = new URL(
    "https://api.geoapify.com/v1/geocode/autocomplete"
  );

  url.searchParams.set("text", text);
  url.searchParams.set("filter", "countrycode:us");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("apiKey", process.env.GEOAPIFY_API_KEY);

  try {
    // Request live suggestions and stop if Geoapify takes too long.
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Address search is temporarily unavailable." },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Convert Geoapify results into fields used by the customer form.
    const suggestions = (data.results || []).map((item) => ({
      label: item.formatted,
      street: [item.housenumber, item.street].filter(Boolean).join(" "),
      city: item.city || item.town || item.village || "",
      state: item.state_code || "",
      zip: item.postcode || "",
    }));

    return NextResponse.json({ suggestions });
  } catch {
    // Return a safe error if Geoapify is unavailable or the request times out.
    return NextResponse.json(
      { error: "Unable to search addresses." },
      { status: 502 }
    );
  }
}
