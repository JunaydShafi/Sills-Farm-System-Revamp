import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

import {
  TOKEN_PURPOSES,
  generateEmailToken,
  isValidEmailToken,
  hashEmailToken,
  getTokenExpiration,
} from "@/lib/emailTokens";

// ======================================================
// Transaction handling
// ======================================================

const MAX_TRANSACTION_ATTEMPTS = 3;

// PostgreSQL errors that indicate a transaction can
// safely be retried from the beginning.
const RETRYABLE_DATABASE_CODES = [
  "40001", // Serialization failure
  "40P01", // Deadlock detected
];

// Identify retryable conflicts reported by Prisma
// or its PostgreSQL database adapter.
function isRetryableTransactionError(error) {
  // Prisma's standard transaction conflict error.
  if (error?.code === "P2034") {
    return true;
  }

  // Raw database queries may wrap PostgreSQL
  // transaction conflicts inside P2010.
  if (error?.code !== "P2010") {
    return false;
  }

  const databaseCodeCandidates = [
    error?.meta?.code,
    error?.meta?.originalCode,
    error?.meta?.driverAdapterError?.cause?.originalCode,
    error?.meta?.driverAdapterError?.cause?.code,
    error?.cause?.originalCode,
    error?.cause?.code,
  ];

  return databaseCodeCandidates.some(
    (code) =>
      typeof code === "string" &&
      RETRYABLE_DATABASE_CODES.includes(code)
  );
}

// Retry transactions when concurrent database operations
// cause a serialization conflict or deadlock.
export async function runEmailTokenTransaction(operation) {
  for (
    let attempt = 0;
    attempt < MAX_TRANSACTION_ATTEMPTS;
    attempt++
  ) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const canRetry =
        attempt < MAX_TRANSACTION_ATTEMPTS - 1 &&
        isRetryableTransactionError(error);

      if (!canRetry) {
        throw error;
      }

      // Log only the retry attempt in development.
      // Never log account information, tokens,
      // passwords, or raw database error details.
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Email token transaction conflict. Retrying.",
          {
            attempt: attempt + 2,
            maxAttempts: MAX_TRANSACTION_ATTEMPTS,
          }
        );
      }

      // Brief bounded backoff reduces the chance
      // of repeatedly encountering the same conflict.
      const delay =
        50 * (attempt + 1) +
        Math.floor(Math.random() * 50);

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }
}

// ======================================================
// Account locking
// ======================================================

// Lock the associated user account during token operations.
// This prevents concurrent account updates from interfering
// with token issuance or consumption.
async function lockUserAccount(tx, userId) {
  await tx.$queryRaw`
    SELECT id
    FROM public.users
    WHERE id = ${userId}
    FOR UPDATE
  `;
}

// ======================================================
// Token revocation
// ======================================================

// Revoke outstanding tokens within an existing transaction.
// If purpose is omitted, revoke all outstanding account tokens.
export async function revokeUserEmailTokens(
  tx,
  userId,
  purpose = null
) {
  if (
    purpose !== null &&
    !Object.values(TOKEN_PURPOSES).includes(purpose)
  ) {
    throw new Error("Invalid email token purpose.");
  }

  return tx.user_email_tokens.updateMany({
    where: {
      user_id: userId,
      used_at: null,
      revoked_at: null,

      ...(purpose !== null && {
        purpose,
      }),
    },
    data: {
      revoked_at: new Date(),
    },
  });
}

// ======================================================
// Token issuance
// ======================================================

// Generate a new token and store only its SHA-256 hash.
// The original token is returned to the server-side caller
// for delivery through the email service.
export async function issueEmailToken({
  userId,
  email,
  purpose,
}) {
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID.");
  }

  if (!Object.values(TOKEN_PURPOSES).includes(purpose)) {
    throw new Error("Invalid email token purpose.");
  }

  if (typeof email !== "string" || !email) {
    throw new Error("Invalid email address.");
  }

  return runEmailTokenTransaction(async (tx) => {
    // Serialize token issuance with account updates.
    await lockUserAccount(tx, userId);

    const user = await tx.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        email_verified_at: true,
        status: true,
      },
    });

    // Only active accounts with a matching email
    // address are eligible.
    if (
      !user ||
      user.status !== "Active" ||
      !user.email ||
      user.email !== email
    ) {
      return null;
    }

    // Password recovery requires a verified email.
    if (
      purpose === TOKEN_PURPOSES.PASSWORD_RESET &&
      !user.email_verified_at
    ) {
      return null;
    }

    // Already verified accounts do not need
    // another email verification token.
    if (
      purpose === TOKEN_PURPOSES.EMAIL_VERIFICATION &&
      user.email_verified_at
    ) {
      return null;
    }

    // Invalidate previous tokens of the same purpose.
    await revokeUserEmailTokens(tx, userId, purpose);

    const token = generateEmailToken();
    const tokenHash = hashEmailToken(token);
    const expiresAt = getTokenExpiration(purpose);

    await tx.user_email_tokens.create({
      data: {
        user_id: userId,
        email: user.email,
        token_hash: tokenHash,
        purpose,
        expires_at: expiresAt,
      },
    });

    return {
      token,
      email: user.email,
      expiresAt,
    };
  });
}

// ======================================================
// Token validation and consumption
// ======================================================

// Validate and consume a token within the same transaction
// as its associated account operation.
//
// The operation callback must perform database operations
// only. If it fails, token consumption is rolled back.
export async function consumeEmailToken({
  token,
  purpose,
  expectedUserId = null,
  operation,
}) {
  if (!isValidEmailToken(token)) {
    return null;
  }

  if (!Object.values(TOKEN_PURPOSES).includes(purpose)) {
    throw new Error("Invalid email token purpose.");
  }

  if (typeof operation !== "function") {
    throw new Error("A token operation is required.");
  }

  // Email verification must belong to the
  // authenticated user's own account.
  if (
    purpose === TOKEN_PURPOSES.EMAIL_VERIFICATION &&
    (
      !Number.isSafeInteger(expectedUserId) ||
      expectedUserId <= 0
    )
  ) {
    return null;
  }

  const tokenHash = hashEmailToken(token);

  return runEmailTokenTransaction(async (tx) => {
    const tokenRecord =
      await tx.user_email_tokens.findUnique({
        where: {
          token_hash: tokenHash,
        },
      });

    if (
      !tokenRecord ||
      tokenRecord.purpose !== purpose
    ) {
      return null;
    }

    // Do not allow one authenticated account to
    // verify another account's email address.
    if (
      expectedUserId !== null &&
      tokenRecord.user_id !== expectedUserId
    ) {
      return null;
    }

    await lockUserAccount(tx, tokenRecord.user_id);

    const user = await tx.users.findUnique({
      where: {
        id: tokenRecord.user_id,
      },
      select: {
        id: true,
        email: true,
        email_verified_at: true,
        status: true,
      },
    });

    // Confirm that the account remains eligible.
    if (
      !user ||
      user.status !== "Active" ||
      !user.email ||
      user.email !== tokenRecord.email
    ) {
      return null;
    }

    if (
      purpose === TOKEN_PURPOSES.PASSWORD_RESET &&
      !user.email_verified_at
    ) {
      return null;
    }

    if (
      purpose === TOKEN_PURPOSES.EMAIL_VERIFICATION &&
      user.email_verified_at
    ) {
      return null;
    }

    const now = new Date();

    // Atomically consume the token only if it
    // remains unused, unrevoked, and unexpired.
    const consumed =
      await tx.user_email_tokens.updateMany({
        where: {
          id: tokenRecord.id,
          token_hash: tokenHash,
          purpose,
          used_at: null,
          revoked_at: null,
          expires_at: {
            gt: now,
          },
        },
        data: {
          used_at: now,
        },
      });

    if (consumed.count !== 1) {
      return null;
    }

    // Complete the account operation in the same transaction.
    // Throwing an error rolls back token consumption.
    await operation(tx, user);

    return {
      success: true,
      userId: user.id,
    };
  });
}