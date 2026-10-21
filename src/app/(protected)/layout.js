
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export default async function ProtectedLayout({ children }) {
  // STEP 1: Check whether the visitor has a valid session.
  const userId = await getSessionUserId();

  // No session means the visitor must log in.
  if (!userId) {
    redirect("/");
  }

  // STEP 2: Check the account in PostgreSQL.
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  // STEP 3: Reject deleted or inactive accounts.
  if (!user || user.status !== "Active") {
    redirect("/");
  }

  // STEP 4: Display the requested page.
  return <>{children}</>;
}
