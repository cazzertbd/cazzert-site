import { prisma } from "@/lib";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    // Parse query parameters
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const badge = searchParams.get("badge") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const stockFilter = searchParams.get("stock") || ""; // all, in-stock, out-of-stock, low-stock
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid pagination parameters",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Build where clause
    const whereConditions: any[] = [];

    // Search in name and description
    if (search) {
      whereConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // Filter by category
    if (category) {
      whereConditions.push({
        category: {
          slug: category,
        },
      });
    }

    // Filter by badge
    if (badge) {
      whereConditions.push({
        badge: badge,
      });
    }

    // Filter by price range
    if (priceMin || priceMax) {
      const priceFilter: any = {};
      if (priceMin) priceFilter.gte = parseFloat(priceMin);
      if (priceMax) priceFilter.lte = parseFloat(priceMax);
      whereConditions.push({ price: priceFilter });
    }

    // Filter by stock level
    if (stockFilter) {
      if (stockFilter === "in-stock") {
        whereConditions.push({
          OR: [{ stock: { gt: 0 } }, { stock: null }],
        });
      } else if (stockFilter === "out-of-stock") {
        whereConditions.push({ stock: 0 });
      } else if (stockFilter === "low-stock") {
        whereConditions.push({
          stock: {
            gt: 0,
            lte: 10,
          },
        });
      }
      // "all" shows everything
    }

    const whereClause =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Build order clause
    const validSortFields = [
      "name",
      "price",
      "createdAt",
      "updatedAt",
      "stock",
    ];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const finalSortOrder = sortOrder === "asc" ? "asc" : "desc";

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { [finalSortBy]: finalSortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get filter counts for UI
    const [categoryCount, badgeCount, stockCounts] = await Promise.all([
      // Categories with product count
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      // Badge counts
      prisma.product.groupBy({
        by: ["badge"],
        _count: { badge: true },
        where: { badge: { not: null } },
      }),
      // Stock level counts
      Promise.all([
        prisma.product.count({
          where: {
            OR: [{ stock: { gt: 0 } }, { stock: null }],
          },
        }),
        prisma.product.count({ where: { stock: 0 } }),
        prisma.product.count({
          where: {
            stock: {
              gt: 0,
              lte: 10,
            },
          },
        }),
        prisma.product.count(), // Total count
      ]),
    ]);

    const filterCounts = {
      categories: categoryCount,
      badges: badgeCount.map((item) => ({
        badge: item.badge,
        count: item._count.badge,
      })),
      stock: {
        inStock: stockCounts[0],
        outOfStock: stockCounts[1],
        lowStock: stockCounts[2],
        all: stockCounts[3],
      },
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNextPage,
            hasPrevPage,
          },
          filters: {
            search,
            category,
            badge,
            stock: stockFilter,
            priceMin: priceMin ? parseFloat(priceMin) : null,
            priceMax: priceMax ? parseFloat(priceMax) : null,
            sortBy: finalSortBy,
            sortOrder: finalSortOrder,
          },
          filterCounts,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
