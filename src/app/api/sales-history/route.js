import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { databaseErrorResponse, requireActiveUser, toDateString } from "@/lib/apiAuth";

export const runtime = "nodejs";

// Sales recorded in bag_sales, with product, process, and bag size.
// Order #, Type, Customer, Price, and Total come from the orders and invoices
// tables, which don't exist yet, so they are returned empty for now.
export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;

    const sales = await prisma.bag_sales.findMany({
      orderBy: [{ sale_date: "desc" }, { id: "desc" }],
      include: {
        bag_inventory_items: {
          include: {
            processes: { select: { process_number: true } },
            sale_items: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      sales: sales.map((sale) => {
        const item = sale.bag_inventory_items;
        return {
          id: sale.id,
          orderDate: toDateString(sale.sale_date),
          orderNo: null,
          type: null,
          description: item.sale_items.name,
          proc: item.processes.process_number,
          customer: null,
          factor: item.factor_lbs,
          quantity: sale.units_sold,
          lbs: sale.units_sold * item.factor_lbs,
          price: null,
          total: null,
        };
      }),
    });
  } catch (error) {
    return databaseErrorResponse(error, "Sales history");
  }
}
