
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    // Require a request originating from this application.
    const origin = request.headers.get("origin");
    const expectedOrigin = new URL(request.url).origin;

    if (origin !== expectedOrigin) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }

    // Revoke the session in PostgreSQL and clear the cookie.
    await deleteSession();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout failed:", error);

    return NextResponse.json(
      { error: "Unable to log out. Please try again." },
      { status: 500 }
    );
  }
}
