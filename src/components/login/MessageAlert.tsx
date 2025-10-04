import { FaCheckCircle } from "react-icons/fa";
import { MdError, MdInfo, MdWarning } from "react-icons/md";

export function MessageAlert({
  type = "info",
  message,
  show = true,
  className = "",
}: {
  type?: "success" | "error" | "warning" | "info";
  message?: string;
  show?: boolean;
  className?: string;
}) {
  if (!show || !message) return null;

  const styles = {
    success: {
      container:
        "bg-bg-feature-card border-l-4 border-green-500 shadow-md ring-1 ring-green-500/20",
      icon: "text-green-600 dark:text-green-400",
      text: "text-text-base",
    },
    error: {
      container:
        "bg-bg-feature-card border-l-4 border-red-500 shadow-md ring-1 ring-red-500/20",
      icon: "text-red-600 dark:text-red-400",
      text: "text-text-base",
    },
    warning: {
      container:
        "bg-bg-feature-card border-l-4 border-amber-500 shadow-md ring-1 ring-amber-500/20",
      icon: "text-amber-600 dark:text-amber-400",
      text: "text-text-base",
    },
    info: {
      container:
        "bg-bg-feature-card border-l-4 border-primary shadow-md ring-1 ring-primary/20",
      icon: "text-primary",
      text: "text-text-base",
    },
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="h-5 w-5" />;
      case "error":
        return <MdError className="h-5 w-5" />;
      case "warning":
        return <MdWarning className="h-5 w-5" />;
      case "info":
      default:
        return <MdInfo className="h-5 w-5" />;
    }
  };

  const style = styles[type];

  return (
    <div
      className={`alert-message rounded-lg p-4 transition-all duration-200 ${style.container} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${style.icon}`}>{getIcon()}</div>
        <div className="flex-1">
          <p className={`text-sm leading-relaxed font-medium ${style.text}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
