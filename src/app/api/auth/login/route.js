
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/session";

import {
  checkLoginLimit,
  recordFailedLogin,
  clearFailedLogins,
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

    const body = await request.json();
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
    });

    // Verify credentials without revealing whether
    // the account exists.
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
    // Create session and record successful login
    // ==================================================

    await createSession(user.id);

    // Record the user's most recent successful login.
    await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        last_login: new Date(),
      },
    });

    // Reset the failed-attempt counter.
    await clearFailedLogins(cleanUsername);

    return NextResponse.json({
      success: true,
      message: "Login successful. Session created.",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      { error: "Unable to process login." },
      { status: 500 }
    );
  }
}
