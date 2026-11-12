import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { databaseErrorResponse, requireActiveUser } from "@/lib/apiAuth";
import { fromClientEmployee, toClientEmployee } from "@/lib/employeeRecords";

export const runtime = "nodejs";

const withPayrollCount = { _count: { select: { payroll_records: true } } };

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const notFound = () =>
  NextResponse.json(
    { error: "This employee no longer exists. Refresh the page to see the current list." },
    { status: 404 },
  );

// Save changes to an existing employee (Update on the Employees page)
export async function PUT(request, { params }) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;

    const id = parseId((await params).id);
    if (!id) return notFound();

    const body = await request.json().catch(() => null);
    const { data, errors } = fromClientEmployee(body);

    if (errors) {
      return NextResponse.json(
        { error: "Please fix the highlighted fields.", errors },
        { status: 400 },
      );
    }

    const existing = await prisma.employees.findUnique({ where: { id } });
    if (!existing) return notFound();

    const updated = await prisma.employees.update({
      where: { id },
      data,
      include: withPayrollCount,
    });

    return NextResponse.json({ employee: toClientEmployee(updated) });
  } catch (error) {
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

// Delete an employee. Employees with payroll history are set to Inactive
// instead, so their pay records are kept.
export async function DELETE(_request, { params }) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;

    const id = parseId((await params).id);
    if (!id) return notFound();

    const existing = await prisma.employees.findUnique({
      where: { id },
      include: withPayrollCount,
    });
    if (!existing) return notFound();

    if (existing._count.payroll_records > 0) {
      const deactivated = await prisma.employees.update({
        where: { id },
        data: { active: "Inactive", status: "Inactive" },
        include: withPayrollCount,
      });

      return NextResponse.json({
        result: "deactivated",
        employee: toClientEmployee(deactivated),
      });
    }

    await prisma.employees.delete({ where: { id } });

    return NextResponse.json({ result: "deleted" });
  } catch (error) {
    // P2003: a payroll record was added for this employee in the meantime
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "This employee now has payroll history and can't be deleted. Refresh and try again." },
        { status: 409 },
      );
    }

    return databaseErrorResponse(error, "Employee records");
  }
}
