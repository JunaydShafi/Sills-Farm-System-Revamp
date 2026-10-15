
import Link from "next/link";
import { History, ArrowLeft, Clock } from "lucide-react";
import FarmLayout from "../FarmLayout";

export default function ActivityHistoryPage() {
  return (
    <FarmLayout>
      {/* Main Activity History panel */}
      <section className="mx-auto w-full max-w-5xl rounded-lg border border-gray-300 bg-[#f8f9f6] p-5 shadow-lg">

        {/* Back button on left, Activity History centered */}
        <div className="relative mb-5 flex min-h-[52px] flex-col items-center justify-center gap-4 md:flex-row">

          {/* Back to Dashboard */}
          <Link
            href="/main-dashboard"
            className="flex items-center gap-2 rounded-md border border-gray-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-green-950 transition hover:bg-emerald-100 md:absolute md:left-0"
          >
            <ArrowLeft size={23} />
            Back To Dashboard
          </Link>

          {/* Centered page title */}
          <div className="flex items-center justify-center gap-4">
            <History size={39} className="shrink-0 text-green-950" />

            <div className="text-center">
              <h2 className="text-2xl font-bold text-black">
                Activity History
              </h2>

              <p className="text-xs font-semibold text-gray-700">
                View System Changes and User Activity
              </p>
            </div>
          </div>
        </div>

        {/* Activity log section */}
        <div className="rounded-md border border-gray-400 bg-white p-5">

          <h3 className="mb-3 text-xl font-bold text-green-950">
            System Activity Log
          </h3>

          <p className="text-sm text-gray-600">
            This page will display a history of actions
            performed by users within the Pleasant Grove Farms
            Business Management System.
          </p>

          {/* Empty activity state */}
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">

            <Clock
              size={48}
              className="mx-auto mb-4 text-emerald-700"
            />

            <p className="font-semibold text-gray-700">
              No activity records available.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Activity logging and database integration will
              be implemented in a future sprint.
            </p>
          </div>
        </div>

        {/* Sprint 1 notice */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Sprint 1 prototype — activity records not yet available
        </p>
      </section>
    </FarmLayout>
  );
}
