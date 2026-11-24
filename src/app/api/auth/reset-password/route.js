import { NextResponse } from "next/server";

import { resetPassword } from "@/lib/passwordResetService";
import { rateLimitResponse } from "@/lib/apiRateLimitResponse";

export const runtime = "nodejs";

// ======================================================
// Public password reset endpoint
// ======================================================

export async function POST(request) {
  try {
    // ==================================================
    // Parse the submitted request
    // ==================================================

    const body = await request.json().catch(() => null);

    const validBody =
      body &&
      typeof body === "object" &&
      !Array.isArray(body);

    // Invalid request bodies are still passed to the
    // service so client-based throttling applies.
    const token = validBody ? body.token : undefined;

    const password = validBody
      ? body.password
      : undefined;

    const confirmPassword = validBody
      ? body.confirmPassword
      : undefined;

    // ==================================================
    // Process the password reset
    // ==================================================

    const result = await resetPassword({
      token,
      password,
      confirmPassword,
    });

    // ==================================================
    // Handle request throttling
    // ==================================================

    if (result.status === 429 && result.rateLimit) {
      return rateLimitResponse(result.rateLimit);
    }

    // ==================================================
    // Handle unsuccessful password resets
    // ==================================================

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
        },
        {
          status: result.status,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==================================================
    // Return successful password reset response
    // ==================================================

    // Do not return account information, password
    // hashes, reset tokens, or authentication cookies.
    //
    // The user must sign in with their new password.
    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    // ==================================================
    // Sanitized server-side error logging
    // ==================================================

    // Development environments may record recognized
    // error categories, Prisma error codes, and
    // allowlisted PostgreSQL error codes.
    //
    // Never log the full exception, request body,
    // submitted passwords, tokens, SQL statements,
    // database credentials, or raw error metadata.
    if (process.env.NODE_ENV === "development") {
      const knownErrorNames = [
        "PrismaClientKnownRequestError",
        "PrismaClientUnknownRequestError",
        "PrismaClientValidationError",
        "PrismaClientInitializationError",
        "PrismaClientRustPanicError",
        "Error",
        "TypeError",
      ];

      const errorName = knownErrorNames.includes(
        error?.name
      )
        ? error.name
        : "UnknownError";

      const errorCode =
        typeof error?.code === "string" &&
        /^P[0-9]{4}$/.test(error.code)
          ? error.code
          : "Unavailable";

      // PostgreSQL SQLSTATE codes relevant to
      // transaction concurrency and timeouts.
      const knownDatabaseCodes = [
        "40001", // Serialization failure
        "40P01", // Deadlock detected
        "55P03", // Lock not available
        "57014", // Query canceled
        "25P02", // Transaction already aborted
      ];

      // Prisma and its database adapter may expose
      // PostgreSQL error codes in different locations.
      const databaseCodeCandidates = [
        error?.meta?.code,
        error?.meta?.originalCode,
        error?.meta?.driverAdapterError?.cause?.originalCode,
        error?.meta?.driverAdapterError?.cause?.code,
        error?.cause?.originalCode,
        error?.cause?.code,
        error?.code,
      ];

      const databaseCode =
        databaseCodeCandidates.find(
          (code) =>
            typeof code === "string" &&
            knownDatabaseCodes.includes(code)
        ) ?? "Unavailable";

      console.error("Password reset request failed.", {
        name: errorName,
        code: errorCode,
        databaseCode,
      });
    } else {
      console.error("Password reset request failed.");
    }

    // Keep the public response generic in every
    // environment to avoid exposing internal details.
    return NextResponse.json(
      {
        error: "Unable to reset your password. Please try again later.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}