
import Link from "next/link";
import { History, ArrowLeft, Clock } from "lucide-react";

export default function ActivityHistoryPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Page header */}
      <header className="flex items-center justify-between bg-white px-8 py-5 shadow-sm">
        <div className="flex items-center gap-3">
          <History className="h-8 w-8 text-emerald-700" />

          <div>
            <h1 className="text-2xl font-bold text-green-950">
              Activity History
            </h1>
            <p className="text-sm text-gray-600">
              Pleasant Grove Farms
            </p>
          </div>
        </div>

        <Link
          href="/main-dashboard"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </header>

      {/* Page content */}
      <section className="mx-auto max-w-6xl px-8 py-10">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-green-950">
            System Activity Log
          </h2>

          <p className="text-gray-600">
            This page will display a history of actions performed
            by users within the Pleasant Grove Farms Business
            Management System.
          </p>

          <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <Clock
              size={48}
              className="mx-auto mb-4 text-emerald-700"
            />

            <p className="font-semibold text-gray-700">
              No activity records available.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Activity logging and database integration will be
              implemented in a future sprint.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
