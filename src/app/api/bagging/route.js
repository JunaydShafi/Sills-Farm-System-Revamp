import { NextResponse } from "next/server";
import {
  listBaggingRecords,
  getBaggingOptions,
  createBaggingRecord,
} from "@/lib/bagging";
import { rejectUnlessActiveUser, readBaggingRequest } from "./shared";

export const runtime = "nodejs";

// Bagging transaction history plus the Product and Proc choices for the form.
export async function GET() {
  try {
    const rejected = await rejectUnlessActiveUser();
    if (rejected) return rejected;

    const [records, options] = await Promise.all([
      listBaggingRecords(),
      getBaggingOptions(),
    ]);

    return NextResponse.json({ records, ...options });
  } catch (error) {
    console.error("Bagging record lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to load bagging records." },
      { status: 500 },
    );
  }
}

// Save a new bagging transaction.
export async function POST(request) {
  try {
    const rejected = await rejectUnlessActiveUser();
    if (rejected) return rejected;

    const { record, response } = await readBaggingRequest(request);
    if (response) return response;

    const created = await createBaggingRecord(record);

    return NextResponse.json(
      { success: true, message: "Bagging record saved.", record: created },
      { status: 201 },
    );
  } catch (error) {
    console.error("Bagging record creation failed:", error);

    return NextResponse.json(
      { error: "Unable to save bagging record." },
      { status: 500 },
    );
  }
}
