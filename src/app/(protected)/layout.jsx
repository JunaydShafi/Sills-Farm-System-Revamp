import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { getAuthenticatedUser } from "@/lib/authenticated-user";

import FarmHeader from "@/components/FarmHeader";
import FarmSidebar from "@/components/FarmSidebar";

export default async function ProtectedLayout({ children }) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/");
  }

  const account = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!account || account.status !== "Active") {
    redirect("/");
  }

  const user = await getAuthenticatedUser();

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <FarmHeader user={user} />

      <div className="flex flex-1 flex-col md:flex-row">
        <FarmSidebar />

        <main className="min-w-0 flex-1 p-0">
          {children}
        </main>
      </div>
    </div>
  );
}