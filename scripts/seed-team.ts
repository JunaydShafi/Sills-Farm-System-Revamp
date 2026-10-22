import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD;
  const connectionString = process.env.DATABASE_URL;

  if (!password || password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters.");
  }

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing.");
  }

  const users = [
    { name: "Junayd Shafi", username: "junaydshafi", role: "Administrator" },
    { name: "Peter Krieg", username: "peterkrieg", role: "Administrator" },
    { name: "Raymond Vieyra", username: "raymondvieyra", role: "Employee" },
    { name: "Arraiz Pervez", username: "arraizpervez", role: "Administrator" },
    { name: "Christian Reyes", username: "christianreyes", role: "Administrator" },
    { name: "Derrick Lyerly", username: "derricklyerly", role: "Administrator" },
  ];

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const user of users) {
      const existing = await prisma.users.findUnique({
        where: { username: user.username },
      });

      if (existing) {
        console.log(`${user.username}: already exists, skipped.`);
        continue;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.users.create({
        data: {
          name: user.name,
          username: user.username,
          password_hash: passwordHash,
          role: user.role,
          status: "Active",
        },
      });

      console.log(`${user.username}: created.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to seed team accounts:", error);
  process.exitCode = 1;
});