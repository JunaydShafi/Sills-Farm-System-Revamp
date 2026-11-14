import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  databaseErrorResponse,
  fromDateString,
  isDateString,
  requireActiveUser,
  toDateString,
} from "@/lib/apiAuth";
import { calculatePay, earningTypes, isValidHours } from "@/lib/payCalc";

export const runtime = "nodejs";

const money = (decimal) => Number(decimal.toString());

function toClientPayroll(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeCode: row.employees.employee_code,
    name: row.employees.name,
    checkNumber: row.check_number ?? "",
    payDate: toDateString(row.pay_date),
    periodStart: toDateString(row.period_start),
    periodEnd: toDateString(row.period_end),
    payRate: money(row.pay_rate),
    hours: {
      Regular: money(row.regular_hours),
      Overtime: money(row.overtime_hours),
      Holiday: money(row.holiday_hours),
    },
    amounts: {
      Regular: money(row.regular_amount),
      Overtime: money(row.overtime_amount),
      Holiday: money(row.holiday_amount),
    },
    gross: money(row.gross_pay),
    fica: money(row.fica),
    med: money(row.medicare),
    fed: money(row.federal_tax),
    sdi: money(row.state_disability),
    childSup: money(row.child_support),
    netPay: money(row.net_pay),
  };
}

const withEmployee = { employees: { select: { employee_code: true, name: true } } };

// Saved payroll records for the Payroll and Earnings pages (newest first)
export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;

    const rows = await prisma.payroll_records.findMany({
      orderBy: [{ pay_date: "desc" }, { id: "desc" }],
      include: withEmployee,
    });

    return NextResponse.json({ records: rows.map(toClientPayroll) });
  } catch (error) {
    return databaseErrorResponse(error, "Payroll records");
  }
}

// Save a completed pay entry from the Pay Employees page
export async function POST(request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;

    const body = (await request.json().catch(() => null)) ?? {};
    const errors = {};

    const hours = {};
    for (const type of earningTypes) {
      const value = String(body.hours?.[type] ?? "").trim();
      if (!isValidHours(value)) {
        errors.hours = "Hours must be 0 to 999.99 with up to two decimals.";
      }
      hours[type] = value;
    }

    if (!errors.hours && earningTypes.every((type) => !(Number(hours[type]) > 0))) {
      errors.hours = "Enter hours for at least one earning type.";
    }

    for (const key of ["beginDate", "endDate", "payDate"]) {
      if (!isDateString(body[key])) {
        errors[key] = "Required.";
      }
    }

    if (!errors.beginDate && !errors.endDate && body.endDate < body.beginDate) {
      errors.endDate = "End cannot be before Begin.";
    }

    const employeeId = Number(body.employeeId);
    const employee = Number.isInteger(employeeId)
      ? await prisma.employees.findUnique({ where: { id: employeeId } })
      : null;

    if (!employee) {
      errors.employee = "Select an employee.";
    } else if (employee.active !== "Active") {
      errors.employee = `${employee.name} is inactive and can't be paid.`;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: Object.values(errors)[0], errors },
        { status: 400 },
      );
    }

    // Warn before paying the same employee twice for the same period
    if (!body.confirmDuplicate) {
      const existing = await prisma.payroll_records.findFirst({
        where: {
          employee_id: employee.id,
          period_start: fromDateString(body.beginDate),
          period_end: fromDateString(body.endDate),
        },
        select: { id: true },
      });

      // Returned as a normal response (not an error) so the page can ask the
      // user to confirm; nothing is saved until they do.
      if (existing) {
        return NextResponse.json({
          duplicate: true,
          error: `${employee.name} already has a payment saved for this pay period.`,
        });
      }
    }

    // Recalculate on the server with the employee's saved pay rate
    const { lines, grossCents } = calculatePay(hours, employee.pay_rate.toString());
    const byType = Object.fromEntries(lines.map((line) => [line.type, line]));
    const dollars = (cents) => (cents / 100).toFixed(2);

    const created = await prisma.payroll_records.create({
      data: {
        employee_id: employee.id,
        pay_date: fromDateString(body.payDate),
        period_start: fromDateString(body.beginDate),
        period_end: fromDateString(body.endDate),
        pay_rate: employee.pay_rate,
        regular_hours: byType.Regular.hours.toFixed(2),
        overtime_hours: byType.Overtime.hours.toFixed(2),
        holiday_hours: byType.Holiday.hours.toFixed(2),
        regular_amount: dollars(byType.Regular.cents),
        overtime_amount: dollars(byType.Overtime.cents),
        holiday_amount: dollars(byType.Holiday.cents),
        gross_pay: dollars(grossCents),
        // Taxes and deductions are 0 until payroll tax calculations are added
        net_pay: dollars(grossCents),
        created_by: auth.userId,
      },
      include: withEmployee,
    });

    return NextResponse.json(
      { record: toClientPayroll(created) },
      { status: 201 },
    );
  } catch (error) {
    return databaseErrorResponse(error, "Payroll records");
  }
}
