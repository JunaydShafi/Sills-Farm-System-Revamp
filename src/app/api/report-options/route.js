import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { databaseErrorResponse, requireActiveUser } from "@/lib/apiAuth";

export const runtime = "nodejs";

// Customer and product choices for the Reports page dropdowns
export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;

    const [customers, products] = await Promise.all([
      prisma.customers.findMany({
        where: { status: "Active" },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.sale_items.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

    return NextResponse.json({ customers, products });
  } catch (error) {
    return databaseErrorResponse(error, "Report options");
  }
}
