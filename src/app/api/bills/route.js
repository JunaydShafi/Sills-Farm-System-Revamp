
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSessionUserId } from "../../../lib/session";

export const runtime = "nodejs";

const allowedRoles = ["Administrator", "Employee"];

// Check whether the current user is authorized.
async function getAuthorizedUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });

  if (!user || user.status !== "Active") {
    return {
      response: NextResponse.json(
        { error: "Account is not active." },
        { status: 403 }
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      response: NextResponse.json(
        { error: "You do not have permission to access bills." },
        { status: 403 }
      ),
    };
  }

  return { userId };
}

// Convert a date-only string into a Date object.
function parseDate(value) {
  if (typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

// Validate incoming bill information.
function validateBill(body) {
  const errors = {};
  const bill = {};

  const required = {
    vendorId: 30,
    invoiceNum: 30,
    description: 300,
    accNum: 20,
  };

  for (const [field, maxLength] of Object.entries(required)) {
    const value = body[field];

    if (typeof value !== "string" || !value.trim()) {
      errors[field] = "This field is required.";
      continue;
    }

    const cleaned = value.trim();

    if (cleaned.length > maxLength) {
      errors[field] = `Maximum ${maxLength} characters allowed.`;
      continue;
    }

    bill[field] = cleaned;
  }

  bill.dateIssued = parseDate(body.dateIssued);
  bill.dueDate = parseDate(body.dueDate);

  if (!bill.dateIssued) {
    errors.dateIssued = "Enter a valid issue date.";
  }

  if (!bill.dueDate) {
    errors.dueDate = "Enter a valid due date.";
  }

  if (
    bill.dateIssued &&
    bill.dueDate &&
    bill.dueDate < bill.dateIssued
  ) {
    errors.dueDate = "Due date cannot be before issue date.";
  }

  // Validate a positive amount with at most two decimal places.
  const amount = String(body.amountOwed ?? "").trim();

  if (
    !/^\d+(\.\d{1,2})?$/.test(amount) ||
    Number(amount) <= 0 ||
    Number(amount) > 9999999999.99
  ) {
    errors.amountOwed = "Enter a valid positive amount.";
  } else {
    bill.amountOwed = amount;
  }

  return { bill, errors };
}

// Convert a Prisma record into the format used by the page.
function formatBill(record) {
  return {
    id: record.id,
    vendorId: record.vendor_id,
    invoiceNum: record.invoiceNum,
    dateIssued: record.dateIssued.toISOString().slice(0, 10),
    dueDate: record.dueDate.toISOString().slice(0, 10),
    description: record.description,
    amountOwed: record.amountOwed.toString(),
    accNum: record.accNum,
  };
}

// GET: Retrieve all saved bills.
export async function GET() {
  try {
    const authorization = await getAuthorizedUser();

    if (authorization.response) {
      return authorization.response;
    }

    const records = await prisma.bills.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      bills: records.map(formatBill),
    });
  } catch (error) {
    console.error("Bill retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve bills." },
      { status: 500 }
    );
  }
}

// POST: Create a new bill.
export async function POST(request) {
  try {
    const authorization = await getAuthorizedUser();

    if (authorization.response) {
      return authorization.response;
    }

    // Only accept requests from the application's own origin.
    const origin = request.headers.get("origin");

    if (!origin || origin !== new URL(request.url).origin) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid bill information." },
        { status: 400 }
      );
    }

    const { bill, errors } = validateBill(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Please correct the bill information.", errors },
        { status: 400 }
      );
    }

    // Verify that the selected vendor exists.
    const vendor = await prisma.vendors.findUnique({
      where: { vendor_id: bill.vendorId },
      select: { vendor_id: true },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "The selected vendor does not exist." },
        { status: 400 }
      );
    }

    // Save the bill in PostgreSQL.
    const created = await prisma.bills.create({
      data: {
        vendor_id: bill.vendorId,
        invoiceNum: bill.invoiceNum,
        dateIssued: bill.dateIssued,
        dueDate: bill.dueDate,
        description: bill.description,
        amountOwed: bill.amountOwed,
        accNum: bill.accNum,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bill added successfully!",
        bill: formatBill(created),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bill creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create bill." },
      { status: 500 }
    );
  }
}
