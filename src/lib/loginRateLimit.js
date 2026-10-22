
import "server-only";
import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 5;

// Check whether a username is temporarily restricted.
export async function checkLoginLimit(username) {
  const record = await prisma.login_attempts.findUnique({
    where: { username },
    select: { locked_until: true },
  });

  const lockedUntil = record?.locked_until;

  if (lockedUntil && lockedUntil > new Date()) {
    return {
      blocked: true,
      retryAfter: Math.max(
        1,
        Math.ceil((lockedUntil.getTime() - Date.now()) / 1000)
      ),
    };
  }

  return { blocked: false, retryAfter: 0 };
}

// Atomically record an unsuccessful login.
// PostgreSQL serializes conflicting updates to the same username.
export async function recordFailedLogin(username) {
  const rows = await prisma.$queryRaw`
    INSERT INTO "login_attempts"
      ("username", "failed_count", "window_start",
       "locked_until", "updated_at")
    VALUES
      (${username}, 1, NOW(), NULL, NOW())
    ON CONFLICT ("username")
    DO UPDATE SET
      "failed_count" =
        CASE
          WHEN "login_attempts"."window_start"
               <= NOW() - INTERVAL '15 minutes'
            OR (
              "login_attempts"."locked_until" IS NOT NULL
              AND "login_attempts"."locked_until" <= NOW()
            )
          THEN 1
          ELSE "login_attempts"."failed_count" + 1
        END,
      "window_start" =
        CASE
          WHEN "login_attempts"."window_start"
               <= NOW() - INTERVAL '15 minutes'
            OR (
              "login_attempts"."locked_until" IS NOT NULL
              AND "login_attempts"."locked_until" <= NOW()
            )
          THEN NOW()
          ELSE "login_attempts"."window_start"
        END,
      "locked_until" =
        CASE
          WHEN "login_attempts"."window_start"
               <= NOW() - INTERVAL '15 minutes'
            OR (
              "login_attempts"."locked_until" IS NOT NULL
              AND "login_attempts"."locked_until" <= NOW()
            )
          THEN NULL
          WHEN "login_attempts"."failed_count" + 1
               >= ${MAX_ATTEMPTS}
          THEN NOW() + INTERVAL '15 minutes'
          ELSE NULL
        END,
      "updated_at" = NOW()
    WHERE
      "login_attempts"."locked_until" IS NULL
      OR "login_attempts"."locked_until" <= NOW()
    RETURNING "locked_until"
  `;

  // An empty result means another request already locked the account.
  if (rows.length === 0) {
    return { blocked: true };
  }

  return {
    blocked: rows[0].locked_until !== null,
  };
}

// Clear failed attempts after a successful login.
export async function clearFailedLogins(username) {
  await prisma.login_attempts.deleteMany({
    where: { username },
  });
}
