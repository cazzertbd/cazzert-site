import type {
  Cart,
  CartItem,
  CartStorageData,
  CartSummary,
} from "@/types/Cart.interface";
import type { Product } from "@/types/Product.interface";

export class CartUtils {
  private static readonly STORAGE_KEY = "cazzert_cart";
  private static readonly TAX_RATE = 0.15; // 15% tax rate
  private static readonly FREE_SHIPPING_THRESHOLD = 10000;

  // Event system for cart updates
  private static eventTarget: EventTarget | null = null;

  // Initialize event target only in browser
  private static getEventTarget(): EventTarget | null {
    if (typeof window === "undefined") return null;
    if (!this.eventTarget) {
      this.eventTarget = new EventTarget();
    }
    return this.eventTarget;
  }

  // Helper to check if we're in the browser
  private static isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  /**
   * Get the current cart from localStorage
   */
  static getCart(): Cart {
    try {
      if (!this.isBrowser()) {
        return this.createEmptyCart();
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.createEmptyCart();
      }

      const data: CartStorageData = JSON.parse(stored);

      // Convert stored data back to Cart format
      const cart: Cart = {
        items: data.items.map((item) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        })),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        subtotal: 0,
        tax: 0,
        total: 0,
      };

      // Recalculate totals
      return this.calculateTotals(cart);
    } catch (error) {
      console.error("Error loading cart from storage:", error);
      return this.createEmptyCart();
    }
  }

  /**
   * Save cart to localStorage
   */
  static saveCart(cart: Cart): void {
    try {
      if (!this.isBrowser()) {
        return;
      }

      const dataToStore: CartStorageData = {
        items: cart.items.map((item) => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
        })),
        createdAt: cart.createdAt.toISOString(),
        updatedAt: cart.updatedAt.toISOString(),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToStore));

      // Update legacy cart count for backward compatibility
      localStorage.setItem(
        "cartCount",
        cart.items.reduce((sum, item) => sum + item.quantity, 0).toString(),
      );

      // Dispatch cart update event
      this.dispatchCartUpdate(cart);
    } catch (error) {
      console.error("Error saving cart to storage:", error);
    }
  }

  /**
   * Add item to cart
   */
  static addItem(
    product: Product,
    quantity: number = 1,
    customizations?: CartItem["customizations"],
  ): Cart {
    const cart = this.getCart();

    // Check if item already exists (considering customizations)
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.id === product.id &&
        this.areCustomizationsEqual(item.customizations, customizations),
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        product,
        quantity,
        addedAt: new Date(),
        customizations,
      };
      cart.items.push(newItem);
    }

    cart.updatedAt = new Date();
    const updatedCart = this.calculateTotals(cart);
    this.saveCart(updatedCart);

    return updatedCart;
  }

  /**
   * Remove item from cart
   */
  static removeItem(
    productId: string,
    customizations?: CartItem["customizations"],
  ): Cart {
    const cart = this.getCart();

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.id === productId &&
          this.areCustomizationsEqual(item.customizations, customizations)
        ),
    );

    cart.updatedAt = new Date();
    const updatedCart = this.calculateTotals(cart);
    this.saveCart(updatedCart);

    return updatedCart;
  }

  /**
   * Update item quantity
   */
  static updateQuantity(
    productId: string,
    quantity: number,
    customizations?: CartItem["customizations"],
  ): Cart {
    if (quantity <= 0) {
      return this.removeItem(productId, customizations);
    }

    const cart = this.getCart();
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.id === productId &&
        this.areCustomizationsEqual(item.customizations, customizations),
    );

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity = quantity;
      cart.updatedAt = new Date();
    }

    const updatedCart = this.calculateTotals(cart);
    this.saveCart(updatedCart);

    return updatedCart;
  }

  /**
   * Clear entire cart
   */
  static clearCart(): Cart {
    const emptyCart = this.createEmptyCart();
    this.saveCart(emptyCart);
    return emptyCart;
  }

  /**
   * Get cart summary
   */
  static getCartSummary(): CartSummary {
    const cart = this.getCart();

    return {
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      uniqueItems: cart.items.length,
      subtotal: cart.subtotal,
      tax: cart.tax,
      total: cart.total,
    };
  }

  /**
   * Check if product is in cart
   */
  static isInCart(productId: string): boolean {
    const cart = this.getCart();
    return cart.items.some((item) => item.product.id === productId);
  }

  /**
   * Get item quantity in cart
   */
  static getItemQuantity(
    productId: string,
    customizations?: CartItem["customizations"],
  ): number {
    const cart = this.getCart();
    const item = cart.items.find(
      (item) =>
        item.product.id === productId &&
        this.areCustomizationsEqual(item.customizations, customizations),
    );
    return item ? item.quantity : 0;
  }

  /**
   * Calculate shipping cost
   */
  static getShippingCost(subtotal: number): number {
    if (subtotal >= this.FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    return 5.99; // Standard shipping rate
  }

  /**
   * Check if eligible for free shipping
   */
  static isEligibleForFreeShipping(): boolean {
    const cart = this.getCart();
    return cart.subtotal >= this.FREE_SHIPPING_THRESHOLD;
  }

  /**
   * Get amount needed for free shipping
   */
  static getAmountForFreeShipping(): number {
    const cart = this.getCart();
    const remaining = this.FREE_SHIPPING_THRESHOLD - cart.subtotal;
    return Math.max(0, remaining);
  }

  /**
   * Export cart data (for checkout, etc.)
   */
  static exportCartData(): CartStorageData {
    const cart = this.getCart();
    return {
      items: cart.items.map((item) => ({
        ...item,
        addedAt: item.addedAt.toISOString(),
      })),
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
    };
  }

  /**
   * Import cart data (from backup, etc.)
   */
  static importCartData(data: CartStorageData): Cart {
    try {
      if (!this.isBrowser()) {
        return this.createEmptyCart();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return this.getCart();
    } catch (error) {
      console.error("Error importing cart data:", error);
      return this.createEmptyCart();
    }
  }

  /**
   * Add event listener for cart updates
   */
  static addEventListener(
    type: "cartUpdated",
    listener: (event: CustomEvent<Cart>) => void,
  ): void {
    const eventTarget = this.getEventTarget();
    if (eventTarget) {
      eventTarget.addEventListener(type, listener as EventListener);
    }
  }

  /**
   * Remove event listener
   */
  static removeEventListener(
    type: "cartUpdated",
    listener: (event: CustomEvent<Cart>) => void,
  ): void {
    const eventTarget = this.getEventTarget();
    if (eventTarget) {
      eventTarget.removeEventListener(type, listener as EventListener);
    }
  }

  // Private helper methods

  private static createEmptyCart(): Cart {
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

  private static calculateTotals(cart: Cart): Cart {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax;

    return {
      ...cart,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  private static areCustomizationsEqual(
    a?: CartItem["customizations"],
    b?: CartItem["customizations"],
  ): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;

    return (
      a.size === b.size &&
      a.message === b.message &&
      a.specialInstructions === b.specialInstructions
    );
  }

  private static dispatchCartUpdate(cart: Cart): void {
    const eventTarget = this.getEventTarget();
    if (eventTarget) {
      const event = new CustomEvent("cartUpdated", { detail: cart });
      eventTarget.dispatchEvent(event);
    }

    // Also dispatch on document for backward compatibility (only in browser)
    if (this.isBrowser()) {
      document.dispatchEvent(
        new CustomEvent("cartUpdated", {
          detail: {
            count: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            items: cart.items,
            cart: cart,
          },
        }),
      );
    }
  }
}

// Export a default instance for convenience
export default CartUtils;
