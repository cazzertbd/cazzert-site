import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/vercel-client";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// Type definitions
export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image?: string | null;
};

export type JWTPayload = {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
};

// Auth utility functions
export const auth = {
  // Create JWT token
  createAccessToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      } as JWTPayload,
      import.meta.env.AUTH_SECRET,
      { expiresIn: "1d" },
    );
  },

  // Verify and decode JWT token
  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, import.meta.env.AUTH_SECRET) as JWTPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  },

  // Hash a token using SHA-256
  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  },

  // Create refresh token
  async createRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString("hex");
    const hashedToken = this.hashToken(token);

    // Store in database
    await prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: userId,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return token;
  },

  // Use refresh token to get new access token
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      // Hash the token to compare with stored hash
      const hashedToken = this.hashToken(refreshToken);

      // Find token in database and delete it
      const result = await prisma.$transaction(async (tx) => {
        // Find the token with user data
        const storedToken = await tx.refreshToken.findFirst({
          where: {
            token: hashedToken,
            expires: { gt: new Date() },
          },
          include: { user: true },
        });

        if (!storedToken) {
          return null; // No valid token found
        }

        // Delete the token
        await tx.refreshToken.delete({
          where: { id: storedToken.id },
        });

        return storedToken; // Return the found token with user data
      });

      if (!result) {
        return null; // No valid token found
      }

      // Issue new tokens
      const newAccessToken = this.createAccessToken(result.user as AuthUser);
      const newRefreshToken = await this.createRefreshToken(result.user.id);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  },
  async authenticateUser(ctx: any, requiredRole?: UserRole) {
    // Get access token from cookies
    const accessToken = ctx.cookies.get("access-token")?.value;

    if (!accessToken) {
      return {
        success: false,
        data: {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        error: {
          type: "AuthError",
          status: 401,
        },
      };
    }

    // Verify token
    const payload = this.verifyToken(accessToken);
    if (!payload?.id) {
      return {
        success: false,
        data: {
          success: false,
          message: "Invalid authentication token.",
        },
        error: {
          type: "AuthError",
          status: 401,
        },
      };
    }

    // Get user from database to ensure they still exist and have correct permissions
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });

    if (!user) {
      return {
        success: false,
        data: {
          success: false,
          message: "User not found.",
        },
        error: {
          type: "AuthError",
          status: 401,
        },
      };
    }

    // If a specific role is required, check for it
    if (requiredRole && user.role !== requiredRole && user.role !== "ADMIN") {
      return {
        success: false,
        data: {
          success: false,
          message: "You don't have permission to perform this action.",
        },
        error: {
          type: "AuthError",
          status: 403,
        },
      };
    }

    // Authentication successful
    return {
      success: true,
      user,
    };
  },
};
