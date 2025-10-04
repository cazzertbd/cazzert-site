import { Button } from "@/components/ui/Button";

interface OrderFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onReset: () => void;
}

const ORDER_STATUSES = [
  { value: "", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PAID", label: "Paid" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

export function OrderFilters({
  selectedStatus,
  onStatusChange,
  onReset,
}: OrderFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-text-base mb-2 block text-sm font-medium">
            Order Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-text-base bg-bg border-border focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
