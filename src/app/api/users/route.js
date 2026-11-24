
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { checkApiRateLimit } from "@/lib/apiRateLimit";
import { API_RATE_LIMITS } from "@/lib/apiRateLimitConfig";
import { rateLimitResponse } from "@/lib/apiRateLimitResponse";
import { validateEmail } from "@/lib/emailValidation";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

// GET - List users (active Administrators only).
export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });

    if (
      !currentUser ||
      currentUser.role !== "Administrator" ||
      currentUser.status !== "Active"
    ) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Sprint 4: Apply per-Administrator API throttling.
    // All User Management operations share this allowance.
    const rateLimit = await checkApiRateLimit({
      key: `user-management:user:${userId}`,
      ...API_RATE_LIMITS.userManagement,
    });

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        status: true,
        last_login: true,
        is_owner: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(
      users.map((user) => ({
        ...user,
        can_edit: !user.is_owner || user.id === userId,
      }))
    );
  } catch (error) {
    console.error("Failed to retrieve users:", error);

    return NextResponse.json(
      { error: "Unable to retrieve users" },
      { status: 500 }
    );
  }
}

// POST - Create a new system user.
export async function POST(request) {
  try {
    const adminId = await getSessionUserId();

    if (!adminId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in again." },
        { status: 401 }
      );
    }

    const admin = await prisma.users.findUnique({
      where: { id: adminId },
      select: { role: true, status: true },
    });

    if (
      !admin ||
      admin.role !== "Administrator" ||
      admin.status !== "Active"
    ) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    // Sprint 4: Throttle User Management requests.
    // Shares the same 45-request allowance as GET /api/users.
    const rateLimit = await checkApiRateLimit({
      key: `user-management:user:${adminId}`,
      ...API_RATE_LIMITS.userManagement,
    });

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request." },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid request data." },
        { status: 400 }
      );
    }

    // Owner status is managed only by the server.
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "is_owner"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The System Owner designation cannot be assigned through User Management.",
        },
        { status: 403 }
      );
    }

    // Sprint 4: Email verification status is managed
    // exclusively by the server.
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "email_verified_at"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Email verification status cannot be assigned manually.",
        },
        { status: 403 }
      );
    }

    // Never accept a password hash from the browser.
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "password_hash"
      )
    ) {
      return NextResponse.json(
        { error: "Invalid password request." },
        { status: 400 }
      );
    }

    const { name, username, email, role, status, password } =
      body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 150
    ) {
      return NextResponse.json(
        { error: "Employee name must be 1-150 characters." },
        { status: 400 }
      );
    }

    if (
      typeof username !== "string" ||
      !username.trim() ||
      username.trim().length > 50
    ) {
      return NextResponse.json(
        { error: "Username must be 1-50 characters." },
        { status: 400 }
      );
    }

    if (!["Administrator", "Employee"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid user role." },
        { status: 400 }
      );
    }

    if (!["Active", "Inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid account status." },
        { status: 400 }
      );
    }

    if (
      typeof password !== "string" ||
      password.length < 12 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 12 characters and no more than 72 UTF-8 bytes.",
        },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanUsername = username.trim();

    // Sprint 4: Validate and normalize the optional
    // email address for password recovery.
    const emailValidation = validateEmail(email);

    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    const cleanEmail = emailValidation.email;

    // Prevent duplicate usernames.
    const existingUser = await prisma.users.findUnique({
      where: { username: cleanUsername },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }

    // Sprint 4: Prevent multiple user accounts from
    // sharing the same email address.
    if (cleanEmail !== null) {
      const existingEmail = await prisma.users.findUnique({
        where: { email: cleanEmail },
        select: { id: true },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "That email address is already in use." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create the new user.
    // Email addresses remain unverified until the
    // user completes the email verification process.
    const newUser = await prisma.users.create({
      data: {
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        email_verified_at: null,
        password_hash: passwordHash,
        role,
        status,
        is_owner: false,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        email_verified_at: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "New user created successfully.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle concurrent requests that violate a
    // username or email uniqueness constraint.
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "That username or email address is already in use.",
        },
        { status: 409 }
      );
    }

    console.error("Failed to create user:", error);

    return NextResponse.json(
      { error: "Unable to create new user." },
      { status: 500 }
    );
  }
}
