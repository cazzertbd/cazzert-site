import { Button } from "@/components/ui/Button";
import type { CartItem } from "@/types/Cart.interface";
import { MdAdd, MdDelete, MdRemove } from "react-icons/md";

interface CartItemComponentProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  isLoading?: boolean;
}

export function CartItemComponent({
  item,
  onUpdateQuantity,
  onRemove,
  isLoading = false,
}: CartItemComponentProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate item subtotal
  const subtotal = item.product.price * item.quantity;

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

  return (
    <div className="border-border/20 flex items-center gap-4 rounded-lg border p-4">
      <img
        src={item.product.images[0]}
        alt={item.product.name}
        className="h-16 w-16 rounded-lg object-cover"
        onError={handleImageError}
      />

      <div className="flex-1">
        <h3 className="text-text-base font-medium">{item.product.name}</h3>
        <p className="text-text-muted text-sm">
          {formatCurrency(item.product.price)} each
        </p>

        {/* Display customizations */}
        {item.customizations && (
          <div className="text-text-muted mt-1 space-y-1 text-xs italic">
            {item.customizations.size && (
              <p>Size: {item.customizations.size}</p>
            )}
            {item.customizations.message && (
              <p>Message: "{item.customizations.message}"</p>
            )}
            {item.customizations.specialInstructions && (
              <p>Special: "{item.customizations.specialInstructions}"</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          iconOnly
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          disabled={isLoading || item.quantity <= 1}
        >
          <MdRemove className="h-4 w-4" />
        </Button>

        <span className="w-8 text-center font-medium">{item.quantity}</span>

        <Button
          variant="outline"
          size="sm"
          iconOnly
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          disabled={isLoading}
        >
          <MdAdd className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-right">
        <p className="text-text-base font-semibold">
          {formatCurrency(subtotal)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        iconOnly
        onClick={onRemove}
        className="text-red-600 hover:text-red-700"
        disabled={isLoading}
      >
        <MdDelete className="h-4 w-4" />
      </Button>
    </div>
  );
}
