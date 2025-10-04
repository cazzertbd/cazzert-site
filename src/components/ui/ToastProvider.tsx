import { toastConfig } from "@/utils/toastConfig";
import React from "react";
import { Toaster } from "react-hot-toast";

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position={toastConfig.position}
      gutter={8}
      containerClassName="toast-container"
      containerStyle={{
        top: 20,
        left: 20,
        bottom: 20,
        right: 20,
      }}
      toastOptions={{
        // Global toast options
        duration: toastConfig.duration,
        style: {
          background: "var(--bg-alt)",
          color: "var(--text-base)",
          border: "1px solid var(--border-light)",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          fontSize: "14px",
          fontWeight: "500",
          maxWidth: "500px",
        },
        // Success toast styling
        success: toastConfig.success,
        // Error toast styling
        error: toastConfig.error,
        // Loading toast styling
        loading: toastConfig.loading,
      }}
    />
  );
};

export default ToastProvider;
