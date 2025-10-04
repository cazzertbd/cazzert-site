import { auth } from "@/lib";
import { prisma } from "@/lib/prisma";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

// Helper function to generate slug
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

export const categories = {
  getAll: defineAction({
    accept: "json",
    handler: async (_input, context) => {
      try {
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        // Get all categories with product count
        const categories = await prisma.category.findMany({
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return {
          success: true,
          data: categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            productCount: category._count.products,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          })),
        };
      } catch (error) {
        console.error("Error fetching categories:", error);
        return { success: false, error: "Failed to fetch categories" };
      }
    },
  }),

  create: defineAction({
    accept: "form",
    input: z.object({
      name: z
        .string()
        .min(1, "Category name is required")
        .max(100, "Name too long"),
    }),
    handler: async ({ name }, context) => {
      try {
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        // Generate slug
        const slug = generateSlug(name);

        // Check if category name or slug already exists
        const existingCategory = await prisma.category.findFirst({
          where: {
            OR: [{ name: { equals: name, mode: "insensitive" } }, { slug }],
          },
        });

        if (existingCategory) {
          return {
            success: false,
            error:
              existingCategory.name.toLowerCase() === name.toLowerCase()
                ? "Category name already exists"
                : "Category slug already exists",
          };
        }

        // Create category
        const category = await prisma.category.create({
          data: {
            name: name.trim(),
            slug,
          },
        });

        return {
          success: true,
          data: {
            id: category.id,
            name: category.name,
            slug: category.slug,
            productCount: 0,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          },
        };
      } catch (error) {
        console.error("Error creating category:", error);
        return { success: false, error: "Failed to create category" };
      }
    },
  }),

  update: defineAction({
    accept: "form",
    input: z.object({
      id: z.string(),
      name: z
        .string()
        .min(1, "Category name is required")
        .max(100, "Name too long"),
    }),
    handler: async ({ id, name }, context) => {
      try {
        // Validate admin
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
          where: { id },
        });

        if (!existingCategory) {
          return { success: false, error: "Category not found" };
        }

        // Generate new slug
        const slug = generateSlug(name);

        // Check if another category has the same name or slug
        const duplicateCategory = await prisma.category.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [{ name: { equals: name, mode: "insensitive" } }, { slug }],
              },
            ],
          },
        });

        if (duplicateCategory) {
          return {
            success: false,
            error:
              duplicateCategory.name.toLowerCase() === name.toLowerCase()
                ? "Category name already exists"
                : "Category slug already exists",
          };
        }

        // Update category
        const updatedCategory = await prisma.category.update({
          where: { id },
          data: {
            name: name.trim(),
            slug,
          },
          include: {
            _count: {
              select: { products: true },
            },
          },
        });

        return {
          success: true,
          data: {
            id: updatedCategory.id,
            name: updatedCategory.name,
            slug: updatedCategory.slug,
            productCount: updatedCategory._count.products,
            createdAt: updatedCategory.createdAt,
            updatedAt: updatedCategory.updatedAt,
          },
        };
      } catch (error) {
        console.error("Error updating category:", error);
        return { success: false, error: "Failed to update category" };
      }
    },
  }),

  delete: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
    }),
    handler: async ({ id }, context) => {
      try {
        // Validate admin
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        // Check if category exists and has products
        const category = await prisma.category.findUnique({
          where: { id },
          include: {
            _count: {
              select: { products: true },
            },
          },
        });

        if (!category) {
          return { success: false, error: "Category not found" };
        }

        if (category._count.products > 0) {
          return {
            success: false,
            error: `Cannot delete category. It contains ${category._count.products} product(s). Please move or delete all products first.`,
          };
        }

        // Delete category
        await prisma.category.delete({
          where: { id },
        });

        return { success: true };
      } catch (error) {
        console.error("Error deleting category:", error);
        return { success: false, error: "Failed to delete category" };
      }
    },
  }),
};
