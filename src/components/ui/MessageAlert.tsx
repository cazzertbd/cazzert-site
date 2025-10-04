import React from "react";
import { MdCheckCircle, MdError, MdInfo, MdWarning } from "react-icons/md";

interface MessageAlertProps {
  type: "success" | "error" | "warning" | "info";
  message?: string;
  show: boolean;
  className?: string;
}

export const MessageAlert: React.FC<MessageAlertProps> = ({
  type,
  message,
  show,
  className = "",
}) => {
  if (!show || !message) return null;

  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300";
      case "error":
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300";
      default:
        return "bg-bg-alt border-border text-text-base";
    }
  };

  const getIcon = () => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "success":
        return (
          <MdCheckCircle
            className={`${iconClass} text-green-600 dark:text-green-400`}
          />
        );
      case "error":
        return (
          <MdError className={`${iconClass} text-red-600 dark:text-red-400`} />
        );
      case "warning":
        return (
          <MdWarning
            className={`${iconClass} text-yellow-600 dark:text-yellow-400`}
          />
        );
      case "info":
        return (
          <MdInfo className={`${iconClass} text-blue-600 dark:text-blue-400`} />
        );
      default:
        return <MdInfo className={`${iconClass} text-text-muted`} />;
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getAlertStyles()} ${className}`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};
