import { auth, prisma } from "@/lib";
import { UserRole } from "@prisma/vercel-client";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

// Validation schema for changing user role
const ChangeRoleSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  role: z.enum([UserRole.USER, UserRole.ADMIN], {
    message: "Role must be either USER or ADMIN",
  }),
});

function getInputErrorMessage(result: any) {
  const { issues } = result.error;
  const fields = result.error.flatten().fieldErrors;
  const firstMsg = issues[0]?.message ?? "Invalid input";

  return {
    data: {
      success: false,
      message: firstMsg,
    },
    error: {
      type: "AstroActionInputError",
      issues,
      fields,
    },
  };
}

export const adminUsers = {
  // Remove a user account (admin cannot remove own account)
  remove: defineAction({
    async handler(data, ctx) {
      // Verify admin permissions
      const authCheck = await auth.authenticateUser(ctx, "ADMIN");
      if (!authCheck.success) {
        return {
          data: authCheck.data,
          error: authCheck.error,
        };
      }

      try {
        const { userId } = data;

        if (!userId) {
          return {
            data: {
              success: false,
              message: "User ID is required",
            },
            error: {
              type: "ValidationError",
              message: "User ID is required",
            },
          };
        }

        // Prevent admins from removing their own account
        if (userId === authCheck.user?.id) {
          return {
            data: {
              success: false,
              message: "You cannot remove your own account",
            },
            error: {
              type: "ValidationError",
              message: "Cannot remove own account",
            },
          };
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return {
            data: {
              success: false,
              message: "User not found",
            },
            error: {
              type: "NotFoundError",
              message: "User not found",
            },
          };
        }

        // Delete the user (cascade will handle refresh tokens)
        await prisma.user.delete({
          where: { id: userId },
        });

        return {
          data: {
            success: true,
            message: "User deleted successfully",
          },
          error: null,
        };
      } catch (error) {
        console.error("Error removing user:", error);
        return {
          data: {
            success: false,
            message: "Failed to remove user",
          },
          error: {
            type: "ServerError",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  }),

  // Change user role (admin cannot change own role)
  changeRole: defineAction({
    accept: "form",
    async handler(formData, ctx) {
      // Verify admin permissions
      const authCheck = await auth.authenticateUser(ctx, "ADMIN");
      if (!authCheck.success) {
        return {
          data: authCheck.data,
          error: authCheck.error,
        };
      }

      try {
        const raw = Object.fromEntries(formData.entries());

        // Parse validation
        const result = ChangeRoleSchema.safeParse({
          userId: raw.userId,
          role: raw.role,
        });

        if (!result.success) {
          return getInputErrorMessage(result);
        }

        const { userId, role } = result.data;

        // Prevent admins from changing their own role
        if (userId === authCheck.user?.id) {
          return {
            data: {
              success: false,
              message: "You cannot change your own role",
            },
            error: {
              type: "ValidationError",
              message: "Cannot change own role",
            },
          };
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return {
            data: {
              success: false,
              message: "User not found",
            },
            error: {
              type: "NotFoundError",
              message: "User not found",
            },
          };
        }

        // Update user role
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        return {
          data: {
            success: true,
            message: `User role changed to ${role} successfully`,
            user: updatedUser,
          },
          error: null,
        };
      } catch (error) {
        console.error("Error changing user role:", error);
        return {
          data: {
            success: false,
            message: "Failed to change user role",
          },
          error: {
            type: "ServerError",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  }),

  // Get all users (for admin panel)
  getAll: defineAction({
    async handler(_, ctx) {
      // Verify admin permissions
      const authCheck = await auth.authenticateUser(ctx, "ADMIN");
      if (!authCheck.success) {
        return {
          data: authCheck.data,
          error: authCheck.error,
        };
      }

      try {
        // Get all users with limited fields for security
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return {
          data: {
            success: true,
            users,
          },
          error: null,
        };
      } catch (error) {
        console.error("Error fetching users:", error);
        return {
          data: {
            success: false,
            message: "Failed to fetch users",
          },
          error: {
            type: "ServerError",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  }),
};
