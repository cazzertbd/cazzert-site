import type { Product } from "@/lib/prisma";
import type { Cart, CartItem, CartSummary } from "@/types/Cart.interface";
import { CartUtils } from "@/utils/CartUtils";
import { useCallback, useEffect, useState } from "react";

export const useCart = () => {
  const [cart, setCart] = useState<Cart>(() => {
    // Initialize with empty cart for SSR safety
    if (typeof window === "undefined") {
      const now = new Date();
      return {
        items: [],
        createdAt: now,
        updatedAt: now,
        subtotal: 0,
        tax: 0,
        total: 0,
      };
    }
    return CartUtils.getCart();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart on client side
  useEffect(() => {
    const initializeCart = () => {
      if (typeof window !== "undefined") {
        setCart(CartUtils.getCart());
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, []);

  // Listen for cart updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCartUpdate = (event: CustomEvent<Cart>) => {
      setCart(event.detail);
    };

    CartUtils.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      CartUtils.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const addItem = useCallback(
    async (
      product: Product,
      quantity: number = 1,
      customizations?: CartItem["customizations"],
    ) => {
      if (typeof window === "undefined") return cart;

      setIsLoading(true);
      try {
        const updatedCart = CartUtils.addItem(
          product,
          quantity,
          customizations,
        );
        setCart(updatedCart);
        return updatedCart;
      } finally {
        setIsLoading(false);
      }
    },
    [cart],
  );

  const removeItem = useCallback(
    async (productId: string, customizations?: CartItem["customizations"]) => {
      if (typeof window === "undefined") return cart;

      setIsLoading(true);
      try {
        const updatedCart = CartUtils.removeItem(productId, customizations);
        setCart(updatedCart);
        return updatedCart;
      } finally {
        setIsLoading(false);
      }
    },
    [cart],
  );

  const updateQuantity = useCallback(
    async (
      productId: string,
      quantity: number,
      customizations?: CartItem["customizations"],
    ) => {
      if (typeof window === "undefined") return cart;

      setIsLoading(true);
      try {
        const updatedCart = CartUtils.updateQuantity(
          productId,
          quantity,
          customizations,
        );
        setCart(updatedCart);
        return updatedCart;
      } finally {
        setIsLoading(false);
      }
    },
    [cart],
  );

  const clearCart = useCallback(async () => {
    if (typeof window === "undefined") return cart;

    setIsLoading(true);
    try {
      const emptyCart = CartUtils.clearCart();
      setCart(emptyCart);
      return emptyCart;
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const summary: CartSummary = {
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    uniqueItems: cart.items.length,
    subtotal: cart.subtotal,
    tax: cart.tax,
    total: cart.total,
  };

  const isInCart = useCallback(
    (productId: string): boolean => {
      if (!isInitialized) return false;
      return CartUtils.isInCart(productId);
    },
    [isInitialized],
  );

  const getItemQuantity = useCallback(
    (
      productId: string,
      customizations?: CartItem["customizations"],
    ): number => {
      if (!isInitialized) return 0;
      return CartUtils.getItemQuantity(productId, customizations);
    },
    [isInitialized],
  );

  const isEligibleForFreeShipping = useCallback((): boolean => {
    if (!isInitialized) return false;
    return CartUtils.isEligibleForFreeShipping();
  }, [isInitialized]);

  const getAmountForFreeShipping = useCallback((): number => {
    if (!isInitialized) return 0;
    return CartUtils.getAmountForFreeShipping();
  }, [isInitialized]);

  const getShippingCost = useCallback((): number => {
    if (!isInitialized) return 0;
    return CartUtils.getShippingCost(cart.subtotal);
  }, [cart.subtotal, isInitialized]);

  return {
    cart,
    summary,
    isLoading,
    isInitialized,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    isEligibleForFreeShipping,
    getAmountForFreeShipping,
    getShippingCost,
  };
};
