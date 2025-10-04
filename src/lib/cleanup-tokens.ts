import { prisma } from "@/lib/prisma";

export async function cleanupExpiredTokens() {
  try {
    const deletedTokens = await prisma.refreshToken.deleteMany({
      where: {
        expires: { lt: new Date() },
      },
    });

    console.log(`Cleaned up ${deletedTokens.count} expired refresh tokens`);
    return deletedTokens.count;
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
    throw error;
  }
}
