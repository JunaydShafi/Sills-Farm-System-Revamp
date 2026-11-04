
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { Prisma } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

// ======================================================
// GET - Retrieve a selected user's information
// ======================================================

export async function GET(request, { params }) {
  try {
    // Verify the current session.
    const adminId = await getSessionUserId();

    if (!adminId) {
      return NextResponse.json(
        { error: "Unauthorized" },
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
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Read the selected user's ID from the URL.
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Retrieve the selected user's information.
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to retrieve user:", error);

    return NextResponse.json(
      { error: "Unable to retrieve user" },
      { status: 500 }
    );
  }
}

// ======================================================
// PATCH - Update a selected user's profile
// ======================================================

export async function PATCH(request, { params }) {
  try {
    // Verify the authenticated Administrator.
    const adminId = await getSessionUserId();

    if (!adminId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in again." },
        { status: 401 }
      );
    }

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

    // Validate the selected user ID.
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid user ID." },
        { status: 400 }
      );
    }

    // Read the submitted data.
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

    const { name, username, role, status } = body;

    // ==================================================
    // Validate editable fields
    // ==================================================

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 150
    ) {
      return NextResponse.json(
        {
          error: "Employee name must be 1-150 characters.",
        },
        { status: 400 }
      );
    }

    if (
      typeof username !== "string" ||
      !username.trim() ||
      username.trim().length > 50
    ) {
      return NextResponse.json(
        {
          error: "Username must be 1-50 characters.",
        },
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

    // ==================================================
    // Validate optional password reset
    // ==================================================

    // Never accept a password hash from the browser.
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "password_hash"
      )
    ) {
      return NextResponse.json(
        { error: "Invalid password update request." },
        { status: 400 }
      );
    }

    const password = body.password;

    // If password is omitted, preserve the existing one.
    // If supplied, it must meet the password requirements.
    if (
      password !== undefined &&
      (
        typeof password !== "string" ||
        password.length < 12 ||
        Buffer.byteLength(password, "utf8") > 72
      )
    ) {
      return NextResponse.json(
        {
          error:
            "New password must be at least 12 characters and no more than 72 UTF-8 bytes.",
        },
        { status: 400 }
      );
    }

    // Hash the new password before saving.
    // Never store the plain-text password.
    const newPasswordHash =
      password !== undefined
        ? await bcrypt.hash(password, 12)
        : undefined;

    const cleanName = name.trim();
    const cleanUsername = username.trim();

    // ==================================================
    // Update PostgreSQL using a transaction
    // ==================================================

    let updatedUser;

    // Retry serialization conflicts when simultaneous
    // updates occur.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        updatedUser = await prisma.$transaction(
          async (tx) => {
            // Recheck Administrator permissions.
            const currentAdmin =
              await tx.users.findUnique({
                where: { id: adminId },
                select: {
                  role: true,
                  status: true,
                },
              });

            if (
              !currentAdmin ||
              currentAdmin.role !== "Administrator" ||
              currentAdmin.status !== "Active"
            ) {
              throw new Error("ADMIN_ACCESS_REVOKED");
            }

            // Find the account being edited.
            const existingUser =
              await tx.users.findUnique({
                where: { id: userId },
                select: {
                  id: true,
                  role: true,
                  status: true,
                },
              });

            if (!existingUser) {
              throw new Error("USER_NOT_FOUND");
            }

            // Prevent duplicate usernames.
            const duplicate =
              await tx.users.findUnique({
                where: {
                  username: cleanUsername,
                },
                select: {
                  id: true,
                },
              });

            if (
              duplicate &&
              duplicate.id !== userId
            ) {
              throw new Error("USERNAME_TAKEN");
            }

            // ==========================================
            // Protect the last active Administrator
            // ==========================================

            const removingAdmin =
              existingUser.role === "Administrator" &&
              existingUser.status === "Active" &&
              (
                role !== "Administrator" ||
                status !== "Active"
              );

            if (removingAdmin) {
              const adminCount =
                await tx.users.count({
                  where: {
                    role: "Administrator",
                    status: "Active",
                  },
                });

              if (adminCount <= 1) {
                throw new Error("LAST_ADMIN");
              }
            }

            // ==========================================
            // Update the user's information
            // ==========================================

            const updated = await tx.users.update({
              where: {
                id: userId,
              },
              data: {
                name: cleanName,
                username: cleanUsername,
                role,
                status,

                // Only update the password hash when
                // a new password was provided.
                ...(newPasswordHash !== undefined && {
                  password_hash: newPasswordHash,
                }),
              },

              // Never expose the password hash.
              select: {
                id: true,
                name: true,
                username: true,
                role: true,
                status: true,
              },
            });

            // ==========================================
            // Revoke existing sessions when necessary
            // ==========================================

            if (
              existingUser.role !== role ||
              existingUser.status !== status ||
              newPasswordHash !== undefined
            ) {
              await tx.user_sessions.updateMany({
                where: {
                  user_id: userId,
                  revoked_at: null,
                },
                data: {
                  revoked_at: new Date(),
                },
              });
            }

            return updated;
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          }
        );

        break;
      } catch (error) {
        if (
          error.code === "P2034" &&
          attempt < 2
        ) {
          continue;
        }

        throw error;
      }
    }

    // Return only safe profile information.
    return NextResponse.json({
      success: true,
      message: "User profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    // ==================================================
    // Handle known errors
    // ==================================================

    if (error.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    if (
      error.message === "USERNAME_TAKEN" ||
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }

    if (error.message === "LAST_ADMIN") {
      return NextResponse.json(
        {
          error:
            "The last active Administrator cannot be deactivated or demoted.",
        },
        { status: 400 }
      );
    }

    if (
      error.message === "ADMIN_ACCESS_REVOKED"
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator access is no longer available.",
        },
        { status: 403 }
      );
    }

    console.error("Failed to update user:", error);

    return NextResponse.json(
      {
        error: "Unable to update user profile.",
      },
      { status: 500 }
    );
  }
}
