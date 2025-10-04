import type { Product } from "@/lib/prisma";

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
  customizations?: {
    size?: "small" | "medium" | "large";
    message?: string;
    specialInstructions?: string;
  };
}

export interface Cart {
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  subtotal: number;
  tax: number;
  total: number;
}

export interface CartSummary {
  itemCount: number;
  uniqueItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface CartStorageData {
  items: Array<{
    product: Product;
    quantity: number;
    addedAt: string;
    customizations?: CartItem["customizations"];
  }>;
  createdAt: string;
  updatedAt: string;
}
