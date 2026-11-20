import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { rateLimitResponse } from "@/lib/apiRateLimitResponse";
import { requestEmailVerification } from "@/lib/emailVerificationService";

export const runtime = "nodejs";

// ======================================================
// POST - Request email verification for a selected user
// Administrator access only
// ======================================================

export async function POST(request, { params }) {
  try {
    // Obtain the authenticated user's ID from the session.
    const adminId = await getSessionUserId();

    if (!adminId) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please log in again.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // Verify active Administrator permissions.
    const admin = await prisma.users.findUnique({
      where: {
        id: adminId,
      },
      select: {
        role: true,
        status: true,
      },
    });

    if (
      !admin ||
      admin.role !== "Administrator" ||
      admin.status !== "Active"
    ) {
      return NextResponse.json(
        {
          error: "Administrator access required.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==================================================
    // Validate request origin
    // ==================================================

    const configuredUrl = process.env.APP_BASE_URL;

    if (!configuredUrl) {
      throw new Error("APP_BASE_URL is not configured.");
    }

    const allowedOrigin = new URL(configuredUrl).origin;
    const origin = request.headers.get("origin");

    // Require a matching origin for this browser-based
    // Administrator operation.
    if (origin !== allowedOrigin) {
      return NextResponse.json(
        {
          error: "Request origin is not allowed.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==================================================
    // Validate the selected user ID
    // ==================================================

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          error: "Invalid user ID.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==================================================
    // Request verification through the shared service
    // ==================================================

    // The Administrator ID comes from the session.
    // The selected user's ID comes from the route.
    //
    // The email address is retrieved from PostgreSQL
    // by the verification service, never from the browser.
    const result = await requestEmailVerification({
      requesterId: adminId,
      targetUserId: userId,
    });

    // Return the standard API throttling response.
    if (result.status === 429) {
      return rateLimitResponse(result.rateLimit);
    }

    // Handle authorization, account eligibility,
    // configuration and email delivery errors.
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

    // Return a success message without exposing the
    // verification token or other sensitive information.
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
  } catch {
    // Do not log sensitive verification information.
    console.error(
      "Administrator email verification request failed."
    );

    return NextResponse.json(
      {
        error: "Unable to request email verification.",
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