import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const username = "testadmin";
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must contain at least 12 characters."
    );
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const existingUser = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUser) {
      console.log("Test administrator already exists. No changes made.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.users.create({
      data: {
        name: "Test Administrator",
        username: username,
        password_hash: passwordHash,
        role: "Administrator",
        status: "Active",
      },
    });

    console.log("Test administrator created successfully!");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to create test administrator:", error);
  process.exitCode = 1;
});