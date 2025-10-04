import {
  MdCancel,
  MdCheck,
  MdLocalShipping,
  MdSchedule,
  MdStore,
} from "react-icons/md";

interface OrderTimelineProps {
  currentStatus: string;
  orderDate: string;
}

interface TimelineStep {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: "PENDING",
    title: "Order Received",
    icon: MdSchedule,
    description: "Order placed and received",
  },
  {
    key: "CONFIRMED",
    title: "Order Confirmed",
    icon: MdCheck,
    description: "Order confirmed and in queue",
  },
  {
    key: "PREPARING",
    title: "Preparing",
    icon: MdStore,
    description: "Your cakes are being prepared",
  },
  {
    key: "READY",
    title: "Ready",
    icon: MdCheck,
    description: "Order ready for pickup/delivery",
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    icon: MdLocalShipping,
    description: "Order delivered successfully",
  },
];

const STATUS_ORDER = [
  "PENDING",
  "CONFIRMED",
  "PAID",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
];

export function OrderTimeline({
  currentStatus,
  orderDate,
}: OrderTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  const getStepStatus = (stepKey: string, _index: number) => {
    if (isCancelled && stepKey !== "PENDING") {
      return "cancelled";
    }

    const stepIndex = STATUS_ORDER.indexOf(stepKey);

    if (stepIndex <= currentIndex) {
      return "completed";
    } else if (stepIndex === currentIndex + 1) {
      return "current";
    } else {
      return "pending";
    }
  };

  return (
    <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
      <h3 className="font-Secondary mb-6 text-lg font-semibold">
        Order Progress
      </h3>

      <div className="relative">
        {/* Cancelled Status */}
        {isCancelled && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <MdCancel className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-400">
                  Order Cancelled
                </p>
                <p className="text-sm text-red-600 dark:text-red-500">
                  This order has been cancelled and will not be processed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-6">
          {TIMELINE_STEPS.map((step, index) => {
            const status = getStepStatus(step.key, index);
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-start gap-4">
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      status === "completed"
                        ? "border-green-500 bg-green-500 text-white"
                        : status === "current"
                          ? "border-primary bg-primary text-white"
                          : status === "cancelled"
                            ? "border-gray-300 bg-gray-100 text-gray-400"
                            : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {status === "completed" ? (
                      <MdCheck className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Connecting Line */}
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`absolute top-10 left-1/2 h-6 w-0.5 -translate-x-1/2 ${
                        status === "completed" && !isCancelled
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-medium ${
                        status === "completed" || status === "current"
                          ? "text-text-base"
                          : "text-text-muted"
                      }`}
                    >
                      {step.title}
                    </h4>
                    {status === "completed" && step.key === "PENDING" && (
                      <span className="text-text-muted text-sm">
                        {new Date(orderDate).toLocaleDateString("en-BD", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      status === "completed" || status === "current"
                        ? "text-text-muted"
                        : "text-text-subtle"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
