
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      status: true,
    },
  });

  if (!user || user.status !== "Active") {
    redirect("/");
  }

  return user;
}
