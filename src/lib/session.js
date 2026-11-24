import "server-only";
import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "sills_farm_session";
const SESSION_DURATION = 60 * 60 * 8; // 8 hours

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must contain at least 32 characters."
    );
  }

  return new TextEncoder().encode(secret);
}

// ==================================================
// Create a session after successful authentication.
// ==================================================

export async function createSession({
  userId,
  expectedUsername,
  expectedPasswordHash,
}) {
  if (
    !Number.isSafeInteger(userId) ||
    userId <= 0 ||
    typeof expectedUsername !== "string" ||
    !expectedUsername ||
    typeof expectedPasswordHash !== "string" ||
    !expectedPasswordHash
  ) {
    throw new Error("Invalid session creation parameters.");
  }

  const sessionId = randomUUID();

  // Prepare the session token before modifying the database.
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAtSeconds = issuedAt + SESSION_DURATION;
  const expiresAt = new Date(expiresAtSeconds * 1000);

  const token = await new SignJWT({
    sid: sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAtSeconds)
    .sign(getSecretKey());

  const cookieStore = await cookies();

  // ==================================================
  // Sprint 4: Coordinate session creation with
  // password changes and account updates.
  // ==================================================

  const authenticatedUser = await prisma.$transaction(
    async (tx) => {
      // Lock the account until the transaction completes.
      // Password resets use the same account-level lock.
      await tx.$queryRaw`
        SELECT id
        FROM public.users
        WHERE id = ${userId}
        FOR UPDATE
      `;

      // Retrieve the latest account information after
      // acquiring the row lock.
      const currentUser = await tx.users.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          password_hash: true,
          role: true,
          status: true,
        },
      });

      // Reject authentication if account information
      // changed after the original credential check.
      if (
        !currentUser ||
        currentUser.status !== "Active" ||
        currentUser.username !== expectedUsername ||
        currentUser.password_hash !== expectedPasswordHash
      ) {
        return null;
      }

      // Record the session in PostgreSQL.
      await tx.user_sessions.create({
        data: {
          id: sessionId,
          user_id: currentUser.id,
          expires_at: expiresAt,
        },
      });

      // Record the most recent successful login.
      await tx.users.update({
        where: {
          id: currentUser.id,
        },
        data: {
          last_login: new Date(),
        },
      });

      // Clear failed-login attempts atomically with
      // successful session creation.
      await tx.login_attempts.deleteMany({
        where: {
          username: currentUser.username,
        },
      });

      // Return only safe account information.
      return {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        role: currentUser.role,
      };
    },
    {
      isolationLevel: "ReadCommitted",
    }
  );

  // No session was created if authentication became stale.
  if (!authenticatedUser) {
    return null;
  }

  // Store the JWT only after the transaction succeeds.
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(
      1,
      expiresAtSeconds - Math.floor(Date.now() / 1000)
    ),
  });

  return authenticatedUser;
}

// ==================================================
// Verify the JWT and check its database session.
// ==================================================

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      getSecretKey(),
      {
        algorithms: ["HS256"],
      }
    );

    const userId = Number(payload.sub);
    const sessionId = payload.sid;

    if (
      !Number.isSafeInteger(userId) ||
      userId <= 0 ||
      typeof sessionId !== "string"
    ) {
      return null;
    }

    // Find the session in PostgreSQL.
    const session = await prisma.user_sessions.findUnique({
      where: {
        id: sessionId,
      },
    });

    // Reject missing, revoked, or expired sessions.
    if (
      !session ||
      session.user_id !== userId ||
      session.revoked_at !== null ||
      session.expires_at <= new Date()
    ) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

// ==================================================
// Revoke the session and remove its cookie.
// ==================================================

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(
        token,
        getSecretKey(),
        {
          algorithms: ["HS256"],
        }
      );

      const sessionId = payload.sid;
      const userId = Number(payload.sub);

      if (
        typeof sessionId === "string" &&
        Number.isSafeInteger(userId) &&
        userId > 0
      ) {
        await prisma.user_sessions.updateMany({
          where: {
            id: sessionId,
            user_id: userId,
            revoked_at: null,
          },
          data: {
            revoked_at: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Session revocation failed:", error);
      throw error;
    }
  }

  // Clear the browser cookie.
  cookieStore.delete(COOKIE_NAME);
}