import { NextResponse } from "next/server";
import { UsaStates } from "usa-states";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

const validStateCodes = new Set(
  new UsaStates().states.map((state) => state.abbreviation),
);

const requiredFields = {
  name: 150,
  address: 255,
  city: 100,
  state: 2,
  zip: 10,
  phone: 25,
};

function validateShippingAddress(body) {
  const errors = {};
  const shipping = {};

  if (typeof body.shipping_same_as_main !== "boolean") {
    errors.shipping_same_as_main = "Invalid shipping address selection.";
    return { shipping, errors };
  }

  shipping.shipping_same_as_main = body.shipping_same_as_main;

  if (body.shipping_same_as_main) {
    shipping.shipping_address = null;
    shipping.shipping_city = null;
    shipping.shipping_state = null;
    shipping.shipping_zip = null;

    return { shipping, errors };
  }

  const fields = {
    shipping_address: 255,
    shipping_city: 100,
    shipping_state: 2,
    shipping_zip: 10,
  };

  for (const [field, maxLength] of Object.entries(fields)) {
    const value = body[field];

    if (typeof value !== "string" || !value.trim()) {
      errors[field] = "This field is required.";
      continue;
    }

    shipping[field] = value.trim();

    if (shipping[field].length > maxLength) {
      errors[field] = `Maximum ${maxLength} characters allowed.`;
    }
  }

  if (
    shipping.shipping_state &&
    !validStateCodes.has(shipping.shipping_state.toUpperCase())
  ) {
    errors.shipping_state = "Please select a valid U.S. state.";
  }

  if (shipping.shipping_zip && !/^\d{5}$/.test(shipping.shipping_zip)) {
    errors.shipping_zip = "ZIP Code must contain exactly 5 digits.";
  }

  if (shipping.shipping_state) {
    shipping.shipping_state = shipping.shipping_state.toUpperCase();
  }

  return { shipping, errors };
}


function validateCustomer(body) {
  const errors = {};
  const customer = {};

  for (const [field, maxLength] of Object.entries(requiredFields)) {
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

  if (customer.zip && !/^\d{5}$/.test(customer.zip)) {
    errors.zip = "ZIP Code must contain exactly 5 digits.";
  }

  if (customer.phone) {
    const digits = customer.phone.replace(/\D/g, "");

    if (!/^[\d\s()+.-]+$/.test(customer.phone) || digits.length !== 10) {
      errors.phone = "Enter a valid 10-digit phone number.";
    }
  }

  if (customer.state && !validStateCodes.has(customer.state.toUpperCase())) {
    errors.state = "Please select a valid U.S. state.";
  }

  return { customer, errors };
}

// Update an existing customer in Azure PostgreSQL.
export async function PATCH(request, { params }) {
  try {
    // Check authentication.
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    // Check account status and permissions.
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });

    if (
      !user ||
      user.status !== "Active" ||
      !["Administrator", "Employee"].includes(user.role)
    ) {
      return NextResponse.json(
        { error: "You do not have permission to edit customers." },
        { status: 403 },
      );
    }

    // Prevent cross-origin updates.
    const origin = request.headers.get("origin");

    if (!origin || origin !== new URL(request.url).origin) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    }

    // Validate the customer ID.
    const { id } = await params;
    const customerId = Number(id);

    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID." },
        { status: 400 },
      );
    }

    // Read and validate the submitted data.
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

    // Handle a status-only update without modifying other customer data.
    if (Object.keys(body).length === 1 && "status" in body) {
      const newStatus = body.status;

      if (!["Active", "Inactive"].includes(newStatus)) {
        return NextResponse.json(
          { error: "Invalid customer status." },
          { status: 400 },
        );
      }

      const previousStatus = newStatus === "Inactive" ? "Active" : "Inactive";

      // Update only when the customer has the opposite status.
      const result = await prisma.customers.updateMany({
        where: {
          id: customerId,
          status: previousStatus,
        },
        data: {
          status: newStatus,
        },
      });

      if (result.count === 0) {
        const existing = await prisma.customers.findUnique({
          where: { id: customerId },
          select: { status: true },
        });

        return NextResponse.json(
          {
            error: existing
              ? `Customer is already ${newStatus}.`
              : "Customer not found.",
          },
          { status: existing ? 409 : 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message:
          newStatus === "Active"
            ? "Customer reactivated successfully."
            : "Customer deactivated successfully.",
        customer: {
          id: customerId,
          status: newStatus,
        },
      });
    }
    // Status must be changed through the dedicated status-only request.
    if ("status" in body) {
      return NextResponse.json(
        { error: "Change customer status using the status controls." },
        { status: 400 },
      );
    }

    const { customer, errors } = validateCustomer(body);

    // Only update shipping information when it is provided.
    const shippingProvided = Object.prototype.hasOwnProperty.call(
      body,
      "shipping_same_as_main",
    );

    let shipping = {};

    if (shippingProvided) {
      const result = validateShippingAddress(body);
      shipping = result.shipping;
      Object.assign(errors, result.errors);
    }
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Please correct the highlighted fields.", errors },
        { status: 400 },
      );
    }

    // Update the existing record without creating a new customer.
    const updated = await prisma.customers.update({
      where: { id: customerId },
      data: {
        name: customer.name,
        address: customer.address,
        city: customer.city,
        state: customer.state.toUpperCase(),
        zip: customer.zip,
        phone: customer.phone,
        ...shipping,

      },
    });

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully.",
      customer: updated,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This customer code already exists." },
        { status: 409 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 },
      );
    }

    console.error("Customer update failed:", error);

    return NextResponse.json(
      { error: "Unable to update customer." },
      { status: 500 },
    );
  }
}
