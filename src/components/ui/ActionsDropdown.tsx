import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdMoreVert } from "react-icons/md";

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}

interface ActionsDropdownProps {
  actions: ActionItem[];
  isLoading?: boolean;
}

export function ActionsDropdown({
  actions,
  isLoading = false,
}: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      const dropdownHeight = 100;
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenUpward =
        spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setPosition({
        top: shouldOpenUpward
          ? rect.top + scrollTop - dropdownHeight
          : rect.bottom + scrollTop + 8,
        left: Math.max(rect.right + scrollLeft - 192, 16),
      });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: ActionItem) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    action.onClick();
  };

  const dropdownContent =
    isOpen && typeof document !== "undefined" ? (
      <>
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        <div
          ref={dropdownRef}
          className="bg-bg-alt border-border/20 fixed z-50 w-48 rounded-lg border py-1 shadow-xl"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={handleActionClick(action)}
              disabled={action.disabled || isLoading}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                action.variant === "danger"
                  ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "text-text-muted hover:bg-primary/5 hover:text-primary"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="text-text-muted hover:bg-bg hover:text-text-base rounded p-1 transition-colors"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        <MdMoreVert className="h-4 w-4" />
      </button>

      {dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
}
