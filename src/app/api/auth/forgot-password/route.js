import { NextResponse } from "next/server";

import {
  requestPasswordRecovery,
} from "@/lib/passwordRecoveryService";

import { rateLimitResponse } from "@/lib/apiRateLimitResponse";

export const runtime = "nodejs";

// ======================================================
// Public password recovery endpoint
// ======================================================

export async function POST(request) {
  try {
    // ==================================================
    // Parse the submitted request
    // ==================================================

    const body = await request.json().catch(() => null);

    // Invalid request bodies are passed to the service
    // as an undefined email so client throttling still
    // applies before email validation.
    const email =
      body &&
      typeof body === "object" &&
      !Array.isArray(body)
        ? body.email
        : undefined;

    // ==================================================
    // Process the password recovery request
    // ==================================================

    const result = await requestPasswordRecovery({
      email,
    });

    // ==================================================
    // Handle client-based request throttling
    // ==================================================

    if (result.status === 429 && result.rateLimit) {
      return rateLimitResponse(result.rateLimit);
    }

    // ==================================================
    // Handle unsuccessful requests
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
    // Return the generic recovery response
    // ==================================================

    // Never disclose whether an account exists,
    // whether its email is verified, whether a token
    // was generated, or whether an email was delivered.
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
    // Never log submitted email addresses, tokens,
    // credentials, SQL statements, request bodies,
    // or raw error metadata.
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

      const errorCodeCandidates = [
        error?.code,
        error?.errorCode,
      ];

      const errorCode =
        errorCodeCandidates.find(
          (code) =>
            typeof code === "string" &&
            /^P[0-9]{4}$/.test(code)
        ) ?? "Unavailable";

      // Recognized PostgreSQL errors related to
      // concurrency, connectivity, and timeouts.
      const knownDatabaseCodes = [
        "40001", // Serialization failure
        "40P01", // Deadlock detected
        "55P03", // Lock not available
        "57014", // Query canceled
        "25P02", // Transaction already aborted
        "08000", // Connection exception
        "08001", // Unable to establish connection
        "08003", // Connection does not exist
        "08006", // Connection failure
        "53300", // Too many connections
        "57P01", // Administrator shutdown
      ];

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

      // Recognized network-related error codes.
      const knownNetworkCodes = [
        "ETIMEDOUT",
        "ECONNRESET",
        "ECONNREFUSED",
        "EHOSTUNREACH",
        "ENETUNREACH",
        "EAI_AGAIN",
        "ENOTFOUND",
        "UND_ERR_CONNECT_TIMEOUT",
        "UND_ERR_HEADERS_TIMEOUT",
        "UND_ERR_SOCKET",
      ];

      const networkCodeCandidates = [
        error?.code,
        error?.cause?.code,
        error?.meta?.code,
        error?.meta?.driverAdapterError?.cause?.code,
        error?.meta?.driverAdapterError?.cause?.originalCode,
      ];

      const networkCode =
        networkCodeCandidates.find(
          (code) =>
            typeof code === "string" &&
            knownNetworkCodes.includes(code)
        ) ?? "Unavailable";

      console.error("Password recovery request failed.", {
        name: errorName,
        code: errorCode,
        databaseCode,
        networkCode,
      });
    } else {
      console.error("Password recovery request failed.");
    }

    // Keep the public response generic to avoid
    // exposing internal application details.
    return NextResponse.json(
      {
        error: "Unable to process password recovery.",
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