
import { NextResponse } from "next/server";
import { UsaStates } from "usa-states";
import { prisma } from "../../../lib/prisma";
import { getSessionUserId } from "../../../lib/session";

export const runtime = "nodejs";

const validStateCodes = new Set(
  new UsaStates().states.map((state) => state.abbreviation),
);

const allowedRoles = ["Administrator", "Employee"];

// Check that the user is signed in and has permission.
async function getAuthorizedUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
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
        { status: 403 },
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      response: NextResponse.json(
        { error: "You do not have permission to access vendors." },
        { status: 403 },
      ),
    };
  }

  return { userId };
}

// Validate vendor information before saving.
function validateVendor(body) {
  const errors = {};

  const required = {
    id: 30,
    name: 150,
    pNum: 25,
    street: 300,
    city: 150,
    state: 2,
    zip: 10,
    defaultAcc: 30,
    custAccId: 20,
  };

  const vendor = {};

  for (const [field, maxLength] of Object.entries(required)) {
    const value = body[field];

    if (typeof value !== "string" || !value.trim()) {
      errors[field] = "This field is required.";
      continue;
    }

    const cleanedValue = value.trim();

    if (cleanedValue.length > maxLength) {
      errors[field] = `Maximum ${maxLength} characters allowed.`;
      continue;
    }

    vendor[field] = cleanedValue;
  }

  // Store the taxable checkbox as a boolean in PostgreSQL.
  if (typeof body.taxId === "boolean") {
    vendor.taxId = body.taxId;
  } else if (
    body.taxId === "true" ||
    body.taxId === "false"
  ) {
    vendor.taxId = body.taxId;
  } else {
    errors.taxId = "Select whether this vendor is taxable.";
  }

  // Validate ZIP code.
  if (vendor.zip && !/^\d{5}$/.test(vendor.zip)) {
    errors.zip = "ZIP Code must contain exactly 5 digits.";
  }

  // Validate phone number.
  if (vendor.pNum) {
    const digits = vendor.pNum.replace(/\D/g, "");

    if (
      !/^[\d\s()+.-]+$/.test(vendor.pNum) ||
      digits.length !== 10
    ) {
      errors.pNum = "Enter a valid 10-digit phone number.";
    }
  }

  // Validate state abbreviation.
  if (
    vendor.state &&
    !validStateCodes.has(vendor.state.toUpperCase())
  ) {
    errors.state = "Please select a valid U.S. state.";
  }

  if (vendor.state) {
    vendor.state = vendor.state.toUpperCase();
  }

  return { vendor, errors };
}

// GET: Retrieve all vendors.
export async function GET() {
  try {
    const authorization = await getAuthorizedUser();

    if (authorization.response) {
      return authorization.response;
    }

    const records = await prisma.vendors.findMany({
      orderBy: {
        vendor_id: "asc",
      },
    });

    const vendors = records.map((record) => ({
      id: record.vendor_id,
      name: record.name,
      pNum: record.pNum,
      street: record.street,
      city: record.city,
      state: record.state,
      zip: record.zip,
      taxId: record.taxId,
      defaultAcc: record.defaultAcc,
      custAccId: record.custAccId,
    }));

    return NextResponse.json({
      success: true,
      vendors,
    });

  } catch (error) {
    console.error("Vendor retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve vendors." },
      { status: 500 },
    );
  }
}

// POST: Create a new vendor.
export async function POST(request) {
  try {
    const authorization = await getAuthorizedUser();

    if (authorization.response) {
      return authorization.response;
    }

    // Verify the request comes from this application.
    const origin = request.headers.get("origin");

    // Reject requests originating from another site.
    if (!origin || origin !== new URL(request.url).origin) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    }

    //Return client error for invalid JSON.
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid vendor information." },
        { status: 400 },
      );
    }

    const { vendor, errors } = validateVendor(body);

    // Return validation errors.
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          error: "Please correct the highlighted fields.",
          errors,
        },
        { status: 400 },
      );
    }

    // Insert the vendor into PostgreSQL.
    const created = await prisma.vendors.create({
      data: {
        vendor_id: vendor.id,
        name: vendor.name,
        pNum: vendor.pNum,
        street: vendor.street,
        city: vendor.city,
        state: vendor.state,
        zip: vendor.zip,
        taxId: vendor.taxId,
        defaultAcc: vendor.defaultAcc,
        custAccId: vendor.custAccId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Vendor added successfully.",
        vendor: {
          id: created.vendor_id,
          name: created.name,
        },
      },
      { status: 201 },
    );

  } catch (error) {
    // Prevent duplicate vendor IDs.
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "This vendor ID already exists." },
        { status: 409 },
      );
    }

    console.error("Vendor creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create vendor." },
      { status: 500 },
    );
  }
}
