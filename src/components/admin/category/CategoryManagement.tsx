import { ActionsDropdown } from "@/components/ui/ActionsDropdown.tsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import { MdAdd, MdCategory, MdDelete, MdEdit } from "react-icons/md";
import { CategoryModal } from "./CategoryModal.tsx";

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
}

interface CategoryManagementProps {
  currentUser: CurrentUser;
}

export function CategoryManagement({ currentUser }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const { execute: getCategories, isPending: isLoading } = useAstroAction(
    actions.categories.getAll,
  );
  const { execute: deleteCategory, isPending: isDeleting } = useAstroAction(
    actions.categories.delete,
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await getCategories({});
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error("Failed to load categories:", result.data?.error);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (category.productCount > 0) {
      alert(
        `Cannot delete "${category.name}". It contains ${category.productCount} product(s). Please move or delete all products first.`,
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const result = await deleteCategory({ id: category.id });
      if (result.success) {
        await loadCategories();
      } else {
        alert(result.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("An error occurred while deleting the category");
    }
  };

  const handleCategoryUpdated = () => {
    loadCategories();
    setIsModalOpen(false);
  };

  // Generate actions for each category
  const getCategoryActions = (category: Category) => [
    {
      label: "Edit Category",
      icon: <MdEdit className="h-4 w-4" />,
      onClick: () => handleEditCategory(category),
    },
    {
      label:
        category.productCount > 0
          ? `Has ${category.productCount} products`
          : isDeleting
            ? "Deleting..."
            : "Delete Category",
      icon: <MdDelete className="h-4 w-4" />,
      onClick: () => handleDeleteCategory(category),
      disabled: category.productCount > 0 || isDeleting,
      variant: "danger" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full">
            <MdCategory className="text-primary h-6 w-6" />
          </div>
          <p className="text-text-muted">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-text-base font-Secondary text-2xl font-bold">
            Category Management
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Organize your bakery products into categories
          </p>
          <p className="text-text-subtle mt-2 text-xs">
            Logged in as:{" "}
            <span className="font-medium">
              {currentUser.name || currentUser.email}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="text-text-subtle flex items-center gap-2 text-sm">
            <span>Total Categories:</span>
            <span className="bg-primary/10 text-primary rounded-full px-2 py-1 font-semibold">
              {categories.length}
            </span>
          </div>
          <Button
            onClick={handleCreateCategory}
            variant="primary"
            size="sm"
            className="flex items-center justify-center gap-2"
          >
            <MdAdd className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      {categories.length > 0 ? (
        <div className="overflow-visible">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead align="left">Category Name</TableHead>
                <TableHead align="left">Slug</TableHead>
                <TableHead align="center">Products</TableHead>
                <TableHead align="center">Created</TableHead>
                <TableHead align="center">Updated</TableHead>
                <TableHead align="right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  {/* Category Name */}
                  <TableCell align="left">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                        <MdCategory className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-text-base font-medium">
                          {category.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Slug */}
                  <TableCell align="left">
                    <code className="text-text-muted bg-bg rounded px-2 py-1 text-xs">
                      /{category.slug}
                    </code>
                  </TableCell>

                  {/* Product Count */}
                  <TableCell align="center">
                    <Badge
                      variant={category.productCount > 0 ? "info" : "default"}
                      size="sm"
                    >
                      {category.productCount} product
                      {category.productCount !== 1 ? "s" : ""}
                    </Badge>
                  </TableCell>

                  {/* Created Date */}
                  <TableCell align="center">
                    <span className="text-text-subtle text-xs">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>

                  {/* Updated Date */}
                  <TableCell align="center">
                    <span className="text-text-subtle text-xs">
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <ActionsDropdown
                      actions={getCategoryActions(category)}
                      isLoading={isDeleting}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-bg-alt border-border/20 rounded-lg border p-12 text-center">
          <MdCategory className="text-text-subtle mx-auto mb-4 h-12 w-12" />
          <h3 className="text-text-base mb-2 font-medium">
            No Categories Found
          </h3>
          <p className="text-text-muted mb-4 text-sm">
            Create your first category to start organizing your products.
          </p>
          <Button
            onClick={handleCreateCategory}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <MdAdd className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        mode={modalMode}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </div>
  );
}
