import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const deleteEveryThing = async () => {};

async function main() {
  if (process.env.NODE_ENV !== "development") return;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
