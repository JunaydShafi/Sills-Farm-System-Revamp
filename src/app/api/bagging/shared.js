import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { validateBaggingRecord } from "@/lib/baggingValidation";
import { findMissingReferences } from "@/lib/bagging";

// Returns an error response, or null when the request comes from an active user.
export async function rejectUnlessActiveUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { status: true },
  });

  if (!user || user.status !== "Active") {
    return NextResponse.json(
      { error: "Account is not active." },
      { status: 403 },
    );
  }

  return null;
}

// Reads, validates and checks a bagging record sent to POST or PUT.
// Returns { record } when it is safe to save, or { response } with the error.
export async function readBaggingRequest(request) {
  // Reject requests originating from another site.
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return {
      response: NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      ),
    };
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return {
      response: NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      ),
    };
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      response: NextResponse.json(
        { error: "Invalid bagging record." },
        { status: 400 },
      ),
    };
  }

  const { record, errors } = validateBaggingRecord(body);

  if (Object.keys(errors).length === 0) {
    Object.assign(errors, await findMissingReferences(record));
  }

  if (Object.keys(errors).length > 0) {
    return {
      response: NextResponse.json(
        { error: "Please correct the highlighted fields.", errors },
        { status: 400 },
      ),
    };
  }

  return { record };
}
