import { auth } from "@/lib";
import { prisma } from "@/lib/prisma";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

// Helper function to generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const products = {
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

        const products = await prisma.product.findMany({
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return {
          success: true,
          data: products,
        };
      } catch (error) {
        console.error("Error fetching products:", error);
        return {
          success: false,
          error: "Failed to fetch products",
        };
      }
    },
  }),

  create: defineAction({
    accept: "json",
    input: z.object({
      name: z
        .string()
        .min(1, "Product name is required")
        .max(200, "Name too long"),
      price: z.number().positive("Price must be positive"),
      weight: z.number().optional(),
      stock: z.number().int().min(0, "Stock cannot be negative").optional(),
      badge: z
        .enum(["BESTSELLER", "NEW", "LIMITED", "SEASONAL", "FEATURED"])
        .optional(),
      description: z.string().optional(),
      details: z.array(z.string()).default([]),
      categoryId: z.string().min(1, "Category is required"),
      images: z.array(z.string()).default([]), // Cloudinary URLs from client upload
    }),
    handler: async (input, context) => {
      try {
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        const slug = generateSlug(input.name);

        // Check if product slug already exists
        const existingProduct = await prisma.product.findUnique({
          where: { slug },
        });

        if (existingProduct) {
          return {
            success: false,
            error: "Product with this name already exists",
          };
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
          where: { id: input.categoryId },
        });

        if (!category) {
          return {
            success: false,
            error: "Category not found",
          };
        }

        // Create product with Cloudinary URLs
        const product = await prisma.product.create({
          data: {
            name: input.name.trim(),
            slug,
            price: input.price,
            weight: input.weight,
            stock: input.stock,
            badge: input.badge,
            description: input.description?.trim(),
            details: input.details,
            images: input.images, // Already uploaded to Cloudinary
            categoryId: input.categoryId,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        });

        return {
          success: true,
          data: product,
        };
      } catch (error) {
        console.error("Error creating product:", error);
        return {
          success: false,
          error: "Failed to create product",
        };
      }
    },
  }),

  update: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(),
      name: z
        .string()
        .min(1, "Product name is required")
        .max(200, "Name too long"),
      price: z.number().positive("Price must be positive"),
      weight: z.number().optional(),
      stock: z.number().int().min(0, "Stock cannot be negative").optional(),
      badge: z
        .enum(["BESTSELLER", "NEW", "LIMITED", "SEASONAL", "FEATURED"])
        .optional(),
      description: z.string().optional(),
      details: z.array(z.string()).default([]),
      categoryId: z.string().min(1, "Category is required"),
      images: z.array(z.string()).default([]), // Cloudinary URLs
    }),
    handler: async (input, context) => {
      try {
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
          where: { id: input.id },
        });

        if (!existingProduct) {
          return {
            success: false,
            error: "Product not found",
          };
        }

        const slug = generateSlug(input.name);

        // Check if another product has the same slug
        const duplicateProduct = await prisma.product.findFirst({
          where: {
            AND: [{ id: { not: input.id } }, { slug }],
          },
        });

        if (duplicateProduct) {
          return {
            success: false,
            error: "Product with this name already exists",
          };
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
          where: { id: input.categoryId },
        });

        if (!category) {
          return {
            success: false,
            error: "Category not found",
          };
        }

        // Update product
        const updatedProduct = await prisma.product.update({
          where: { id: input.id },
          data: {
            name: input.name.trim(),
            slug,
            price: input.price,
            weight: input.weight,
            stock: input.stock,
            badge: input.badge,
            description: input.description?.trim(),
            details: input.details,
            images: input.images, // Cloudinary URLs managed by client
            categoryId: input.categoryId,
          },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        });

        return {
          success: true,
          data: updatedProduct,
        };
      } catch (error) {
        console.error("Error updating product:", error);
        return {
          success: false,
          error: "Failed to update product",
        };
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
        const authCheck = await auth.authenticateUser(context, "ADMIN");

        if (!authCheck.success) {
          return {
            success: false,
            message: authCheck.data?.message,
            error: authCheck.error,
          };
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
          where: { id },
        });

        if (!product) {
          return {
            success: false,
            error: "Product not found",
          };
        }

        // Delete product from database
        // Note: Image cleanup is now handled by client-side management
        await prisma.product.delete({
          where: { id },
        });

        return { success: true };
      } catch (error) {
        console.error("Error deleting product:", error);
        return {
          success: false,
          error: "Failed to delete product",
        };
      }
    },
  }),
};
