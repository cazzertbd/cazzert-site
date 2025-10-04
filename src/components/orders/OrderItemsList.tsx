interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customization?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

interface OrderItemsListProps {
  items: OrderItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (!target.src.includes("data:image")) {
      target.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMyNCAyOC42ODYzIDI2LjY4NjMgMjYgMzAgMjZIMzRDMzcuMzEzNyAyNiA0MCAyOC42ODYzIDQwIDMyVjM2QzQwIDM5LjMxMzcgMzcuMzEzNyA0MiAzNCA0MkgzMEMyNi42ODYzIDQyIDI0IDM5LjMxMzcgMjQgMzZWMzJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yOCAzMEgyOFYzNEgzNlYzMEgzNk0zMiAzNEwzMCAzNkgzNEwzMiAzNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=";
      target.alt = "Product image unavailable";
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="border-border/20 flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
        >
          <div className="flex items-center gap-4">
            {item.product.images[0] && (
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="h-16 w-16 rounded-lg object-cover"
                onError={handleImageError}
              />
            )}
            <div>
              <h4 className="text-text-base font-medium">
                {item.product.name}
              </h4>
              <p className="text-text-muted text-sm">
                {formatCurrency(item.unitPrice)} × {item.quantity}
              </p>
              {item.customization && (
                <p className="text-text-muted mt-1 text-xs italic">
                  "{item.customization}"
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-text-base font-semibold">
              {formatCurrency(item.subtotal)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
