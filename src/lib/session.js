
import "server-only";
import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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

// Create a session after successful login.
export async function createSession(userId) {
  const sessionId = randomUUID();

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION * 1000
  );

  // Record the session in PostgreSQL.
  await prisma.user_sessions.create({
    data: {
      id: sessionId,
      user_id: userId,
      expires_at: expiresAt,
    },
  });

  // Create a signed JWT linked to the database session.
  const token = await new SignJWT({
    sid: sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey());

  // Store the JWT in an HTTP-only cookie.
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

// Verify the JWT and check its database session.
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

// Revoke the session and remove its cookie.
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
