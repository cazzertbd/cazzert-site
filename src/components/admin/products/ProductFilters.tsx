import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { MdClear, MdFilterList, MdSearch } from "react-icons/md";

interface FilterCounts {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
  }>;
  badges: Array<{ badge: string; count: number }>;
  stock: {
    inStock: number;
    outOfStock: number;
    lowStock: number;
    all: number;
  };
}

interface ActiveFilters {
  search: string;
  category: string;
  badge: string;
  stock: string;
  priceMin: number | null;
  priceMax: number | null;
  sortBy: string;
  sortOrder: string;
}

interface ProductFiltersProps {
  activeFilters: ActiveFilters;
  filterCounts: FilterCounts | null;
  onSearchChange: (search: string) => void;
  onCategoryChange?: (category: string) => void;
  onBadgeChange: (badge: string) => void;
  onStockChange: (
    stock: "all" | "in-stock" | "out-of-stock" | "low-stock",
  ) => void;
  onPriceRangeChange: (min?: number, max?: number) => void;
  onSortChange?: (
    sortBy: "name" | "price" | "createdAt" | "updatedAt" | "stock",
    sortOrder: "asc" | "desc",
  ) => void;
  onClearFilters: () => void;
  disabled?: boolean;
  hideCategoryFilter?: boolean;
}

export function ProductFilters({
  activeFilters,
  filterCounts,
  onSearchChange,
  onCategoryChange,
  onBadgeChange,
  onStockChange,
  onPriceRangeChange,
  onSortChange,
  onClearFilters,
  disabled = false,
  hideCategoryFilter = false,
}: ProductFiltersProps) {
  const [searchValue, setSearchValue] = useState(activeFilters?.search || "");
  const [priceMin, setPriceMin] = useState(
    activeFilters?.priceMin?.toString() || "",
  );
  const [priceMax, setPriceMax] = useState(
    activeFilters?.priceMax?.toString() || "",
  );
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchValue);
  };

  const handlePriceRangeSubmit = () => {
    const min = priceMin ? parseFloat(priceMin) : undefined;
    const max = priceMax ? parseFloat(priceMax) : undefined;
    onPriceRangeChange(min, max);
  };

  const hasActiveFilters = !!(
    activeFilters &&
    (activeFilters.search ||
      (!hideCategoryFilter && activeFilters.category) ||
      activeFilters.badge ||
      (activeFilters.stock && activeFilters.stock !== "all") ||
      activeFilters.priceMin ||
      activeFilters.priceMax)
  );

  // Fixed active filter count
  const getActiveFilterCount = () => {
    if (!activeFilters) return 0;
    let count = 0;
    if (activeFilters.search) count++;
    if (!hideCategoryFilter && activeFilters.category) count++;
    if (activeFilters.badge) count++;
    if (activeFilters.stock && activeFilters.stock !== "all") count++;
    if (activeFilters.priceMin) count++;
    if (activeFilters.priceMax) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Search and Toggle */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <MdSearch className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={disabled}
              className="border-border-light bg-bg-alt text-text-base placeholder-text-muted focus:border-primary focus:bg-bg focus:ring-primary/20 w-full rounded-lg border px-4 py-2 pl-10 text-sm transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </form>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <MdFilterList className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-text-light ml-1 rounded-full px-2 py-0.5 text-xs font-medium">
              {getActiveFilterCount()}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={onClearFilters}
            disabled={disabled}
            className="text-text-muted hover:text-text-base flex items-center gap-2"
          >
            <MdClear className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div
          className={`border-border-light bg-bg-alt grid gap-4 rounded-lg border p-4 shadow-sm ${
            hideCategoryFilter
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {/* Category Filter - Only show if not hidden */}
          {!hideCategoryFilter && (
            <div className="space-y-2">
              <label className="text-text-base block text-sm font-medium">
                Category
              </label>
              <select
                value={activeFilters?.category || ""}
                onChange={(e) => onCategoryChange?.(e.target.value)}
                disabled={disabled}
                className="border-border-light bg-bg text-text-base focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Categories</option>
                {filterCounts?.categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name} ({category._count.products})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Badge Filter */}
          <div className="space-y-2">
            <label className="text-text-base block text-sm font-medium">
              Badge
            </label>
            <select
              value={activeFilters?.badge || ""}
              onChange={(e) => onBadgeChange(e.target.value)}
              disabled={disabled}
              className="border-border-light bg-bg text-text-base focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Badges</option>
              {filterCounts?.badges.map((badge) => (
                <option key={badge.badge} value={badge.badge}>
                  {badge.badge} ({badge.count})
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="space-y-2">
            <label className="text-text-base block text-sm font-medium">
              Stock Level
            </label>
            <select
              value={activeFilters?.stock || "all"}
              onChange={(e) => onStockChange(e.target.value as any)}
              disabled={disabled}
              className="border-border-light bg-bg text-text-base focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Stock Levels</option>
              {filterCounts && (
                <>
                  <option value="in-stock">
                    In Stock ({filterCounts.stock.inStock})
                  </option>
                  <option value="low-stock">
                    Low Stock ({filterCounts.stock.lowStock})
                  </option>
                  <option value="out-of-stock">
                    Out of Stock ({filterCounts.stock.outOfStock})
                  </option>
                </>
              )}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-text-base block text-sm font-medium">
              Price Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                disabled={disabled}
                className="border-border-light bg-bg text-text-base placeholder-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-2 py-1.5 text-sm transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                min="0"
                step="0.01"
              />
              <span className="text-text-muted">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                disabled={disabled}
                className="border-border-light bg-bg text-text-base placeholder-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-2 py-1.5 text-sm transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                min="0"
                step="0.01"
              />
              <Button
                type="button"
                size="sm"
                onClick={handlePriceRangeSubmit}
                disabled={disabled}
                className="px-3 py-1.5 text-xs"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Sort Options */}
          <div
            className={`space-y-2 ${
              hideCategoryFilter
                ? "md:col-span-2 lg:col-span-3"
                : "md:col-span-2"
            }`}
          >
            <label className="text-text-base block text-sm font-medium">
              Sort By
            </label>
            <div className="flex items-center gap-2">
              <select
                value={activeFilters?.sortBy || "createdAt"}
                onChange={(e: any) =>
                  onSortChange?.(
                    e.target.value,
                    (activeFilters?.sortOrder as any) || "desc",
                  )
                }
                disabled={disabled}
                className="border-border-light bg-bg text-text-base focus:border-primary focus:ring-primary/20 flex-1 rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="createdAt">Date Created</option>
                <option value="updatedAt">Date Updated</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock Level</option>
              </select>
              <select
                value={activeFilters?.sortOrder || "desc"}
                onChange={(e) =>
                  onSortChange?.(
                    (activeFilters?.sortBy as any) || "createdAt",
                    e.target.value as any,
                  )
                }
                disabled={disabled}
                className="border-border-light bg-bg text-text-base focus:border-primary focus:ring-primary/20 rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
