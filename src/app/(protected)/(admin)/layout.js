import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export default async function AdminLayout({ children }) {
  // STEP 1: Verify the user's authenticated session.
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/");
  }

  // STEP 2: Retrieve the user's role and status from PostgreSQL.
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  // STEP 3: Reject missing or inactive accounts.
  if (!user || user.status !== "Active") {
    redirect("/");
  }

  // STEP 4: Only Administrators may access these pages.
  if (user.role !== "Administrator") {
    redirect("/main-dashboard");
  }

  // STEP 5: Render the requested administrator page.
  return <>{children}</>;
}