import "server-only";
import { prisma } from "./prisma";

// Atomically count a request in PostgreSQL.
// Each key represents a caller and an endpoint group.
export async function checkApiRateLimit({
  key,
  limit,
  windowSeconds,
}) {
  if (
    typeof key !== "string" ||
    !key ||
    key.length > 255 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    !Number.isSafeInteger(windowSeconds) ||
    windowSeconds < 1
  ) {
    throw new Error("Invalid API rate-limit configuration.");
  }

  const rows = await prisma.$queryRaw`
    INSERT INTO "api_rate_limits"
      ("key", "request_count", "window_start", "updated_at")
    VALUES
      (${key}, 1, NOW(), NOW())
    ON CONFLICT ("key")
    DO UPDATE SET
      "request_count" =
        CASE
          WHEN "api_rate_limits"."window_start"
            <= NOW() - (${windowSeconds}::integer * INTERVAL '1 second')
          THEN 1
          ELSE "api_rate_limits"."request_count" + 1
        END,
      "window_start" =
        CASE
          WHEN "api_rate_limits"."window_start"
            <= NOW() - (${windowSeconds}::integer * INTERVAL '1 second')
          THEN NOW()
          ELSE "api_rate_limits"."window_start"
        END,
      "updated_at" = NOW()
    RETURNING
      "request_count",
      "window_start",
      NOW() AS "checked_at"
  `;

  const record = rows[0];
  const count = record.request_count;

  const resetAt =
    record.window_start.getTime() + windowSeconds * 1000;

  const retryAfter = Math.max(
    1,
    Math.ceil((resetAt - record.checked_at.getTime()) / 1000)
  );

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfter: count > limit ? retryAfter : 0,
  };
}
