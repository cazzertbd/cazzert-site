import { prisma } from "@/lib/prisma";
import type { APIRoute } from "astro";

interface SearchParams {
  query?: string;
  categoryId?: string;
  badge?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URLSearchParams(url.search);

    const params: SearchParams = {
      query: searchParams.get("query") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      badge: searchParams.get("badge") || undefined,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined,
      inStock: searchParams.get("inStock")
        ? searchParams.get("inStock") === "true"
        : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 12,
      sortBy: (searchParams.get("sortBy") as any) || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    };

    // Build where clause
    const where: any = {};

    // Text search
    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: "insensitive" } },
        { description: { contains: params.query, mode: "insensitive" } },
        { details: { hasSome: [params.query] } },
      ];
    }

    // Category filter
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    // Badge filter
    if (params.badge) {
      where.badge = params.badge;
    }

    // Price range filter
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) where.price.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
    }

    // Stock filter
    if (params.inStock !== undefined) {
      if (params.inStock) {
        where.stock = { gt: 0 };
      } else {
        where.OR = [{ stock: { lte: 0 } }, { stock: null }];
      }
    }

    // Calculate pagination
    const skip = (params.page! - 1) * params.limit!;

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: {
        [params.sortBy!]: params.sortOrder,
      },
      skip,
      take: params.limit,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / params.limit!);
    const hasNextPage = params.page! < totalPages;
    const hasPreviousPage = params.page! > 1;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          products: products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            weight: product.weight,
            stock: product.stock,
            badge: product.badge,
            description: product.description,
            details: product.details,
            images: product.images,
            category: product.category,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          })),
          pagination: {
            currentPage: params.page,
            totalPages,
            totalCount,
            hasNextPage,
            hasPreviousPage,
            limit: params.limit,
          },
          filters: {
            query: params.query,
            categoryId: params.categoryId,
            badge: params.badge,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            inStock: params.inStock,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
          },
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error searching products:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to search products",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
