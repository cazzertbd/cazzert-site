import { Badge, getProductBadgeVariant } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/format";
import { MdDelete, MdEdit, MdImage } from "react-icons/md";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  weight?: number;
  stock?: number;
  badge?: "BESTSELLER" | "NEW" | "LIMITED" | "SEASONAL" | "FEATURED";
  description?: string;
  details: string[];
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (loading) {
    return (
      <div className="border-border/20 bg-bg rounded-lg border">
        <div className="p-8 text-center">
          <div className="border-primary/20 border-t-primary mx-auto h-8 w-8 animate-spin rounded-full border-4"></div>
          <p className="text-text-muted mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border-border/20 bg-bg rounded-lg border">
        <div className="p-8 text-center">
          <MdImage className="text-text-muted mx-auto h-12 w-12" />
          <h3 className="text-text-base mt-4 text-lg font-medium">
            No products found
          </h3>
          <p className="text-text-muted mt-2">
            Try adjusting your filters or create a new product.
          </p>
        </div>
      </div>
    );
  }

  const getStockStatus = (stock?: number) => {
    if (stock === undefined || stock === null) {
      return { text: "Unlimited", variant: "secondary" as const };
    }
    if (stock === 0) {
      return { text: "Out of Stock", variant: "danger" as const };
    }
    if (stock <= 10) {
      return { text: `${stock} left`, variant: "warning" as const };
    }
    return { text: `${stock} in stock`, variant: "success" as const };
  };

  return (
    <div className="border-border/20 bg-bg overflow-hidden rounded-lg border">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="divide-border/20 w-full divide-y">
          <thead className="bg-bg-alt">
            <tr>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Product
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Category
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Price
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Stock
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Badge
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Updated
              </th>
              <th className="text-text-muted px-6 py-3 text-right text-xs font-medium tracking-wider uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-border/10 divide-y">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);

              return (
                <tr
                  key={product.id}
                  className="hover:bg-bg-alt/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                        {product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="bg-bg-alt flex h-full w-full items-center justify-center">
                            <MdImage className="text-text-muted h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-text-base font-medium">
                          {product.name}
                        </div>
                        <div className="text-text-muted text-sm">
                          {product.weight ? `${product.weight}g` : "No weight"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-text-base text-sm">
                      {product.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-text-base font-medium">
                      {formatCurrency(product.price)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={stockStatus.variant} size="sm">
                      {stockStatus.text}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {product.badge ? (
                      <Badge
                        variant={getProductBadgeVariant(product.badge)}
                        size="sm"
                      >
                        {product.badge}
                      </Badge>
                    ) : (
                      <span className="text-text-muted text-sm">None</span>
                    )}
                  </td>
                  <td className="text-text-muted px-6 py-4 text-sm">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <MdEdit
                        onClick={() => onEdit(product)}
                        className="hover:text-primary hover:bg-primary/20 h-7 w-7 cursor-pointer rounded-full p-1 transition-colors"
                      />
                      <MdDelete
                        onClick={() => onDelete(product)}
                        className="hover:text-primary hover:bg-primary/20 h-7 w-7 cursor-pointer rounded-full p-1 transition-colors"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 p-4 md:hidden">
        {products.map((product) => {
          const stockStatus = getStockStatus(product.stock);

          return (
            <div
              key={product.id}
              className="border-border/20 bg-bg space-y-3 rounded-lg border p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="bg-bg-alt flex h-full w-full items-center justify-center">
                        <MdImage className="text-text-muted h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-text-base font-medium">
                      {product.name}
                    </h3>
                    <p className="text-text-muted text-sm">
                      {product.category.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MdEdit
                    onClick={() => onEdit(product)}
                    className="hover:text-primary hover:bg-primary/20 h-7 w-7 cursor-pointer rounded-full p-1 transition-colors"
                  />
                  <MdDelete
                    onClick={() => onDelete(product)}
                    className="hover:text-primary hover:bg-primary/20 h-7 w-7 cursor-pointer rounded-full p-1 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted">Price:</span>
                  <span className="text-text-base ml-2 font-medium">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-text-muted">Stock:</span>
                  <div className="ml-2">
                    <Badge variant={stockStatus.variant} size="sm">
                      {stockStatus.text}
                    </Badge>
                  </div>
                </div>
                {product.weight && (
                  <div>
                    <span className="text-text-muted">Weight:</span>
                    <span className="text-text-base ml-2">
                      {product.weight}g
                    </span>
                  </div>
                )}
                {product.badge && (
                  <div className="flex items-center">
                    <span className="text-text-muted">Badge:</span>
                    <div className="ml-2">
                      <Badge
                        variant={getProductBadgeVariant(product.badge)}
                        size="sm"
                      >
                        {product.badge}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-text-muted text-xs">
                Updated {new Date(product.updatedAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
