import type { Product } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";

export class ProductService {
  /**
   * Get the last 3 updated products for home page
   */
  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        orderBy: {
          updatedAt: "desc",
        },
        take: 3,
      });

      return products;
    } catch (error) {
      console.error("Error fetching featured products:", error);

      // Return fallback data if database fails
      return [];
    }
  }

  /**
   * Get single product by slug (for future use)
   */
  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { slug },
      });

      if (!product) return null;

      return product;
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      return null;
    }
  }
}
