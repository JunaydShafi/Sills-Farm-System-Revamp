import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { checkApiRateLimit } from "@/lib/apiRateLimit";
import { API_RATE_LIMITS } from "@/lib/apiRateLimitConfig";
import { rateLimitResponse } from "@/lib/apiRateLimitResponse";
import {
  TOKEN_PURPOSES,
  isValidEmailToken,
} from "@/lib/emailTokens";
import {
  consumeEmailToken,
  revokeUserEmailTokens,
} from "@/lib/emailTokenService";

export const runtime = "nodejs";

// ======================================================
// POST - Confirm ownership of an email address
// ======================================================

export async function POST(request) {
  try {
    // Require an authenticated account.
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Please sign in to verify your email address.",
        },
        {
          status: 401,
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
    // Verify active account status
    // ==================================================

    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        status: true,
      },
    });

    if (!user || user.status !== "Active") {
      return NextResponse.json(
        {
          error: "Access denied.",
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
    // Apply confirmation attempt throttling
    // ==================================================

    const rateLimit = await checkApiRateLimit({
      key: `email-verification:confirm:${userId}`,
      ...API_RATE_LIMITS.emailVerificationConfirm,
    });

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    // ==================================================
    // Read and validate the submitted token
    // ==================================================

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON request.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error: "Invalid request data.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const { token } = body;

    if (!isValidEmailToken(token)) {
      return NextResponse.json(
        {
          error: "Invalid or expired verification link.",
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
    // Atomically consume the verification token
    // ==================================================

    const result = await consumeEmailToken({
      token,
      purpose: TOKEN_PURPOSES.EMAIL_VERIFICATION,

      // The token must belong to the authenticated user.
      expectedUserId: userId,

      // This operation runs inside the same transaction
      // that validates and consumes the token.
      operation: async (tx, verifiedUser) => {
        await tx.users.update({
          where: {
            id: verifiedUser.id,
          },
          data: {
            email_verified_at: new Date(),
          },
        });

        // Invalidate any other outstanding verification
        // tokens for this account.
        await revokeUserEmailTokens(
          tx,
          verifiedUser.id,
          TOKEN_PURPOSES.EMAIL_VERIFICATION
        );
      },
    });

    // Use a generic error for invalid, expired, revoked,
    // previously used or incorrectly assigned tokens.
    if (!result) {
      return NextResponse.json(
        {
          error:
            "This verification link is invalid, expired, or does not belong to your account.",
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
    // Return successful verification
    // ==================================================

    return NextResponse.json(
      {
        success: true,
        message: "Your email address has been verified successfully.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    // Never log the submitted verification token.
    console.error("Email verification confirmation failed.");

    return NextResponse.json(
      {
        error: "Unable to verify your email address.",
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