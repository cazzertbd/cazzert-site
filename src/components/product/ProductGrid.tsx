import ProductComponent from "@/components/product/Product";
import type { Product } from "@/lib/prisma";
import React from "react";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-bg-alt mb-3 aspect-square rounded-lg"></div>
            <div className="space-y-2">
              <div className="bg-bg-alt h-4 w-3/4 rounded"></div>
              <div className="bg-bg-alt h-3 w-1/2 rounded"></div>
              <div className="bg-bg-alt h-6 w-1/4 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="transition-transform hover:scale-[1.02]"
        >
          <ProductComponent product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
