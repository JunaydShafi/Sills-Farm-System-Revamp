import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { getBagInventory } from "@/lib/bagInventory";

export const runtime = "nodejs";

// Return calculated finished-goods balances to signed-in users.
export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { status: true },
    });

    if (!user || user.status !== "Active") {
      return NextResponse.json(
        { error: "Account is unavailable." },
        { status: 401 },
      );
    }

    const items = await getBagInventory();

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Bag inventory lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to load bag inventory." },
      { status: 500 },
    );
  }
}
