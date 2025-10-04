import type { Cart, CartSummary } from "@/types/Cart.interface";
import { MdDiscount, MdLocalShipping } from "react-icons/md";

interface OrderSummaryProps {
  cart: Cart;
  summary: CartSummary;
  deliveryFee: number;
  finalTotal: number;
}

export function OrderSummary({
  cart,
  summary,
  deliveryFee,
  finalTotal,
}: OrderSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isEligibleForFreeShipping = deliveryFee === 0 && cart.subtotal >= 2000;

  return (
    <div className="bg-bg-alt border-border/20 sticky top-6 rounded-lg border p-6">
      <h3 className="font-Secondary mb-4 text-lg font-semibold">
        Order Summary
      </h3>

      <div className="mb-4 space-y-3">
        {cart.items.map((item, index) => (
          <div
            key={`${item.product.id}-${index}`}
            className="flex justify-between text-sm"
          >
            <span className="text-text-muted">
              {item.product.name} × {item.quantity}
            </span>
            <span className="text-text-base font-medium">
              {formatCurrency(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-border/20 space-y-3 border-t pt-4">
        <div className="flex justify-between">
          <span className="text-text-muted">Subtotal</span>
          <span className="text-text-base font-medium">
            {formatCurrency(cart.subtotal)}
          </span>
        </div>

        {cart.tax > 0 && (
          <div className="flex justify-between">
            <span className="text-text-muted">Tax</span>
            <span className="text-text-base font-medium">
              {formatCurrency(cart.tax)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MdLocalShipping className="text-text-muted h-4 w-4" />
            <span className="text-text-muted">Delivery</span>
          </div>
          <span className="text-text-base font-medium">
            {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
          </span>
        </div>

        {isEligibleForFreeShipping && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <MdDiscount className="h-4 w-4" />
            <span>Free delivery on orders over ৳2,000!</span>
          </div>
        )}

        <div className="border-border/20 border-t pt-3">
          <div className="flex justify-between">
            <span className="text-text-base font-semibold">Total</span>
            <span className="text-text-base text-lg font-bold">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-primary/10 mt-6 rounded-lg p-4">
        <h4 className="text-text-base mb-2 font-medium">Payment Method</h4>
        <div className="flex items-center gap-2">
          <div className="bg-primary h-3 w-3 rounded-full"></div>
          <span className="text-text-muted">Cash on Delivery</span>
        </div>
        <p className="text-text-muted mt-2 text-xs">
          Pay when your order is delivered to your doorstep
        </p>
      </div>

      <div className="text-text-muted mt-4 text-center text-sm">
        <p>
          {summary.itemCount} items • {summary.uniqueItems} products
        </p>
      </div>
    </div>
  );
}
