import { useCart } from "@/hooks/useCart";
import type { Product } from "@/lib/prisma";
import { showToast } from "@/utils/toastConfig";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  FaCartPlus,
  FaChevronLeft,
  FaChevronRight,
  FaMinus,
  FaPlus,
  FaRegCircleCheck,
  FaTrash,
} from "react-icons/fa6";
import { IoCloseCircleOutline } from "react-icons/io5";

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickView: React.FC<QuickViewProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const {
    addItem,
    updateQuantity,
    removeItem,
    isInCart,
    getItemQuantity,
    isLoading,
  } = useCart();

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [product]);

  // Handle escape key and body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, onClose]);

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

  if (!product || !isOpen) return null;

  const itemIsInCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  const formattedPrice = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleAddToCart = async () => {
    const loadingToast = showToast.loading("Adding to cart...");

    try {
      await addItem(product, quantity);

      toast.dismiss(loadingToast);
      showToast.addedToCart(product.name, quantity);
      onClose();
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast.error("Failed to add item to cart");
      console.error("Error adding to cart:", error);
    }
  };

  const handleUpdateCartQuantity = async (newQuantity: number) => {
    const loadingToast = showToast.loading("Updating quantity...");

    try {
      await updateQuantity(product.id, newQuantity);

      toast.dismiss(loadingToast);
      showToast.quantityUpdated(product.name, newQuantity);
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast.error("Failed to update quantity");
      console.error("Error updating cart quantity:", error);
    }
  };

  const handleRemoveFromCart = async () => {
    const loadingToast = showToast.loading("Removing from cart...");

    try {
      await removeItem(product.id);

      toast.dismiss(loadingToast);
      showToast.removedFromCart(product.name);
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast.error("Failed to remove item from cart");
      console.error("Error removing from cart:", error);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Backdrop */}
      <div
        className="bg-bg-overlay absolute inset-0 cursor-pointer opacity-80 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="bg-bg-alt border-border-light relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg border shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="bg-bg-alt/80 text-text-muted hover:bg-primary absolute top-4 right-4 z-10 cursor-pointer rounded-full p-0.5 transition-colors hover:text-white"
        >
          <IoCloseCircleOutline size={25} />
        </button>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={
                  product.images[currentImageIndex] ||
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMyNCAyOC42ODYzIDI2LjY4NjMgMjYgMzAgMjZIMzRDMzcuMzEzNyAyNiA0MCAyOC42ODYzIDQwIDMyVjM2QzQwIDM5LjMxMzcgMzcuMzEzNyA0MiAzNCA0MkgzMEMyNi42ODYzIDQyIDI0IDM5LjMxMzcgMjQgMzZWMzJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yOCAzMEgyOFYzNEgzNlYzMEgzNk0zMiAzNEwzMCAzNkgzNEwzMiAzNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="
                }
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="h-96 w-full object-cover"
                onError={handleImageError}
              />

              {/* Navigation Arrows (only if multiple images) */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="bg-bg-alt/80 text-primary hover:bg-bg-alt absolute top-1/2 left-2 -translate-y-1/2 cursor-pointer rounded-full p-2 transition-all"
                  >
                    <FaChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="bg-bg-alt/80 text-primary hover:bg-bg-alt absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-full p-2 transition-all"
                  >
                    <FaChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Image Indicators */}
            {product.images.length > 1 && (
              <div className="mt-4 flex justify-center space-x-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 cursor-pointer rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-primary w-8"
                        : "bg-border-light hover:bg-primary/50 w-2"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Header */}
            <div className="mb-4">
              <h2 className="font-Secondary text-text-base mb-2 text-2xl font-semibold">
                {product.name}
              </h2>
              <p className="font-Secondary text-text-price text-2xl font-bold">
                {formattedPrice}
              </p>
            </div>

            {/* Description */}
            <p className="text-text-muted mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Details */}
            {product.details && product.details.length > 0 && (
              <div className="mb-6">
                <h3 className="text-text-base mb-3 text-sm font-semibold tracking-wider uppercase">
                  Details
                </h3>
                <ul className="space-y-2">
                  {product.details.map((detail, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                      <FaRegCircleCheck className="text-primary" />
                      <span className="text-text-muted text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="mt-auto space-y-4">
              {/* Quantity Selector - only show if not in cart */}
              {!itemIsInCart && (
                <div className="flex items-center space-x-4">
                  <span className="text-text-base text-sm font-medium">
                    Quantity:
                  </span>
                  <div className="border-border-light flex items-center rounded-md border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="text-text-muted hover:text-primary cursor-pointer px-3 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaMinus className="h-3 w-3" />
                    </button>
                    <span className="text-text-base px-4 py-2 font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                      className="text-text-muted hover:text-primary cursor-pointer px-3 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaPlus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Cart Controls - show if item is in cart */}
              {itemIsInCart && (
                <div className="space-y-3">
                  <div className="bg-bg-cta/70 border-border-light flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleUpdateCartQuantity(cartQuantity - 1)
                        }
                        disabled={cartQuantity <= 1 || isLoading}
                        className="bg-bg-alt border-border-light text-text-base hover:bg-bg flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaMinus className="h-3 w-3" />
                      </button>
                      <span className="text-text-base min-w-[2rem] text-center font-semibold">
                        {cartQuantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateCartQuantity(cartQuantity + 1)
                        }
                        disabled={isLoading}
                        className="bg-bg-alt border-border-light text-text-base hover:bg-bg flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaPlus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={handleRemoveFromCart}
                      disabled={isLoading}
                      className="bg-bg-alt border-border-light flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border text-red-500 transition-all hover:scale-105 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-text-muted text-center text-sm">
                    Item is already in your cart
                  </p>
                </div>
              )}

              {/* Add to Cart Button - only show if not in cart */}
              {!itemIsInCart && (
                <button
                  onClick={handleAddToCart}
                  disabled={!product.stock || isLoading}
                  className="bg-primary hover:bg-primary-dark flex w-full cursor-pointer items-center justify-center rounded-md px-4 py-3 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaCartPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Adding..." : "Add to Cart"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default QuickView;
