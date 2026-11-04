
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

// ======================================================
// GET - Retrieve all system users (Administrator only)
// ======================================================

export async function GET() {
  try {
    // Verify the user has a valid session.
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only Administrators may view system users.
    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        role: true,
        status: true,
      },
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

    // Retrieve only the fields needed for the table.
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        status: true,
        last_login: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to retrieve users:", error);

    return NextResponse.json(
      { error: "Unable to retrieve users" },
      { status: 500 }
    );
  }
}

// ======================================================
// POST - Create a new system user (Administrator only)
// ======================================================

export async function POST(request) {
  try {
    // Verify the current session.
    const adminId = await getSessionUserId();

    if (!adminId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in again." },
        { status: 401 }
      );
    }

    // Verify Administrator permissions.
    const admin = await prisma.users.findUnique({
      where: { id: adminId },
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
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    // ==================================================
    // Read submitted information
    // ==================================================

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

    const {
      name,
      username,
      role,
      status,
      password,
    } = body;

    // Never accept a precomputed password hash
    // supplied by the browser.
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

    // ==================================================
    // Validate new user information
    // ==================================================

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

    // New accounts must have a password.
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

    // ==================================================
    // Check for duplicate usernames
    // ==================================================

    const existingUser = await prisma.users.findUnique({
      where: {
        username: cleanUsername,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }

    // ==================================================
    // Hash the password before storing it
    // ==================================================

    const passwordHash = await bcrypt.hash(password, 12);

    // ==================================================
    // Create the new account in PostgreSQL
    // ==================================================

    const newUser = await prisma.users.create({
      data: {
        name: cleanName,
        username: cleanUsername,
        password_hash: passwordHash,
        role,
        status,
      },

      // Return only safe account information.
      // Never return the password hash.
      select: {
        id: true,
        name: true,
        username: true,
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
    // Handle duplicate usernames caused by
    // simultaneous account creation requests.
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "That username is already taken." },
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
