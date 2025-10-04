import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";

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
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  price: number;
  weight: string;
  stock: string;
  badge: string;
  description: string;
  categoryId: string;
}

export function useProductForm(
  product: Product | null,
  mode: "create" | "edit",
) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    price: 0,
    weight: "",
    stock: "",
    badge: "",
    description: "",
    categoryId: "",
  });

  const [details, setDetails] = useState<string[]>([]);
  const [newDetail, setNewDetail] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [previewSlug, setPreviewSlug] = useState("");

  const { execute: createProduct, isPending: isCreating } = useAstroAction(
    actions.products.create,
  );
  const { execute: updateProduct, isPending: isUpdating } = useAstroAction(
    actions.products.update,
  );

  const isPending = isCreating || isUpdating;

  // Initialize form data
  useEffect(() => {
    if (mode === "edit" && product) {
      setFormData({
        name: product.name,
        price: product.price,
        weight: product.weight?.toString() || "",
        stock: product.stock?.toString() || "",
        badge: product.badge || "",
        description: product.description || "",
        categoryId: product.category.id,
      });
      setDetails(product.details);
      setImages(product.images);
      setPreviewSlug(product.slug);
    } else {
      resetForm();
    }
  }, [mode, product]);

  // Generate slug preview
  useEffect(() => {
    if (formData.name.trim()) {
      const slug = generateSlug(formData.name);
      setPreviewSlug(slug);
    } else {
      setPreviewSlug("");
    }
  }, [formData.name]);

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      weight: "",
      stock: "",
      badge: "",
      description: "",
      categoryId: "",
    });
    setDetails([]);
    setImages([]);
    setPreviewSlug("");
    setNewDetail("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const addDetail = () => {
    if (newDetail.trim() && !details.includes(newDetail.trim())) {
      setDetails((prev) => [...prev, newDetail.trim()]);
      setNewDetail("");
    }
  };

  const removeDetail = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const addImages = (newUrls: string[]) => {
    setImages((prev) => {
      const combined = [...prev, ...newUrls];
      return combined.slice(0, 5); // Limit to 5 images
    });
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];

    try {
      // Extract public_id from Cloudinary URL for deletion
      const urlParts = imageUrl.split("/");
      const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
      const publicIdWithFormat = urlParts.slice(versionIndex + 1).join("/");
      const publicId = publicIdWithFormat.replace(/\.[^/.]+$/, "");

      // Delete from Cloudinary
      await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      setImages((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting image:", error);
      // Still remove from state even if deletion fails
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Product name is required";
    if (formData.price <= 0) return "Price must be greater than 0";
    if (!formData.categoryId) return "Category is required";
    return null;
  };

  const submitForm = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const validationError = validateForm();
    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      const payload = {
        name: formData.name.trim(),
        price: formData.price,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        badge: (formData.badge as any) || undefined,
        description: formData.description.trim() || undefined,
        details,
        categoryId: formData.categoryId,
        images,
        ...(mode === "edit" && { id: product!.id }),
      };

      const result =
        mode === "edit"
          ? await updateProduct(payload)
          : await createProduct(payload);

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || `Failed to ${mode} product`,
        };
      }
    } catch (error) {
      console.error(`Error ${mode}ing product:`, error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  return {
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
    resetForm,
    generateSlug,
  };
}
