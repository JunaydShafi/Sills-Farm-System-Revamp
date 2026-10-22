
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

import {
  checkLoginLimit,
  recordFailedLogin,
  clearFailedLogins,
} from "@/lib/loginRateLimit";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    // Parse the submitted credentials.
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

    // Retrieve the account.
    const user = await prisma.users.findUnique({
      where: {
        username: cleanUsername,
      },
    });

    // Verify credentials without revealing whether the account exists.
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

    // Recheck before creating a session.
    // This narrows the race with simultaneous failed requests.
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

    // Create the authenticated session.
    await createSession(user.id);

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
