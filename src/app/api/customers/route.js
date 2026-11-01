import { NextResponse } from "next/server";
import { UsaStates } from "usa-states";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

// Use the same U.S. state codes as the customer form.
const validStateCodes = new Set(
  new UsaStates().states.map((state) => state.abbreviation),
);

// Validate customer information before saving to PostgreSQL.
function validateCustomer(body) {
  const errors = {};

  // Maximum field lengths match the PostgreSQL customer model.
  const required = {
    code: 30,
    name: 150,
    address: 255,
    city: 100,
    state: 2,
    zip: 10,
    phone: 25,
    status: 20,
  };

  const customer = {};

  // Reject missing fields and values exceeding database limits.
  for (const [field, maxLength] of Object.entries(required)) {
    const value = body[field];

    if (typeof value !== "string" || !value.trim()) {
      errors[field] = "This field is required.";
      continue;
    }

    customer[field] = value.trim();

    if (customer[field].length > maxLength) {
      errors[field] = `Maximum ${maxLength} characters allowed.`;
    }
  }
  // Require a standard five-digit U.S. ZIP code.
  if (customer.zip && !/^\d{5}$/.test(customer.zip)) {
    errors.zip = "ZIP Code must contain exactly 5 digits.";
  }
  // Accept common phone formats but require exactly ten digits.
  if (customer.phone) {
    const digits = customer.phone.replace(/\D/g, "");

    if (!/^[\d\s()+.-]+$/.test(customer.phone) || digits.length !== 10) {
      errors.phone = "Enter a valid 10-digit phone number.";
    }
  }
  // Reject invalid U.S. state abbreviations.
  if (customer.state && !validStateCodes.has(customer.state.toUpperCase())) {
    errors.state = "Please select a valid U.S. state.";
  }
  // Customers can only have Active or Inactive status.
  if (customer.status && !["Active", "Inactive"].includes(customer.status)) {
    errors.status = "Status must be Active or Inactive.";
  }

  return { customer, errors };
}
// Handle customer creation requests from the Add New Customer form.
export async function POST(request) {
  try {
    // Require an authenticated, active Administrator.
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }
    // Confirm the user's account is still active.
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });

    if (!user || user.status !== "Active") {
      return NextResponse.json(
        { error: "Account is not active." },
        { status: 403 },
      );
    }

    // Require an authenticated, active Administrator or Employee.
    const allowedRoles = ["Administrator", "Employee"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to add customers." },
        { status: 403 },
      );
    }

    // Reject requests originating from another site.
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    }
    // Return a client error when the request contains invalid JSON.
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid customer information." },
        { status: 400 },
      );
    }
    // Validate the request on the server before saving.
    const { customer, errors } = validateCustomer(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Please correct the highlighted fields.", errors },
        { status: 400 },
      );
    }

    // Insert the validated customer into Azure PostgreSQL using Prisma.
    const created = await prisma.customers.create({
      data: {
        customer_code: customer.code,
        name: customer.name,
        address: customer.address,
        city: customer.city,
        state: customer.state.toUpperCase(),
        zip: customer.zip,
        phone: customer.phone,
        status: customer.status,
      },
    });
    // Return confirmation and the newly created customer's identifier.
    return NextResponse.json(
      {
        success: true,
        message: "Customer added successfully.",
        customer: {
          id: created.id,
          code: created.customer_code,
          name: created.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    // PostgreSQL unique constraint: duplicate customer code.
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This customer code already exists." },
        { status: 409 },
      );
    }
    // Log unexpected errors without exposing internal details to users.
    console.error("Customer creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create customer." },
      { status: 500 },
    );
  }
}
