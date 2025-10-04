import QuickView from "@/components/product/QuickView";
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
import { FaEye, FaMinus, FaPlus, FaShare } from "react-icons/fa6";

interface ProductListProps {
  products: Product[];
  loading?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="border-border-light bg-bg-alt animate-pulse rounded-lg border p-4"
          >
            <div className="flex gap-4">
              <div className="bg-bg aspect-square w-24 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="bg-bg h-5 w-1/3 rounded"></div>
                <div className="bg-bg h-4 w-1/4 rounded"></div>
                <div className="bg-bg h-3 w-2/3 rounded"></div>
                <div className="bg-bg h-8 w-1/4 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductListItem key={product.id} product={product} />
      ))}
    </div>
  );
};

const ProductListItem: React.FC<{ product: Product }> = ({ product }) => {
  const { addItem, isInCart, getItemQuantity, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

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

  const handleAddToCart = async () => {
    if (!inStock || isLoading) return;

    const loadingToast = showToast.loading("Adding to cart...");

    try {
      await addItem(product, quantity);
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
    const url = `${window.location.origin}/product/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text:
            product.description ||
            `Check out this delicious ${product.name} from Cazzert Cakes!`,
          url,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      showToast.success("Link copied to clipboard!");
    }
  };

  const handleQuickView = () => {
    setShowQuickView(true);
  };

  return (
    <>
      <div className="border-border-light bg-bg-alt hover:bg-bg group rounded-lg border p-4 transition-all duration-200">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <button onClick={handleQuickView} className="block">
              <img
                src={
                  product.images[0] ||
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMyNCAyOC42ODYzIDI2LjY4NjMgMjYgMzAgMjZIMzRDMzcuMzEzNyAyNiA0MCAyOC42ODYzIDQwIDMyVjM2QzQwIDM5LjMxMzcgMzcuMzEzNyA0MiAzNCA0MkgzMEMyNi42ODYzIDQyIDI0IDM5LjMxMzcgMjQgMzZWMzJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yOCAzMEgyOFYzNEgzNlYzMEgzNk0zMiAzNEwzMCAzNkgzNEwzMiAzNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="
                }
                alt={product.name}
                className="aspect-square w-24 cursor-pointer rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
                onError={handleImageError}
              />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <button
                    onClick={handleQuickView}
                    className="hover:text-primary text-left transition-colors"
                  >
                    <h3 className="font-Secondary text-text-base line-clamp-1 text-lg font-semibold">
                      {product.name}
                    </h3>
                  </button>
                  <div className="mt-1 flex items-center gap-2">
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
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleShare}
                    className="text-text-muted hover:text-primary rounded-lg p-2 transition-colors"
                    title="Share this product"
                  >
                    <FaShare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleQuickView}
                    className="text-text-muted hover:text-primary rounded-lg p-2 transition-colors"
                    title="Quick view"
                  >
                    <FaEye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-2">
                <Badge
                  variant={stockStatus.variant}
                  size="sm"
                  pulse={stockStatus.pulse}
                >
                  {stockStatus.text}
                </Badge>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-text-muted mb-3 line-clamp-2 text-sm">
                  {product.description}
                </p>
              )}

              {/* Cart Status - Show if already in cart */}
              {itemIsInCart && (
                <div className="bg-primary/10 border-primary/30 mb-3 rounded-lg border px-3 py-2">
                  <p className="text-primary text-sm font-medium">
                    ✓ Already in cart ({cartQuantity} item
                    {cartQuantity > 1 ? "s" : ""})
                  </p>
                </div>
              )}
            </div>

            {/* Add to Cart Section */}
            <div className="flex items-center justify-between">
              {inStock ? (
                <div className="flex items-center gap-3">
                  {/* Quantity Controls */}
                  <div className="border-border-light flex items-center rounded-lg border">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="hover:bg-bg p-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaMinus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[2rem] px-2 py-2 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={
                        product.stock ? quantity >= product.stock : false
                      }
                      className="hover:bg-bg p-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaPlus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isLoading || !inStock}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                      showSuccess
                        ? "bg-green-500 text-white"
                        : "bg-primary hover:bg-primary-dark text-white"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {showSuccess ? (
                      "✓ Added"
                    ) : (
                      <>
                        <FaPlus className="h-3 w-3" />
                        {isLoading ? "Adding..." : "Add to Cart"}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-sm font-medium text-red-800">
                    Out of Stock
                  </p>
                </div>
              )}

              {/* Full Details Link */}
              <a
                href={`/product/${product.slug}`}
                className="text-text-muted hover:text-primary text-sm transition-colors"
              >
                Full Details →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* QuickView Modal */}
      <QuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default ProductList;
