
import "server-only";
import { createHash } from "node:crypto";

// Identify login requests for throttling.
//
// DEVELOPMENT:
// Uses a fixed identifier for local testing.
//
// PRODUCTION:
// Requires a trusted client IP integration before
// the application can accept login requests.
export function getLoginClientIdentifier() {
  if (process.env.NODE_ENV === "development") {
    return "development-local";
  }

  throw new Error(
    "Production login client identification is not configured."
  );
}

// Build a bounded, non-reversible database key.
// This avoids storing raw client identifiers in the
// API rate-limit table.
export function getLoginRateLimitKey() {
  const identifier = getLoginClientIdentifier();

  const hash = createHash("sha256")
    .update(identifier)
    .digest("hex");

  return `login:client:${hash}`;
}
