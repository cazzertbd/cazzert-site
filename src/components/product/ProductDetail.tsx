import {
  Badge,
  getProductBadgeVariant,
  getStockBadgeVariant,
} from "@/components/ui/Badge";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/lib/prisma";
import { showToast } from "@/utils/toastConfig";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaMinus, FaPlus, FaShare } from "react-icons/fa6";

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const { addItem, isInCart, getItemQuantity, isLoading } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const itemIsInCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);
  const stockStatus = getStockBadgeVariant(product.stock ?? undefined);

  const formattedPrice = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(product.price);

  const inStock =
    product.stock === null || product.stock === undefined || product.stock > 0;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    // Prevent infinite loop by checking if we're already showing placeholder
    if (!target.src.includes("data:image")) {
      // Use a data URI as fallback to prevent network requests
      target.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMyNCAyOC42ODYzIDI2LjY4NjMgMjYgMzAgMjZIMzRDMzcuMzEzNyAyNiA0MCAyOC42ODYzIDQwIDMyVjM2QzQwIDM5LjMxMzcgMzcuMzEzNyA0MiAzNCA0MkgzMEMyNi42ODYzIDQyIDI0IDM5LjMxMzcgMjQgMzZWMzJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yOCAzMEgyOFYzNEgzNlYzMEgzNk0zMiAzNEwzMCAzNkgzNEwzMiAzNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=";
      target.alt = "Product image unavailable";
    }
  };

  // Convert to legacy format for cart compatibility
  const productData = {
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description || "",
    images: product.images,
    details: product.details,
    badge: product.badge?.toLowerCase() as any,
    link: `/product/${product.slug}`,
    inStock,
  };

  const handleAddToCart = async () => {
    if (!inStock || isLoading) return;

    const loadingToast = showToast.loading("Adding to cart...");

    try {
      await addItem(productData, quantity);

      toast.dismiss(loadingToast);
      showToast.addedToCart(product.name, quantity);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast.error("Failed to add item to cart");
      console.error("Error adding to cart:", error);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (product.stock && newQuantity > product.stock) return;
    setQuantity(newQuantity);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text:
            product.description ||
            `Check out this delicious ${product.name} from Cazzert Cakes!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-bg transition-colors duration-300">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="bg-bg-alt aspect-square overflow-hidden rounded-lg">
              <img
                src={
                  product.images[selectedImage] ||
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMyNCAyOC42ODYzIDI2LjY4NjMgMjYgMzAgMjZIMzRDMzcuMzEzNyAyNiA0MCAyOC42ODYzIDQwIDMyVjM2QzQwIDM5LjMxMzcgMzcuMzEzNyA0MiAzNCA0MkgzMEMyNi42ODYzIDQyIDI0IDM5LjMxMzcgMjQgMzZWMzJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yOCAzMEgyOFYzNEgzNlYzMEgzNk0zMiAzNEwzMCAzNkgzNEwzMiAzNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="
                }
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                onError={handleImageError}
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary shadow-lg"
                        : "border-border-light hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex min-h-[400px] flex-col">
            {/* Product Content - grows to fill space */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="font-Secondary text-text-base mb-2 text-2xl font-bold md:text-3xl">
                  {product.name}
                </h1>

                <div className="mb-3 flex items-center gap-3">
                  <span className="font-Secondary text-text-price text-xl font-bold">
                    {formattedPrice}
                  </span>

                  {product.badge && (
                    <Badge
                      variant={getProductBadgeVariant(product.badge)}
                      size="sm"
                    >
                      {product.badge}
                    </Badge>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-3">
                  <Badge
                    variant={stockStatus.variant}
                    size="sm"
                    pulse={stockStatus.pulse}
                  >
                    {stockStatus.text}
                  </Badge>
                </div>

                {product.description && (
                  <p className="text-text-muted leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Product Details */}
              {product.details.length > 0 && (
                <div>
                  <h3 className="font-Secondary mb-2 text-lg font-semibold">
                    Details
                  </h3>
                  <ul className="space-y-1">
                    {product.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mt-1 mr-2 text-sm">
                          •
                        </span>
                        <span className="text-text-muted text-sm">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Add to Cart Section - Fixed at bottom */}
            <div className="border-border-light mt-4 border-t pt-4">
              {/* Quantity & Add to Cart */}
              {inStock ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-text-base text-sm font-medium">
                      Quantity:
                    </span>
                    <div className="border-border-light flex items-center rounded-lg border">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="hover:bg-bg-alt p-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaMinus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[2.5rem] px-3 py-2 text-center text-sm font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={
                          product.stock ? quantity >= product.stock : false
                        }
                        className="hover:bg-bg-alt p-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaPlus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={isLoading || !inStock}
                      className={`flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                        showSuccess
                          ? "bg-green-500 text-white"
                          : "bg-primary hover:bg-primary-dark text-white"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {showSuccess ? (
                        <>
                          <FaCheck className="mr-2 h-3 w-3" />
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <FaPlus className="mr-2 h-3 w-3" />
                          {isLoading ? "Adding..." : "Add to Cart"}
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className="border-border-light hover:bg-bg-alt rounded-lg border p-2.5 transition-colors"
                      title="Share this product"
                    >
                      <FaShare className="h-4 w-4" />
                    </button>
                  </div>

                  {itemIsInCart && (
                    <div className="bg-primary/10 border-primary/30 rounded-lg border p-2.5">
                      <p className="text-primary text-sm font-medium">
                        ✓ Already in cart ({cartQuantity} item
                        {cartQuantity > 1 ? "s" : ""})
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-800">
                    This item is currently out of stock.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
