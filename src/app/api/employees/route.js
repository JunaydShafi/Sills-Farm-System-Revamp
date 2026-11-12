import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { databaseErrorResponse, requireActiveUser } from "@/lib/apiAuth";
import { fromClientEmployee, toClientEmployee } from "@/lib/employeeRecords";

export const runtime = "nodejs";

const withPayrollCount = { _count: { select: { payroll_records: true } } };

// List every employee for the Employees and Pay Employees pages
export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;

    const rows = await prisma.employees.findMany({
      orderBy: { employee_code: "asc" },
      include: withPayrollCount,
    });

    return NextResponse.json({ employees: rows.map(toClientEmployee) });
  } catch (error) {
    return databaseErrorResponse(error, "Employee records");
  }
}

// Add a new employee (Add, then Update on the Employees page)
export async function POST(request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;

    const body = await request.json().catch(() => null);
    const { data, errors } = fromClientEmployee(body);

    if (errors) {
      return NextResponse.json(
        { error: "Please fix the highlighted fields.", errors },
        { status: 400 },
      );
    }

    const created = await prisma.employees.create({
      data,
      include: withPayrollCount,
    });

    return NextResponse.json(
      { employee: toClientEmployee(created) },
      { status: 201 },
    );
  } catch (error) {
    // P2002: unique constraint (the Employee ID is already used)
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error: "Please fix the highlighted fields.",
          errors: { employeeId: "This Employee ID is already in use." },
        },
        { status: 409 },
      );
    }

    return databaseErrorResponse(error, "Employee records");
  }
}
