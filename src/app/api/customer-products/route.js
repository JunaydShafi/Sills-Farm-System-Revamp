import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveUser, databaseErrorResponse } from "@/lib/apiAuth";

export const runtime = "nodejs";

// Retrieve distinct customer products from existing orders.
export async function GET(request) {
  try {
    // Require an active, authenticated user.
    const auth = await requireActiveUser();

    if (auth.response) {
      return auth.response;
    }

    // Use the same role restrictions as the Customers API.
    const user = await prisma.users.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (!user || !["Administrator", "Employee"].includes(user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to view customer products." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);

    const customer = (searchParams.get("customer") || "").trim() || null;
    const product = (searchParams.get("product") || "").trim() || null;
    const sizeValue = searchParams.get("size") || "";

    const pageValue = searchParams.get("page") || "1";
    const pageSizeValue = searchParams.get("pageSize") || "5";

    // Validate pagination and filters.
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
      pageSize > 100 ||
      (customer && customer.length > 150) ||
      (product && product.length > 255)
    ) {
      return NextResponse.json(
        { error: "Invalid filter or pagination parameters." },
        { status: 400 },
      );
    }

    if (sizeValue && !/^[1-9]\d*$/.test(sizeValue)) {
      return NextResponse.json(
        { error: "Invalid product size." },
        { status: 400 },
      );
    }

    const size = sizeValue ? Number(sizeValue) : null;

    if (size !== null && (!Number.isSafeInteger(size) || size > 2147483647)) {
      return NextResponse.json(
        { error: "Invalid product size." },
        { status: 400 },
      );
    }

    const skip = (page - 1) * pageSize;

    if (!Number.isSafeInteger(skip)) {
      return NextResponse.json(
        { error: "Invalid page number." },
        { status: 400 },
      );
    }

    // Read the order-item records and remove repeated combinations.
    // Parameterized queries protect against SQL injection.
    const [records, counts] = await prisma.$transaction([
      prisma.$queryRaw`
        SELECT DISTINCT
          c.id AS customer_id,
          c.name AS customer,
          oi.description AS product,
          oi.size_lbs
        FROM public.order_items AS oi
        INNER JOIN public.orders AS o
          ON o.id = oi.order_id
        INNER JOIN public.customers AS c
          ON c.id = o.customer_id
        WHERE oi.item_type::text = 'Product'
          AND (${customer}::text IS NULL OR c.name = ${customer})
          AND (${product}::text IS NULL OR oi.description = ${product})
          AND (${size}::integer IS NULL OR oi.size_lbs = ${size})
        ORDER BY customer, product, size_lbs NULLS LAST, customer_id
        LIMIT ${pageSize}
        OFFSET ${skip}
      `,
      prisma.$queryRaw`
        SELECT COUNT(*)::integer AS total
        FROM (
          SELECT DISTINCT
            c.id,
            oi.description,
            oi.size_lbs
          FROM public.order_items AS oi
          INNER JOIN public.orders AS o
            ON o.id = oi.order_id
          INNER JOIN public.customers AS c
            ON c.id = o.customer_id
          WHERE oi.item_type::text = 'Product'
            AND (${customer}::text IS NULL OR c.name = ${customer})
            AND (${product}::text IS NULL OR oi.description = ${product})
            AND (${size}::integer IS NULL OR oi.size_lbs = ${size})
        ) AS matching_products
      `,
    ]);

    const total = counts[0]?.total ?? 0;

    const products = records.map((record) => ({
      id: `${record.customer_id}-${record.product}-${record.size_lbs ?? "unknown"}`,
      customer: record.customer,
      product: record.product,
      size: record.size_lbs === null ? "—" : `${record.size_lbs}LB`,
      sizeLbs: record.size_lbs,
    }));

    // Retrieve all available dropdown values from saved customer orders.
    // These queries are not restricted to the current page.
    const [customerRows, productRows, sizeRows] = await Promise.all([
      prisma.$queryRaw`
        SELECT DISTINCT c.name
        FROM public.customers AS c
        INNER JOIN public.orders AS o ON o.customer_id = c.id
        INNER JOIN public.order_items AS oi ON oi.order_id = o.id
        WHERE oi.item_type::text = 'Product'
        ORDER BY c.name
      `,
      prisma.$queryRaw`
        SELECT DISTINCT oi.description
        FROM public.order_items AS oi
        WHERE oi.item_type::text = 'Product'
        ORDER BY oi.description
      `,
      prisma.$queryRaw`
        SELECT DISTINCT oi.size_lbs
        FROM public.order_items AS oi
        WHERE oi.item_type::text = 'Product'
          AND oi.size_lbs IS NOT NULL
        ORDER BY oi.size_lbs
      `,
    ]);

    const options = {
      customers: customerRows.map((row) => row.name),
      products: productRows.map((row) => row.description),
      sizes: sizeRows.map((row) => row.size_lbs),
    };

    return NextResponse.json(
      {
        products,
        options,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    return databaseErrorResponse(error, "Customer products");
  }
}
