import { useNavigation } from "@/contexts/NavigationContext";
import { useCart } from "@/hooks/useCart";
import { useEffect, useRef, useState } from "react";
import { HiMinus, HiPlus, HiTrash, HiX } from "react-icons/hi";
import { MdLocalShipping, MdShoppingBag } from "react-icons/md";
import "./cart.css";

export function CartSidebar() {
  const { isCartOpen, closeCart } = useNavigation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isClient, setIsClient] = useState(false);

  const {
    cart,
    summary,
    isLoading,
    removeItem,
    updateQuantity,
    clearCart,
    isEligibleForFreeShipping,
    getAmountForFreeShipping,
  } = useCart();

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Focus management
  useEffect(() => {
    if (isCartOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 150);
    }
  }, [isCartOpen]);

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number,
    customizations?: any,
  ) => {
    if (newQuantity <= 0) {
      await removeItem(productId, customizations);
    } else {
      await updateQuantity(productId, newQuantity, customizations);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
    }).format(price);
  };

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

  // Only calculate these after client hydration
  const freeShippingAmount = isClient ? getAmountForFreeShipping() : 0;
  const isEligibleFreeShipping = isClient ? isEligibleForFreeShipping() : false;
  const hasItems = isClient && cart.items.length > 0;
  const itemCount = isClient ? summary.itemCount : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Cart Sidebar */}
      <aside
        className={`bg-bg-alt border-border/20 fixed top-0 right-0 z-50 flex w-96 max-w-[90vw] flex-col border-l shadow-2xl transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        } h-[calc(100vh-4rem)] md:h-screen`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Header */}
        <header className="border-border/30 flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <MdShoppingBag className="text-primary h-6 w-6" />
            <h2 id="cart-title" className="text-lg font-semibold">
              Shopping Cart
            </h2>
            {itemCount > 0 && (
              <span className="bg-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            onClick={closeCart}
            className="text-text-muted hover:bg-primary/10 hover:text-primary rounded-full p-2.5 transition-colors"
            aria-label="Close cart"
          >
            <HiX className="h-5 w-5" />
          </button>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {!hasItems ? (
            /* Empty State - Always render this first to match server */
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="bg-bg-cta mb-4 rounded-full p-6">
                <MdShoppingBag className="text-primary h-12 w-12" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Your cart is empty</h3>
              <p className="text-text-muted mb-6 text-sm">
                Add some delicious cakes to get started!
              </p>
              <button
                onClick={closeCart}
                className="bg-primary hover:bg-primary-dark rounded-lg px-6 py-3 font-medium text-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* Cart Items - Only render after client hydration */
            <>
              {/* Free Shipping Progress */}
              {!isEligibleFreeShipping && (
                <div className="border-border/20 bg-bg-cta/30 border-b px-6 py-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">Free shipping progress</span>
                    <span className="text-text-muted">
                      {formatPrice(freeShippingAmount)} to go
                    </span>
                  </div>
                  <div className="bg-border/30 h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{
                        width: `${Math.min((cart.subtotal / (cart.subtotal + freeShippingAmount)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-text-muted mt-2 text-xs">
                    Add {formatPrice(freeShippingAmount)} more for free shipping
                  </p>
                </div>
              )}

              {isEligibleFreeShipping && (
                <div className="border-border/20 border-b bg-green-50 px-6 py-3">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <MdLocalShipping className="h-4 w-4" />
                    <span className="font-medium">
                      🎉 You qualify for free shipping!
                    </span>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {cart.items.map((item) => {
                    const productImage =
                      item.product.images?.[0] ||
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMyNCAyOC42ODYzIDI2LjY4NjMgMjYgMzAgMjZIMzRDMzcuMzEzNyAyNiA0MCAyOC42ODYzIDQwIDMyVjM2QzQwIDM5LjMxMzcgMzcuMzEzNyA0MiAzNCA0MkgzMEMyNi42ODYzIDQyIDI0IDM5LjMxMzcgMjQgMzZWMzJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yOCAzMEgyOFYzNEgzNlYzMEgzNk0zMiAzNEwzMCAzNkgzNEwzMiAzNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=";
                    const itemTotal = item.product.price * item.quantity;

                    return (
                      <div
                        key={`${item.product.id}-${JSON.stringify(item.customizations || {})}`}
                        className="border-border/20 bg-bg flex gap-4 rounded-lg border p-4"
                      >
                        {/* Image */}
                        <img
                          src={productImage}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                          onError={handleImageError}
                        />

                        {/* Details */}
                        <div className="flex flex-1 flex-col">
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="line-clamp-1 font-medium">
                                {item.product.name}
                              </h4>
                              {item.customizations &&
                                Object.keys(item.customizations).length > 0 && (
                                  <div className="mt-1">
                                    {Object.entries(item.customizations).map(
                                      ([key, value]) => (
                                        <span
                                          key={key}
                                          className="text-text-muted block text-xs capitalize"
                                        >
                                          {key}: {String(value)}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}
                            </div>
                            <button
                              onClick={() =>
                                removeItem(item.product.id, item.customizations)
                              }
                              disabled={isLoading}
                              className="text-text-muted rounded-full p-1 transition-colors hover:bg-red-50 hover:text-red-500"
                              aria-label={`Remove ${item.product.name} from cart`}
                            >
                              <HiTrash className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Quantity & Price */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product.id,
                                    item.quantity - 1,
                                    item.customizations,
                                  )
                                }
                                disabled={isLoading || item.quantity <= 1}
                                className="border-border/30 hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:opacity-50"
                              >
                                <HiMinus className="h-3 w-3" />
                              </button>

                              <span className="min-w-[2rem] text-center text-sm font-medium">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product.id,
                                    item.quantity + 1,
                                    item.customizations,
                                  )
                                }
                                disabled={isLoading}
                                className="border-border/30 hover:border-primary/30 hover:bg-primary/10 hover:text-primary flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:opacity-50"
                              >
                                <HiPlus className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="font-semibold">
                                {formatPrice(itemTotal)}
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-text-muted text-xs">
                                  {formatPrice(item.product.price)} each
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Clear Cart */}
                {cart.items.length > 1 && (
                  <button
                    onClick={clearCart}
                    disabled={isLoading}
                    className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Summary */}
              <div className="border-border/30 bg-bg-alt border-t p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">
                      Subtotal ({summary.itemCount} items)
                    </span>
                    <span className="font-medium">
                      {formatPrice(summary.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Tax</span>
                    <span className="font-medium">
                      {formatPrice(summary.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Shipping</span>
                    <span className="font-medium">
                      {isEligibleFreeShipping
                        ? "Free"
                        : "Calculated at checkout"}
                    </span>
                  </div>
                  <div className="border-border/20 border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-primary text-lg font-bold">
                        {formatPrice(summary.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="bg-primary hover:bg-primary-dark mt-6 w-full rounded-lg px-6 py-4 font-semibold text-white transition-colors disabled:opacity-50"
                  disabled={isLoading}
                  onClick={() => {
                    // go to /checkout
                    window.location.href = "/checkout";
                    closeCart();
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
