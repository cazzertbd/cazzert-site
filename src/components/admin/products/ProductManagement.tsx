import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useProductsAPI } from "@/hooks/useProductsAPI";
import { useState } from "react";
import { MdAdd, MdRefresh } from "react-icons/md";
import { ProductFilters } from "./ProductFilters";
import { ProductModal } from "./ProductModal";
import { ProductTable } from "./ProductTable";

export function ProductManagement() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setStock, // Changed from setStatus
    setPriceRange,
    setSorting,
    clearFilters,
    refresh,
  } = useProductsAPI({
    limit: 10,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (product: any) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        const response = await fetch(`/api/products/${product.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          refresh();
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || "Failed to delete product"}`);
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("An error occurred while deleting the product");
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductUpdated = () => {
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-base text-2xl font-bold">
            Product Management
          </h1>
          <p className="text-text-muted">
            Manage your bakery products, inventory, and pricing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <MdRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleCreateProduct}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <MdAdd className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters
        activeFilters={activeFilters!}
        filterCounts={filterCounts ?? null}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onBadgeChange={setBadge}
        onStockChange={setStock} // Changed from onStatusChange
        onPriceRangeChange={setPriceRange}
        onSortChange={setSorting}
        onClearFilters={clearFilters}
        disabled={loading}
      />

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Products Table */}
      <ProductTable
        products={products}
        loading={loading}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalCount}
          itemsPerPage={pagination.limit}
          onPageChange={goToPage}
          onPrevPage={prevPage}
          onNextPage={nextPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          disabled={loading}
        />
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={selectedProduct}
        mode={modalMode}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
}
