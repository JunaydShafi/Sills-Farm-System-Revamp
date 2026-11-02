import { getAuthenticatedUser } from "@/lib/authenticated-user";
import FarmHeader from "@/components/FarmHeader";
import FarmSidebar from "@/components/FarmSidebar";

export default async function ProtectedLayout({ children }) {
  const user = await getAuthenticatedUser();

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <FarmHeader user={user} />

      <div className="flex flex-1 flex-col md:flex-row">
        <FarmSidebar />

        <main className="min-w-0 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}