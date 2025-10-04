import { Badge, getProductBadgeVariant } from "@/components/ui/Badge";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/lib/prisma";
import type { CartItem } from "@/types/Cart.interface";
import { showToast } from "@/utils/toastConfig";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaEye, FaMinus, FaPlus, FaTrash } from "react-icons/fa6";
import QuickView from "./QuickView";

interface ProductProps {
  product: Product;
  showQuantityControls?: boolean;
  enableCustomizations?: boolean;
  customizations?: CartItem["customizations"];
}

const ProductComponent: React.FC<ProductProps> = ({
  product,
  showQuantityControls = false,
  customizations,
}) => {
  const {
    addItem,
    removeItem,
    updateQuantity,
    isInCart,
    getItemQuantity,
    isLoading: cartLoading,
  } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  // Extract product properties
  const { id, name, price, description, images, badge, stock } = product;
  const inStock = stock === null || stock === undefined || stock > 0;
  const link = `/product/${product.slug}`;

  const itemIsInCart = isInCart(id);
  const cartQuantity = getItemQuantity(id, customizations);

  const formattedPrice = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

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
    if (!inStock || cartLoading) return;

    const loadingToast = showToast.loading("Adding to cart...");

    try {
      await addItem(product, quantity, customizations);

      toast.dismiss(loadingToast);
      showToast.addedToCart(name, quantity);

      setShowSuccess(true);
      setQuantity(1);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast.error("Failed to add item to cart");
      console.error("Error adding to cart:", error);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  const handleUpdateCartQuantity = async (newQuantity: number) => {
    const loadingToast = showToast.loading("Updating quantity...");

    try {
      await updateQuantity(id, newQuantity, customizations);

      toast.dismiss(loadingToast);
      showToast.quantityUpdated(name, newQuantity);
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast.error("Failed to update quantity");
      console.error("Error updating cart quantity:", error);
    }
  };

  const handleRemoveFromCart = async () => {
    const loadingToast = showToast.loading("Removing from cart...");

    try {
      await removeItem(id, customizations);

      toast.dismiss(loadingToast);
      showToast.removedFromCart(name);
    } catch (error) {
      toast.dismiss(loadingToast);
      showToast.error("Failed to remove item from cart");
      console.error("Error removing from cart:", error);
    }
  };

  const QuantityButton = ({
    onClick,
    disabled,
    children,
    className = "",
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-bg-alt border-border-light text-text-base hover:bg-bg flex h-6 w-6 items-center justify-center rounded-full border transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );

  const getStockDisplay = () => {
    if (stock === null || stock === undefined) return null;
    if (stock === 0) return "Out of Stock";
    if (stock <= 5) return `Only ${stock} left`;
    return null;
  };

  const stockDisplay = getStockDisplay();

  return (
    <div className="cake-card group border-border-light bg-bg-alt flex h-full flex-col rounded-lg border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="cake-card-image-link relative block overflow-hidden rounded-t-lg">
        <div className="bg-bg-overlay absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
        <img
          src={images[0]}
          alt={`${name} Cake`}
          className="aspect-[4/3] h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={handleImageError}
        />

        <div className="absolute top-3 right-3 z-20 flex translate-x-2 flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 pointer-coarse:opacity-100 pointer-fine:group-hover:opacity-100">
          <button
            onClick={() => setShowQuickView(true)}
            aria-label={`Quick view ${name}`}
            className="bg-bg-alt/90 text-text-muted hover:bg-primary cursor-pointer rounded-full p-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:text-white"
          >
            <FaEye className="h-4 w-4" />
          </button>
        </div>

        {itemIsInCart && (
          <div className="absolute top-3 left-3 z-20 animate-pulse">
            <span className="bg-primary rounded-full px-2 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
              In Cart: {cartQuantity}
            </span>
          </div>
        )}

        {!inStock && (
          <div className="bg-bg-overlay bg-opacity-60 absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-bg-alt font-Secondary text-primary border-border-light rounded-lg border px-4 py-2 shadow-xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="cake-card-content flex flex-1 flex-col p-4">
        <div className="mb-auto">
          <a href={link} className="group-hover:text-primary transition-colors">
            <h3 className="cake-card-title font-Secondary hover:text-primary mb-1 line-clamp-2 text-lg font-semibold transition-colors">
              {name}
            </h3>
          </a>

          <div className="mb-2 flex items-center justify-between">
            <p className="cake-card-price font-Secondary text-text-price text-lg font-bold">
              {formattedPrice}
            </p>
            {badge && (
              <Badge variant={getProductBadgeVariant(badge)} size="sm">
                {badge}
              </Badge>
            )}
          </div>

          {stockDisplay && (
            <div className="mb-2">
              <Badge
                variant={stock === 0 ? "danger" : "warning"}
                size="sm"
                pulse={stock === 0 || (stock !== null && stock <= 5)}
              >
                {stockDisplay}
              </Badge>
            </div>
          )}

          <p className="cake-card-desc text-text-muted mb-4 line-clamp-3 text-sm leading-relaxed">
            {description || "Delicious cake made with premium ingredients."}
          </p>
        </div>

        {showQuantityControls && !itemIsInCart && (
          <div className="bg-bg-cta/50 mb-3 flex items-center justify-center gap-3 rounded-lg p-2">
            <QuantityButton
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || cartLoading}
            >
              <FaMinus className="h-3 w-3" />
            </QuantityButton>
            <span className="text-text-base min-w-[2rem] text-center text-lg font-semibold">
              {quantity}
            </span>
            <QuantityButton
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={cartLoading}
            >
              <FaPlus className="h-3 w-3" />
            </QuantityButton>
          </div>
        )}

        {itemIsInCart ? (
          <div className="bg-bg-cta/70 border-border-light flex h-10 items-center justify-between rounded-lg border px-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <QuantityButton
                onClick={() => handleUpdateCartQuantity(cartQuantity - 1)}
                disabled={cartQuantity <= 1 || cartLoading}
              >
                <FaMinus className="h-3 w-3" />
              </QuantityButton>
              <span className="text-text-base min-w-[2rem] text-center font-semibold">
                {cartQuantity}
              </span>
              <QuantityButton
                onClick={() => handleUpdateCartQuantity(cartQuantity + 1)}
                disabled={cartLoading}
              >
                <FaPlus className="h-3 w-3" />
              </QuantityButton>
            </div>
            <QuantityButton
              onClick={handleRemoveFromCart}
              disabled={cartLoading}
              className="text-red-500 hover:bg-red-500 hover:text-white"
            >
              <FaTrash className="h-3 w-3" />
            </QuantityButton>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!inStock || cartLoading}
            className={`add-to-cart-btn group border-primary text-primary hover:bg-primary bg-bg-alt mt-auto flex h-10 w-full items-center justify-center rounded-lg border px-4 py-2 font-semibold transition-all duration-300 hover:text-white hover:shadow-lg ${
              !inStock || cartLoading ? "cursor-not-allowed opacity-50" : ""
            } ${
              showSuccess
                ? "border-green-500 bg-green-500/10 text-green-600 hover:bg-green-500"
                : ""
            }`}
          >
            {showSuccess ? (
              <>
                <FaCheck className="mr-2 h-4 w-4 animate-bounce" />
                Added to Cart
              </>
            ) : (
              <>
                <FaPlus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                {inStock
                  ? cartLoading
                    ? "Adding..."
                    : "Add to Cart"
                  : "Out of Stock"}
              </>
            )}
          </button>
        )}
      </div>

      {showQuickView && (
        <QuickView
          product={product}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </div>
  );
};

export default ProductComponent;
