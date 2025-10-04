import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [isOpen]);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-[95vw]",
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`bg-bg-alt border-border/20 relative w-full rounded-2xl border shadow-2xl transition-all ${sizeClasses[size]} ${className}`}
        style={{
          animation: isOpen ? "modalSlideIn 0.3s ease-out" : undefined,
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="border-border/20 flex items-center justify-between border-b px-6 py-4">
            {title && (
              <h2
                id="modal-title"
                className="text-text-base font-Secondary text-xl font-semibold"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-text-muted hover:bg-bg hover:text-text-base -mr-2 rounded-full p-2 transition-colors"
                aria-label="Close modal"
              >
                <MdClose className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );

  // Use React Portal to render modal at document root
  return createPortal(modalContent, document.body);
}

// Add these styles to your global.css
export const modalStyles = `
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
`;
