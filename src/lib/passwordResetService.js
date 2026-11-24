import "server-only";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";

import { checkApiRateLimit } from "@/lib/apiRateLimit";
import { API_RATE_LIMITS } from "@/lib/apiRateLimitConfig";
import { getLoginClientIdentifier } from "@/lib/loginClientIdentifier";

import {
  TOKEN_PURPOSES,
  isValidEmailToken,
} from "@/lib/emailTokens";

import {
  consumeEmailToken,
  revokeUserEmailTokens,
} from "@/lib/emailTokenService";

// ======================================================
// Password reset configuration
// ======================================================

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_BYTES = 72;
const BCRYPT_ROUNDS = 12;

const INVALID_TOKEN_MESSAGE =
  "This password reset link is invalid or has expired. Please request a new password reset link.";

// ======================================================
// Password reset service
// ======================================================

export async function resetPassword({
  token,
  password,
  confirmPassword,
}) {
  // ====================================================
  // Client-based request throttling
  // ====================================================

  // Reuse trusted client identification while maintaining
  // a separate counter for password reset submissions.
  const clientIdentifier = getLoginClientIdentifier();

  const clientHash = createHash("sha256")
    .update(clientIdentifier, "utf8")
    .digest("hex");

  const clientLimit = await checkApiRateLimit({
    key: `password-reset:client:${clientHash}`,
    ...API_RATE_LIMITS.passwordRecoveryReset,
  });

  if (!clientLimit.allowed) {
    return {
      success: false,
      status: 429,
      rateLimit: clientLimit,
    };
  }

  // ====================================================
  // Validate the reset token format
  // ====================================================

  if (!isValidEmailToken(token)) {
    return {
      success: false,
      status: 400,
      error: INVALID_TOKEN_MESSAGE,
    };
  }

  // ====================================================
  // Token-based request throttling
  // ====================================================

  // Protect an individual reset token from repeated
  // submission attempts across different clients.
  const tokenIdentifier = createHash("sha256")
    .update(`password-reset:${token}`, "utf8")
    .digest("hex");

  const tokenLimit = await checkApiRateLimit({
    key: `password-reset:token:${tokenIdentifier}`,
    ...API_RATE_LIMITS.passwordRecoveryReset,
  });

  if (!tokenLimit.allowed) {
    return {
      success: false,
      status: 429,
      rateLimit: tokenLimit,
    };
  }

  // ====================================================
  // Validate the submitted password
  // ====================================================

  if (
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    !password.trim()
  ) {
    return {
      success: false,
      status: 400,
      error: "Please enter and confirm your new password.",
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      status: 400,
      error: "Password must contain at least 12 characters.",
    };
  }

  if (
    Buffer.byteLength(password, "utf8") >
    MAX_PASSWORD_BYTES
  ) {
    return {
      success: false,
      status: 400,
      error: "Password must not exceed 72 UTF-8 bytes.",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      status: 400,
      error: "Passwords do not match.",
    };
  }

  // ====================================================
  // Generate the new password hash
  // ====================================================

  // Perform expensive password hashing outside the
  // database transaction to minimize account lock time.
  const passwordHash = await bcrypt.hash(
    password,
    BCRYPT_ROUNDS
  );

  // ====================================================
  // Atomically consume the token and reset the password
  // ====================================================

  const result = await consumeEmailToken({
    token,
    purpose: TOKEN_PURPOSES.PASSWORD_RESET,

    operation: async (tx, user) => {
      const now = new Date();

      // ================================================
      // Update the account password
      // ================================================

      // The shared token service has already locked
      // the account and confirmed its eligibility.
      const updatedUser = await tx.users.update({
        where: {
          id: user.id,
        },
        data: {
          password_hash: passwordHash,
        },
        select: {
          username: true,
        },
      });

      // ================================================
      // Revoke all existing account sessions
      // ================================================

      // Every existing session for this account becomes
      // invalid after a successful password reset.
      await tx.user_sessions.updateMany({
        where: {
          user_id: user.id,
          revoked_at: null,
        },
        data: {
          revoked_at: now,
        },
      });

      // ================================================
      // Revoke outstanding email tokens
      // ================================================

      // Invalidate all other unused and unrevoked
      // verification and password reset tokens.
      //
      // The token currently being consumed is excluded
      // because its used_at field has already been set.
      await revokeUserEmailTokens(tx, user.id);

      // ================================================
      // Clear existing failed-login restrictions
      // ================================================

      // Allow the user to sign in with their new
      // password without retaining an old lockout.
      await tx.login_attempts.deleteMany({
        where: {
          username: updatedUser.username,
        },
      });
    },
  });

  // ====================================================
  // Handle invalid or unavailable reset tokens
  // ====================================================

  // Expired, used, revoked, nonexistent, wrong-purpose,
  // and ineligible-account tokens receive the same error.
  if (!result) {
    return {
      success: false,
      status: 400,
      error: INVALID_TOKEN_MESSAGE,
    };
  }

  // ====================================================
  // Successful password reset
  // ====================================================

  // Do not automatically authenticate the user.
  // They must sign in using their new password.
  return {
    success: true,
    status: 200,
    message:
      "Your password has been reset successfully. Please sign in with your new password.",
  };
}