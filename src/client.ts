import { PrismaClient } from "@prisma/client";
export const client = new PrismaClient({
  datasourceUrl:
    "postgresql://terence:terence@localhost:5432/testing?schema=public",
});
