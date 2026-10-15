
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import FarmLayout from "../FarmLayout";

const reports = [
  {
    label: "1099 Form",
    href: "/federal-reporting/1099",
  },
  {
    label: "W-2 Form",
    href: "/federal-reporting/w2",
  },
  {
    label: "940 Form",
    href: "/federal-reporting/940",
  },
  {
    label: "943 Form",
    href: "/federal-reporting/943",
  },
];

export default function FederalReportingPage() {
  return (
    <FarmLayout>
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col rounded-lg border border-gray-300 bg-[#f8f9f6] p-5 shadow-lg">
        <div>
          <Link
            href="/main-dashboard"
            className="inline-flex items-center gap-2 rounded-md border border-gray-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-green-950 transition hover:bg-emerald-100"
          >
            <ArrowLeft size={23} />
            Back To Dashboard
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="grid w-full max-w-[480px] grid-cols-1 gap-6 sm:grid-cols-2">
            {reports.map((report) => (
              <Link
                key={report.href}
                href={report.href}
                className="flex min-h-20 items-center justify-center gap-3 rounded-md border border-gray-500 bg-emerald-50 px-4 py-3 font-semibold text-black shadow-sm transition hover:bg-emerald-100"
              >
                <FileText
                  size={30}
                  className="shrink-0 text-green-900"
                />
                {report.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </FarmLayout>
  );
}
