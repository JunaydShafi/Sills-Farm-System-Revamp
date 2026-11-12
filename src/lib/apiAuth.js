import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

// Shared sign-in check for API routes (same rules as /api/bag-inventory).
// Returns { userId } for an active signed-in user, or { response } to send
// back right away when the request is not allowed.
export async function requireActiveUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    };
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { status: true },
  });

  if (!user || user.status !== "Active") {
    return {
      response: NextResponse.json({ error: "Account is unavailable." }, { status: 401 }),
    };
  }

  return { userId };
}

// Turn a database error into a clear JSON response
export function databaseErrorResponse(error, what) {
  // P2021: the table does not exist yet in this database
  if (error?.code === "P2021") {
    return NextResponse.json(
      { error: `${what} isn't set up in the database yet.` },
      { status: 503 },
    );
  }

  console.error(`${what} request failed:`, error);

  return NextResponse.json(
    { error: `Unable to load ${what.toLowerCase()} right now. Please try again.` },
    { status: 500 },
  );
}

// Dates are stored as DATE columns. Convert both ways without time zone shifts.
export function toDateString(date) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function fromDateString(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function isDateString(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return toDateString(fromDateString(value)) === value;
}
