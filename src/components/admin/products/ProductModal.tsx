import { CloudinaryUploader } from "@/components/ui/CloudinaryUploader";
import { DetailsList } from "@/components/ui/DetailsList";
import { FormField } from "@/components/ui/FormField";
import {
  ImageGallery,
  ImageGalleryPlaceholder,
} from "@/components/ui/ImageGallery";
import { Modal } from "@/components/ui/Modal";
import { useAstroAction } from "@/hooks/useAstroAction";
import { useProductForm } from "@/hooks/useProductForm";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import { MdShoppingBag } from "react-icons/md";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  weight?: number;
  stock?: number;
  badge?: "BESTSELLER" | "NEW" | "LIMITED" | "SEASONAL" | "FEATURED";
  description?: string;
  details: string[];
  images: string[];
  category: { id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  mode: "create" | "edit";
  onProductUpdated: () => void;
}

const BADGE_OPTIONS = [
  { value: "BESTSELLER", label: "Bestseller" },
  { value: "NEW", label: "New" },
  { value: "LIMITED", label: "Limited Edition" },
  { value: "SEASONAL", label: "Seasonal" },
  { value: "FEATURED", label: "Featured" },
];

export function ProductModal({
  isOpen,
  onClose,
  product,
  mode,
  onProductUpdated,
}: ProductModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    formData,
    details,
    newDetail,
    images,
    previewSlug,
    isPending,
    handleInputChange,
    setNewDetail,
    addDetail,
    removeDetail,
    addImages,
    removeImage,
    submitForm,
    generateSlug,
  } = useProductForm(product, mode);

  const { execute: getCategories } = useAstroAction(actions.categories.getAll);

  // Load categories and reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setError(null);
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const result = await getCategories({});
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await submitForm();
    if (result.success) {
      onProductUpdated();
      onClose();
    } else {
      setError(result.error || "An error occurred");
    }
  };

  const handleClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  const handleCloudinaryUpload = (newUrls: string[]) => {
    addImages(newUrls);
  };

  const handleCloudinaryError = (error: any) => {
    console.error("Cloudinary upload error:", error);
    setError("Failed to upload images. Please try again.");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === "edit" ? "Edit Product" : "Create New Product"}
      size="2xl"
      closeOnOverlayClick={!isPending}
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800/30 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Product Info for Edit Mode */}
          {mode === "edit" && product && (
            <div className="border-border/20 bg-bg rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center">
                      <MdShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-text-base font-medium">
                    Editing Product
                  </h3>
                  <p className="text-text-muted text-sm">
                    Category: {product.category.name}
                  </p>
                  <p className="text-text-subtle text-xs">
                    Created {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Form Content */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <FormField label="Product Name" required>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Chocolate Birthday Cake"
                  disabled={isPending}
                  className="border-border/20 focus:border-primary focus:ring-primary/30 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  maxLength={200}
                  required
                />
              </FormField>

              {/* Price & Weight */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Price (BDT)" required>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="25.99"
                    disabled={isPending}
                    className="border-border/20 focus:border-primary focus:ring-primary/30 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    min="0"
                    step="0.01"
                    required
                  />
                </FormField>

                <FormField label="Weight (g)">
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="500"
                    disabled={isPending}
                    className="border-border/20 focus:border-primary focus:ring-primary/30 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    min="0"
                  />
                </FormField>
              </div>

              {/* Stock & Badge */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Stock">
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="10"
                    disabled={isPending}
                    className="w-full"
                    min="0"
                  />
                </FormField>

                <FormField label="Badge">
                  <select
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    disabled={isPending}
                    className="w-full"
                  >
                    <option value="">None</option>
                    {BADGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Category" required>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  disabled={isPending}
                  className="w-full"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Description">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Delicious chocolate cake perfect for birthdays..."
                  disabled={isPending}
                  rows={4}
                  className="border-border/20 focus:border-primary focus:ring-primary/30 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormField>

              {/* Slug Preview */}
              {previewSlug && (
                <FormField label="URL Slug Preview">
                  <div className="border-border/20 bg-bg rounded-lg border p-3">
                    <code className="text-text-muted text-sm break-all">
                      /products/
                      <span className="text-primary font-medium">
                        {previewSlug}
                      </span>
                    </code>
                  </div>
                </FormField>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <FormField label="Product Details">
                <DetailsList
                  details={details}
                  newDetail={newDetail}
                  onNewDetailChange={setNewDetail}
                  onAddDetail={addDetail}
                  onRemoveDetail={removeDetail}
                  disabled={isPending}
                />
              </FormField>

              <FormField label="Product Images">
                <div className="space-y-4">
                  <ImageGallery
                    images={images}
                    onRemoveImage={removeImage}
                    disabled={isPending}
                  />

                  {images.length < 5 ? (
                    <CloudinaryUploader
                      onUpload={handleCloudinaryUpload}
                      onError={handleCloudinaryError}
                      maxFiles={5 - images.length}
                      disabled={isPending}
                      folder={`cazzert/products/${generateSlug(formData.name || "product")}`}
                      tags={["product", "bakery"]}
                    />
                  ) : (
                    <ImageGalleryPlaceholder message="Maximum 5 images reached. Remove an image to upload a new one." />
                  )}
                </div>
              </FormField>
            </div>
          </div>
        </form>
      </div>

      {/* Actions */}
      <div className="border-border-light bg-bg-alt/95 sticky bottom-0 -mx-6 mt-8 -mb-6 border-t p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="border-border bg-bg-alt text-text-muted hover:border-primary-light hover:bg-bg hover:text-text-base focus:ring-primary/20 order-2 flex-1 rounded-lg border px-6 py-3 text-sm font-medium shadow-sm transition-all focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isPending ||
              !formData.name.trim() ||
              formData.price <= 0 ||
              !formData.categoryId
            }
            className="bg-primary text-text-light hover:bg-primary-dark focus:ring-primary-light/50 disabled:bg-accent-grey order-1 flex-1 rounded-lg px-6 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:order-2"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="border-text-light/30 border-t-text-light h-4 w-4 animate-spin rounded-full border-2"></div>
                <span>{mode === "edit" ? "Updating..." : "Creating..."}</span>
              </div>
            ) : mode === "edit" ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
