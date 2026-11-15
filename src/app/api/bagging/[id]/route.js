import { NextResponse } from "next/server";
import { updateBaggingRecord } from "@/lib/bagging";
import { rejectUnlessActiveUser, readBaggingRequest } from "../shared";

export const runtime = "nodejs";

// Update an existing bagging transaction.
export async function PUT(request, { params }) {
  try {
    const rejected = await rejectUnlessActiveUser();
    if (rejected) return rejected;

    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { error: "Invalid bagging record." },
        { status: 400 },
      );
    }

    const { record, response } = await readBaggingRequest(request);
    if (response) return response;

    const updated = await updateBaggingRecord(id, record);

    return NextResponse.json({
      success: true,
      message: "Bagging record updated.",
      record: updated,
    });
  } catch (error) {
    // Prisma: the record to update does not exist.
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "This bagging record no longer exists." },
        { status: 404 },
      );
    }

    console.error("Bagging record update failed:", error);

    return NextResponse.json(
      { error: "Unable to update bagging record." },
      { status: 500 },
    );
  }
}
