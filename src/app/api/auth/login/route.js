import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/session";

import {
  checkLoginLimit,
  recordFailedLogin,
} from "../../../../lib/loginRateLimit";

import { checkApiRateLimit } from "@/lib/apiRateLimit";
import { API_RATE_LIMITS } from "@/lib/apiRateLimitConfig";
import { rateLimitResponse } from "@/lib/apiRateLimitResponse";
import { getLoginRateLimitKey } from "@/lib/loginClientIdentifier";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    // ==================================================
    // Sprint 4: Throttle total login requests
    // ==================================================

    // During local development, requests share a fixed
    // test identifier. Production requires a separately
    // configured trusted client identifier.
    //
    // This limit is independent of the existing
    // failed-login restriction for each username.
    const rateLimit = await checkApiRateLimit({
      key: getLoginRateLimitKey(),
      ...API_RATE_LIMITS.login,
    });

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    // ==================================================
    // Parse and validate submitted credentials
    // ==================================================

    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Valid username and password are required." },
        { status: 400 }
      );
    }

    const { username, password } = body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      username.trim().length > 50 ||
      !password
    ) {
      return NextResponse.json(
        { error: "Valid username and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();

    // ==================================================
    // Existing username-based failed-login restriction
    // ==================================================

    // Check for an existing temporary login restriction.
    const limit = await checkLoginLimit(cleanUsername);

    if (limit.blocked) {
      return NextResponse.json(
        {
          error: "Too many failed login attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfter),
          },
        }
      );
    }

    // ==================================================
    // Retrieve account and verify credentials
    // ==================================================

    const user = await prisma.users.findUnique({
      where: {
        username: cleanUsername,
      },
      select: {
        id: true,
        username: true,
        password_hash: true,
        status: true,
      },
    });

    // Use the same authentication error message for
    // nonexistent accounts and incorrect credentials.
    let passwordMatches = false;

    if (user && user.status === "Active") {
      passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
      );
    }

    if (!user || user.status !== "Active" || !passwordMatches) {
      const result = await recordFailedLogin(cleanUsername);

      if (result.blocked) {
        return NextResponse.json(
          {
            error: "Too many failed login attempts. Please try again in 15 minutes.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": "900",
            },
          }
        );
      }

      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // ==================================================
    // Recheck restrictions before creating a session
    // ==================================================

    // This narrows the race with simultaneous
    // failed login requests.
    const latestLimit = await checkLoginLimit(cleanUsername);

    if (latestLimit.blocked) {
      return NextResponse.json(
        {
          error: "Too many failed login attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(latestLimit.retryAfter),
          },
        }
      );
    }

    // ==================================================
    // Sprint 4: Create session using account-level locking
    // ==================================================

    // Pass the credentials that were originally checked.
    // Session creation will acquire the account lock and
    // confirm that these credentials are still current.
    //
    // This prevents a concurrent password change from
    // allowing stale credentials to create a new session.
    const authenticatedUser = await createSession({
      userId: user.id,
      expectedUsername: user.username,
      expectedPasswordHash: user.password_hash,
    });

    // Authentication may become stale if the account is
    // modified while the login request is processing.
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // Session creation, last_login updates, and failed-login
    // counter cleanup now occur in a single transaction.

    return NextResponse.json(
      {
        success: true,
        message: "Login successful. Session created.",
        user: {
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          username: authenticatedUser.username,
          role: authenticatedUser.role,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      { error: "Unable to process login." },
      { status: 500 }
    );
  }
}