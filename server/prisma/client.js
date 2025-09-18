import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
export const prisma =globalForPrisma.prisma ?? new PrismaClient();