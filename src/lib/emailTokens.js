import "server-only";
import { randomBytes, createHash } from "node:crypto";

// Supported token purposes.
export const TOKEN_PURPOSES = Object.freeze({
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
});

// Token expiration periods in seconds.
export const TOKEN_EXPIRATION_SECONDS = Object.freeze({
  EMAIL_VERIFICATION: 24 * 60 * 60,
  PASSWORD_RESET: 15 * 60,
});

// Generates a cryptographically secure random token.
export function generateEmailToken() {
  return randomBytes(32).toString("hex");
}

// Validates the expected format of an email token.
export function isValidEmailToken(token) {
  return (
    typeof token === "string" &&
    /^[a-f0-9]{64}$/.test(token)
  );
}

// Hashes a token before database storage or lookup.
export function hashEmailToken(token) {
  if (!isValidEmailToken(token)) {
    throw new Error("Invalid email token format.");
  }

  return createHash("sha256")
    .update(token, "utf8")
    .digest("hex");
}

// Calculates the expiration date for a token.
export function getTokenExpiration(purpose) {
  if (!Object.hasOwn(TOKEN_EXPIRATION_SECONDS, purpose)) {
    throw new Error("Invalid email token purpose.");
  }

  const expirationSeconds =
    TOKEN_EXPIRATION_SECONDS[purpose];

  return new Date(
    Date.now() + expirationSeconds * 1000
  );
}