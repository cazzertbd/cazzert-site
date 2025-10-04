import toast from "react-hot-toast";

// Custom toast styles that match your theme
export const toastConfig = {
  duration: 3000,
  position: "top-right" as const,

  // Custom styles for different toast types
  success: {
    style: {
      background: "var(--bg-alt)",
      color: "var(--text-base)",
      border: "1px solid var(--border-light)",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      fontSize: "14px",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "var(--primary)",
      secondary: "var(--bg-alt)",
    },
  },
  error: {
    style: {
      background: "var(--bg-alt)",
      color: "var(--text-base)",
      border: "1px solid #ef4444",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      fontSize: "14px",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "#ef4444",
      secondary: "var(--bg-alt)",
    },
  },
  loading: {
    style: {
      background: "var(--bg-alt)",
      color: "var(--text-base)",
      border: "1px solid var(--border-light)",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      fontSize: "14px",
      fontWeight: "500",
    },
  },
};

// Custom toast functions
export const showToast = {
  success: (message: string) => {
    toast.success(message, toastConfig.success);
  },

  error: (message: string) => {
    toast.error(message, toastConfig.error);
  },

  loading: (message: string) => {
    return toast.loading(message, toastConfig.loading);
  },

  // Cart-specific toast messages
  addedToCart: (productName: string, quantity: number = 1) => {
    toast.success(
      `${quantity > 1 ? `${quantity} × ` : ""}${productName} added to cart`,
      toastConfig.success,
    );
  },

  removedFromCart: (productName: string) => {
    toast.success(`${productName} removed from cart`, toastConfig.success);
  },

  quantityUpdated: (productName: string, quantity: number) => {
    toast.success(
      `${productName} quantity updated to ${quantity}`,
      toastConfig.success,
    );
  },

  cartCleared: () => {
    toast.success("Cart cleared successfully", toastConfig.success);
  },
};

export default showToast;
