import { Modal } from "@/components/ui/Modal";
import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import { MdCategory } from "react-icons/md";

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  mode: "create" | "edit";
  onCategoryUpdated: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  mode,
  onCategoryUpdated,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewSlug, setPreviewSlug] = useState("");

  const { execute: createCategory, isPending: isCreating } = useAstroAction(
    actions.categories.create,
  );
  const { execute: updateCategory, isPending: isUpdating } = useAstroAction(
    actions.categories.update,
  );

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && category) {
        setName(category.name);
        setPreviewSlug(category.slug);
      } else {
        setName("");
        setPreviewSlug("");
      }
      setError(null);
    }
  }, [isOpen, mode, category]);

  // Generate slug preview as user types
  useEffect(() => {
    if (name.trim()) {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setPreviewSlug(slug);
    } else {
      setPreviewSlug("");
    }
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());

      let result;

      if (mode === "edit" && category) {
        formData.append("id", category.id);
        result = await updateCategory(formData);
      } else {
        result = await createCategory(formData);
      }

      if (result.success) {
        onCategoryUpdated();
        handleClose();
      } else {
        setError(result.error || `Failed to ${mode} category`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing category:`, error);
      setError("An unexpected error occurred");
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setName("");
      setPreviewSlug("");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === "edit" ? "Edit Category" : "Create New Category"}
      size="md"
      closeOnOverlayClick={!isPending}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800/30 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Category Info for Edit Mode */}
        {mode === "edit" && category && (
          <div className="bg-bg border-border/20 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                <MdCategory className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-text-base font-medium">Editing Category</h3>
                <p className="text-text-muted text-sm">
                  {category.productCount} product
                  {category.productCount !== 1 ? "s" : ""} in this category
                </p>
                <p className="text-text-subtle text-xs">
                  Created {new Date(category.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Name Input */}
        <div className="space-y-2">
          <label
            htmlFor="categoryName"
            className="text-text-base block text-sm font-semibold"
          >
            Category Name *
          </label>
          <input
            id="categoryName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Wedding Cakes, Cupcakes, Cookies"
            disabled={isPending}
            className="border-border/20 focus:border-primary focus:ring-primary/30 w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            maxLength={100}
            required
          />
          <p className="text-text-subtle text-xs">
            Choose a clear, descriptive name for your category
          </p>
        </div>

        {/* Slug Preview */}
        {previewSlug && (
          <div className="space-y-2">
            <label className="text-text-base block text-sm font-semibold">
              URL Slug Preview
            </label>
            <div className="bg-bg border-border/20 rounded-lg border p-3">
              <code className="text-text-muted text-sm">
                /categories/
                <span className="text-primary font-medium">{previewSlug}</span>
              </code>
            </div>
            <p className="text-text-subtle text-xs">
              This will be automatically generated from the category name
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="border-border/20 text-text-muted hover:bg-bg hover:text-text-base flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="bg-primary hover:bg-primary-dark flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                <span>{mode === "edit" ? "Updating..." : "Creating..."}</span>
              </div>
            ) : mode === "edit" ? (
              "Update Category"
            ) : (
              "Create Category"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
