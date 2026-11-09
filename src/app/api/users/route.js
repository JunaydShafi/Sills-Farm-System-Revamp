
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
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

    const { name, username, role, status, password } =
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

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.users.create({
      data: {
        name: cleanName,
        username: cleanUsername,
        password_hash: passwordHash,
        role,
        status,
        is_owner: false,
      },
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
