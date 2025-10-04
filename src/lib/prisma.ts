import type { Prisma, ProductBadge, User } from "@prisma/vercel-client";
import { PrismaClient } from "@prisma/vercel-client";

// Extend global type for Prisma instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Enhanced Prisma configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: "pretty",
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Singleton pattern with proper cleanup
export const prisma = globalThis.__prisma ?? createPrismaClient();

// Only store in global during development to prevent hot reload issues
if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// Graceful shutdown handling
if (typeof window === "undefined") {
  // Server-side only
  const cleanup = async () => {
    await prisma.$disconnect();
  };

  process.on("beforeExit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

// Connection health check utility
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
};

// Database utilities
export const db = {
  // Health check
  health: checkDatabaseConnection,

  // Connection info
  isConnected: async (): Promise<boolean> => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  },

  // Graceful disconnect
  disconnect: async (): Promise<void> => {
    await prisma.$disconnect();
  },

  // Transaction helper with retry logic
  transaction: async <T>(
    fn: (
      tx: Omit<
        PrismaClient,
        | "$connect"
        | "$disconnect"
        | "$on"
        | "$transaction"
        | "$use"
        | "$extends"
      >,
    ) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      retries?: number;
    },
  ): Promise<T> => {
    const { retries = 3, ...txOptions } = options || {};

    let attempt = 0;
    while (attempt < retries) {
      try {
        return await prisma.$transaction(async (tx) => fn(tx), txOptions);
      } catch (error) {
        attempt++;
        if (attempt >= retries) throw error;

        console.warn(`Transaction attempt ${attempt} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error("Transaction failed after all retries");
  },
};

// ====================================
// TYPE EXPORTS - COMPREHENSIVE COLLECTION
// ====================================

// 1. BASIC MODEL TYPES
export type {
  Category,
  Product,
  ProductBadge,
  RefreshToken,
  User,
  UserRole,
} from "@prisma/vercel-client";

// 3. CUSTOM UTILITY TYPES
export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

export type CategoryWithProducts = Prisma.CategoryGetPayload<{
  include: { products: true };
}>;

export type CategoryWithProductCount = Prisma.CategoryGetPayload<{
  include: {
    _count: {
      select: { products: true };
    };
  };
}>;

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
  };
}>;

// User types without sensitive data
export type PublicUser = Omit<User, "password">;

export type UserWithoutPassword = Omit<User, "password">;

// 4. API RESPONSE TYPES
export type ProductsResponse = {
  products: ProductWithCategory[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type CategoriesResponse = {
  categories: CategoryWithProductCount[];
  total: number;
};

// 5. FILTER AND SEARCH TYPES
export type ProductFilters = {
  categoryId?: string;
  badge?: ProductBadge;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  search?: string;
};

export type ProductSortOptions = {
  field: "name" | "price" | "createdAt" | "updatedAt";
  direction: "asc" | "desc";
};

// 6. FORM TYPES
export type CreateProductForm = {
  name: string;
  slug: string;
  price: number;
  description?: string;
  details: string[];
  images: string[];
  categoryId: string;
  weight?: number;
  stock?: number;
  badge?: ProductBadge;
};

export type UpdateProductForm = Partial<CreateProductForm> & {
  id: string;
};

export type CreateCategoryForm = {
  name: string;
  slug: string;
};

// 7. PAGINATION TYPES
export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// 8. DATABASE OPERATION TYPES
export type DatabaseError = {
  code?: string;
  message: string;
  field?: string;
};

export type OperationResult<T = any> = {
  success: boolean;
  data?: T;
  error?: DatabaseError;
};

// Development helpers
if (process.env.NODE_ENV === "development") {
  // Enable query logging in development
  (prisma as any).$on("query", (e: any) => {
    console.log("Query: " + e.query);
    console.log("Duration: " + e.duration + "ms");
  });

  // Global access for debugging
  (globalThis as any).prisma = prisma;
}

export default prisma;
