import type { Product } from "@/lib/prisma";
import { useCallback, useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface FilterCounts {
  categories: Category[];
  badges: Array<{ badge: string; count: number }>;
  stock: {
    inStock: number;
    outOfStock: number;
    lowStock: number;
    all: number;
  };
}

interface ProductFilters {
  search?: string;
  category?: string;
  badge?: string;
  stock?: "all" | "in-stock" | "out-of-stock" | "low-stock";
  priceMin?: number;
  priceMax?: number;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt" | "stock";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: Required<ProductFilters>;
  filterCounts: FilterCounts | null;
}

export function useProductsAPI(initialFilters: ProductFilters = {}) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...initialFilters,
  });

  const fetchProducts = useCallback(
    async (newFilters?: Partial<ProductFilters>) => {
      setLoading(true);
      setError(null);

      try {
        const currentFilters = { ...filters, ...newFilters };

        // Build query string
        const params = new URLSearchParams();

        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch products");
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
          setFilters(currentFilters);
        } else {
          throw new Error(result.error || "Failed to fetch products");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  // Update filters and fetch
  const updateFilters = useCallback(
    (newFilters: Partial<ProductFilters>, resetPage = true) => {
      const updatedFilters = {
        ...newFilters,
        ...(resetPage && { page: 1 }),
      };
      fetchProducts(updatedFilters);
    },
    [fetchProducts],
  );

  // Pagination helpers
  const goToPage = useCallback(
    (page: number) => {
      fetchProducts({ page });
    },
    [fetchProducts],
  );

  const nextPage = useCallback(() => {
    if (data?.pagination.hasNextPage) {
      goToPage(data.pagination.page + 1);
    }
  }, [data?.pagination, goToPage]);

  const prevPage = useCallback(() => {
    if (data?.pagination.hasPrevPage) {
      goToPage(data.pagination.page - 1);
    }
  }, [data?.pagination, goToPage]);

  // Filter helpers
  const setSearch = useCallback(
    (search: string) => {
      updateFilters({ search });
    },
    [updateFilters],
  );

  const setCategory = useCallback(
    (category: string) => {
      updateFilters({ category });
    },
    [updateFilters],
  );

  const setBadge = useCallback(
    (badge: string) => {
      updateFilters({ badge });
    },
    [updateFilters],
  );

  const setStock = useCallback(
    (stock: "all" | "in-stock" | "out-of-stock" | "low-stock") => {
      updateFilters({ stock });
    },
    [updateFilters],
  );

  const setPriceRange = useCallback(
    (priceMin?: number, priceMax?: number) => {
      updateFilters({ priceMin, priceMax });
    },
    [updateFilters],
  );

  const setSorting = useCallback(
    (
      sortBy: "name" | "price" | "createdAt" | "updatedAt" | "stock",
      sortOrder: "asc" | "desc",
    ) => {
      updateFilters({ sortBy, sortOrder }, false);
    },
    [updateFilters],
  );

  const clearFilters = useCallback(() => {
    updateFilters({
      search: "",
      category: "",
      badge: "",
      stock: "all", // Make sure this defaults to "all"
      priceMin: undefined,
      priceMax: undefined,
    });
  }, [updateFilters]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    // Data
    data,
    products: data?.products || [],
    pagination: data?.pagination,
    filterCounts: data?.filterCounts,
    activeFilters: data?.filters,

    // State
    loading,
    error,

    // Actions
    updateFilters,
    goToPage,
    nextPage,
    prevPage,
    setSearch,
    setCategory,
    setBadge,
    setStock,
    setPriceRange,
    setSorting,
    clearFilters,
    refresh,
  };
}
