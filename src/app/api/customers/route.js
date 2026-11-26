
import { NextResponse } from "next/server";
import { UsaStates } from "usa-states";
import { prisma } from "../../../lib/prisma";
import { getSessionUserId } from "../../../lib/session";

export const runtime = "nodejs";

// Use the same U.S. state codes as the customer form.
const validStateCodes = new Set(
  new UsaStates().states.map((state) => state.abbreviation),
);

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

// Validate customer information before saving to PostgreSQL.
function validateCustomer(body) {
  const errors = {};

  // Maximum field lengths match the PostgreSQL customer model.
  const required = {
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

    const { shipping, errors: shippingErrors } = validateShippingAddress({
      ...body,
      shipping_same_as_main: body.shipping_same_as_main ?? true,
    });

    Object.assign(errors, shippingErrors);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Please correct the highlighted fields.", errors },
        { status: 400 },
      );
    }

    // Generate the next Customer Code and create the customer.
    const created = await prisma.$transaction(async (tx) => {
      const [result] = await tx.$queryRaw`
        SELECT nextval('public.customer_code_seq'::regclass)::text AS code
      `;

      return tx.customers.create({
        data: {
          customer_code: result.code,
          name: customer.name,
          address: customer.address,
          city: customer.city,
          state: customer.state.toUpperCase(),
          zip: customer.zip,
          phone: customer.phone,
          status: customer.status,
          ...shipping,
        },
      });
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

// Retrieve customers with server-side search, filtering,
// sorting, and pagination.
export async function GET(request) {
  try {
    // Require an authenticated user.
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    // Confirm that the user is active and authorized.
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

    if (!["Administrator", "Employee"].includes(user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to view customers." },
        { status: 403 },
      );
    }

    // Read query parameters.
    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || "All";
    const sortField = searchParams.get("sortField") || "name";
    const sortDirection = searchParams.get("sortDirection") || "asc";

    // Validate pagination parameters before querying the database.
    const pageValue = searchParams.get("page") || "1";
    const pageSizeValue = searchParams.get("pageSize") || "5";

    if (!/^[1-9]\d*$/.test(pageValue) || !/^[1-9]\d*$/.test(pageSizeValue)) {
      return NextResponse.json(
        { error: "Invalid pagination parameters." },
        { status: 400 },
      );
    }

    const page = Number(pageValue);
    const pageSize = Number(pageSizeValue);

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(pageSize) ||
      pageSize > 100
    ) {
      return NextResponse.json(
        { error: "Invalid pagination parameters." },
        { status: 400 },
      );
    }

    if (search.length > 150) {
      return NextResponse.json(
        { error: "Search text is too long." },
        { status: 400 },
      );
    }

    if (!["All", "Active", "Inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid customer status filter." },
        { status: 400 },
      );
    }

    // Only allow sorting by supported database columns.
    const sortFields = {
      code: "customer_code",
      name: "name",
      status: "status",
    };

    if (
      !Object.hasOwn(sortFields, sortField) ||
      !["asc", "desc"].includes(sortDirection)
    ) {
      return NextResponse.json(
        { error: "Invalid sorting parameters." },
        { status: 400 },
      );
    }

    // Apply search and status filtering in PostgreSQL.
    const where = {
      ...(search && {
        OR: [
          {
            customer_code: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
      ...(status !== "All" && { status }),
    };

    const skip = (page - 1) * pageSize;

    if (!Number.isSafeInteger(skip)) {
      return NextResponse.json(
        { error: "Invalid page number." },
        { status: 400 },
      );
    }

    // Retrieve only the requested records and total matching count.
    let customers;
    let total;

    if (sortField === "code") {
      // Sort numeric Customer Codes correctly before applying pagination.
      const searchPattern = `%${search}%`;

      [customers, total] = await prisma.$transaction([
        prisma.$queryRaw`
          SELECT
            id,
            customer_code,
            name,
            address,
            city,
            state,
            zip,
            phone,
            status,
            created_at,
            shipping_same_as_main,
            shipping_address,
            shipping_city,
            shipping_state,
            shipping_zip
          FROM public.customers
          WHERE (
            ${search} = ''
            OR customer_code ILIKE ${searchPattern}
            OR name ILIKE ${searchPattern}
          )
          AND (${status} = 'All' OR status = ${status})
          ORDER BY
            CASE WHEN ${sortDirection} = 'asc'
              THEN customer_code::numeric END ASC,
            CASE WHEN ${sortDirection} = 'desc'
              THEN customer_code::numeric END DESC,
            id ASC
          LIMIT ${pageSize}
          OFFSET ${skip}
        `,
        prisma.customers.count({ where }),
      ]);
    } else {
      // Keep existing Customer Name and Status sorting unchanged.
      [customers, total] = await prisma.$transaction([
        prisma.customers.findMany({
          where,
          select: {
            id: true,
            customer_code: true,
            name: true,
            address: true,
            city: true,
            state: true,
            zip: true,
            phone: true,
            status: true,
            created_at: true,
            shipping_same_as_main: true,
            shipping_address: true,
            shipping_city: true,
            shipping_state: true,
            shipping_zip: true,
          },
          orderBy: [
            { [sortFields[sortField]]: sortDirection },
            { id: "asc" },
          ],
          skip,
          take: pageSize,
        }),
        prisma.customers.count({ where }),
      ]);
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Return the current page and pagination information.
    return NextResponse.json(
      {
        customers,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Customer retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve customers." },
      { status: 500 },
    );
  }
}
