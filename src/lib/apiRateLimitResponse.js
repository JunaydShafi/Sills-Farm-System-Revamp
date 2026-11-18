
import "server-only";
import { NextResponse } from "next/server";

// Convert a rejected rate-limit result into an HTTP 429 response.
export function rateLimitResponse(result) {
  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "Cache-Control": "no-store",
      },
    }
  );
}
