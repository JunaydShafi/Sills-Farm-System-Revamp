
import "server-only";

// Validates and normalizes optional user email addresses.
// Empty email addresses are stored as NULL in PostgreSQL.

export function validateEmail(email) {
  // An omitted or empty email is allowed.
  if (email === undefined || email === null) {
    return { valid: true, email: null };
  }

  if (typeof email !== "string") {
    return {
      valid: false,
      error: "Invalid email address.",
    };
  }

  // Match the PostgreSQL email normalization constraint.
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return { valid: true, email: null };
  }

  if (cleanEmail.length > 254) {
    return {
      valid: false,
      error: "Email address must not exceed 254 characters.",
    };
  }

  // Basic email format validation.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(cleanEmail)) {
    return {
      valid: false,
      error: "Please enter a valid email address.",
    };
  }

  return {
    valid: true,
    email: cleanEmail,
  };
}
