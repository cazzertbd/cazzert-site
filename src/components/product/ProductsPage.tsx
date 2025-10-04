import { ProductFilters } from "@/components/admin/products/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import ProductList from "@/components/product/ProductList";
import { useProductsAPI } from "@/hooks/useProductsAPI";
import type { Category } from "@/lib/prisma";
import React, { useEffect, useState } from "react";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import { FaChevronLeft, FaChevronRight, FaList } from "react-icons/fa6";
import { VscClearAll } from "react-icons/vsc";

interface ProductsPageProps {
  category?: Category;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ category }) => {
  const {
    products,
    pagination,
    filterCounts,
    activeFilters,
    loading,
    error,
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
  } = useProductsAPI({
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
    stock: "all", // Explicitly set stock to "all"
    category: category?.slug, // Set initial category from props
  });

  // Initialize view mode from localStorage or default to grid
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      const savedViewMode = localStorage.getItem("products-view-mode");
      return (savedViewMode as "grid" | "list") || "grid";
    }
    return "grid";
  });

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("products-view-mode", viewMode);
    }
  }, [viewMode]);

  // Fix: Ensure stock is always set to "all" if undefined
  const normalizedActiveFilters = activeFilters
    ? {
        ...activeFilters,
        stock: activeFilters.stock || "all",
      }
    : {
        search: "",
        category: category?.slug || "",
        badge: "",
        stock: "all",
        priceMin: null,
        priceMax: null,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

  const hasActiveFilters =
    normalizedActiveFilters.search ||
    (!category && normalizedActiveFilters.category) || // Only show category filter if no category prop
    normalizedActiveFilters.badge ||
    normalizedActiveFilters.stock !== "all" ||
    normalizedActiveFilters.priceMin ||
    normalizedActiveFilters.priceMax;

  const handleClearFilter = (type: string) => {
    switch (type) {
      case "search":
        setSearch("");
        break;
      case "category":
        if (!category) {
          // Only allow clearing category if no category prop
          setCategory("");
        }
        break;
      case "badge":
        setBadge("");
        break;
      case "stock":
        setStock("all");
        break;
      case "price":
        setPriceRange(undefined, undefined);
        break;
    }
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  return (
    <div className="bg-bg min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-Secondary text-text-base mb-4 text-3xl font-bold md:text-4xl">
            {category ? `${category.name} Products` : "Our Products"}
          </h1>
          <p className="text-text-muted max-w-2xl text-lg">
            {category
              ? `Discover our exquisite collection of ${category.name.toLowerCase()}, each made with premium ingredients and attention to detail.`
              : "Discover our exquisite collection of handcrafted cakes, each made with premium ingredients and attention to detail."}
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* ProductFilters Component */}
            <div className="flex-1">
              <ProductFilters
                activeFilters={normalizedActiveFilters}
                filterCounts={filterCounts || null}
                onSearchChange={setSearch}
                onCategoryChange={category ? () => {} : setCategory} // Hide category filter if category prop is provided
                onBadgeChange={setBadge}
                onStockChange={setStock}
                onPriceRangeChange={setPriceRange}
                onSortChange={setSorting}
                onClearFilters={clearFilters}
                disabled={loading}
                hideCategoryFilter={!!category} // Pass flag to hide category filter
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-text-muted text-sm font-medium">View:</span>
              <div className="border-border-light flex rounded-lg border">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "hover:bg-bg-alt text-text-muted"
                  }`}
                  title="Grid View"
                >
                  <BsFillGrid3X3GapFill className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "hover:bg-bg-alt text-text-muted"
                  }`}
                  title="List View"
                >
                  <FaList className="h-4 w-4" />
                </button>
              </div>
              {/* View Mode Indicator */}
              <span className="text-text-subtle text-xs">
                {viewMode === "grid" ? "Grid" : "List"}
              </span>
            </div>
          </div>
        </div>

        {/* Category Info Banner (when category prop is provided) */}
        {category && (
          <div className="bg-primary/5 border-primary/20 mb-6 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary rounded-full p-2">
                <BsFillGrid3X3GapFill className="h-4 w-4" />
              </div>
              <div>
                <p className="text-text-base text-sm font-medium">
                  Viewing products in category:
                </p>
                <p className="text-primary text-lg font-semibold">
                  {category.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-text-muted text-sm font-medium">
              Active filters:
            </span>
            {normalizedActiveFilters.search && (
              <FilterTag
                label={`Search: "${normalizedActiveFilters.search}"`}
                onRemove={() => handleClearFilter("search")}
              />
            )}
            {!category && normalizedActiveFilters.category && (
              <FilterTag
                label={`Category: ${filterCounts?.categories?.find((c) => c.slug === normalizedActiveFilters.category)?.name}`}
                onRemove={() => handleClearFilter("category")}
              />
            )}
            {normalizedActiveFilters.badge && (
              <FilterTag
                label={`Badge: ${normalizedActiveFilters.badge}`}
                onRemove={() => handleClearFilter("badge")}
              />
            )}
            {normalizedActiveFilters.stock !== "all" && (
              <FilterTag
                label={`Stock: ${normalizedActiveFilters.stock?.replace("-", " ")}`}
                onRemove={() => handleClearFilter("stock")}
              />
            )}
            {(normalizedActiveFilters.priceMin ||
              normalizedActiveFilters.priceMax) && (
              <FilterTag
                label={`Price: ${normalizedActiveFilters.priceMin || 0} - ${normalizedActiveFilters.priceMax || "∞"}`}
                onRemove={() => handleClearFilter("price")}
              />
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-text-muted flex items-center gap-2 text-sm">
            {loading ? (
              <>
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                Loading products...
              </>
            ) : error ? (
              <span className="text-red-500">Error loading products</span>
            ) : pagination ? (
              <>
                Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalCount,
                )}{" "}
                of {pagination.totalCount} products
                {category && (
                  <span className="text-primary"> in {category.name}</span>
                )}
              </>
            ) : (
              "No results"
            )}
          </div>

          {pagination && pagination.totalCount > 0 && (
            <div className="text-text-muted flex items-center gap-2 text-sm">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <span className="text-text-subtle">•</span>
              <span className="capitalize">{viewMode} view</span>
            </div>
          )}
        </div>

        {/* Products Display */}
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-800">Error loading products</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 && !loading ? (
          <div className="bg-bg-alt border-border-light rounded-lg border p-8 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <BsFillGrid3X3GapFill className="text-primary h-8 w-8" />
            </div>
            <p className="text-text-base mb-2 text-lg font-medium">
              No products found
            </p>
            <p className="text-text-muted mb-4 text-sm">
              {hasActiveFilters
                ? `Try adjusting your search or filters to find what you're looking for${category ? ` in ${category.name}` : ""}.`
                : category
                  ? `We don't have any products available in ${category.name} at the moment.`
                  : "We don't have any products available at the moment."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-sm text-white transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <ProductGrid products={products} loading={loading} />
            ) : (
              <ProductList products={products} loading={loading} />
            )}
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={!pagination.hasPrevPage || loading}
                className="border-border-light bg-bg-alt text-text-muted hover:bg-bg hover:text-text-base flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaChevronLeft className="h-3 w-3" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(7, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 4) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 6 + i;
                    } else {
                      pageNum = pagination.page - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        disabled={loading}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          pageNum === pagination.page
                            ? "bg-primary text-white shadow-sm"
                            : "border-border-light text-text-muted hover:bg-bg-alt hover:text-text-base border"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>

              <button
                onClick={nextPage}
                disabled={!pagination.hasNextPage || loading}
                className="border-border-light bg-bg-alt text-text-muted hover:bg-bg hover:text-text-base flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <FaChevronRight className="h-3 w-3" />
              </button>
            </div>

            <p className="text-text-muted text-xs">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalCount,
              )}{" "}
              of {pagination.totalCount} results
              {category && (
                <span className="text-primary"> in {category.name}</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for filter tags
const FilterTag: React.FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => (
  <span className="bg-primary/10 border-primary/30 text-primary flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
    {label}
    <button
      onClick={onRemove}
      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
      title="Remove filter"
    >
      <VscClearAll className="h-3 w-3" />
    </button>
  </span>
);

export default ProductsPage;
