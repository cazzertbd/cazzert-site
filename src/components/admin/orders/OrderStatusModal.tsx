import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onStatusUpdate: (
    orderId: string,
    status: string,
    notes?: string,
    estimatedReady?: string,
  ) => Promise<void>;
}

const ORDER_STATUSES = [
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

export function OrderStatusModal({
  isOpen,
  onClose,
  orderId,
  onStatusUpdate,
}: OrderStatusModalProps) {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [estimatedReady, setEstimatedReady] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    try {
      setIsSubmitting(true);
      await onStatusUpdate(
        orderId,
        status,
        notes || undefined,
        estimatedReady || undefined,
      );
      onClose();
      // Reset form
      setStatus("");
      setNotes("");
      setEstimatedReady("");
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Order Status"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Order Status" required>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-text-base bg-bg border-border focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
            required
          >
            <option value="">Select status...</option>
            {ORDER_STATUSES.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Estimated Ready Time (Optional)">
          <input
            type="datetime-local"
            value={estimatedReady}
            onChange={(e) => setEstimatedReady(e.target.value)}
            className="text-text-base bg-bg border-border focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
          />
        </FormField>

        <FormField label="Internal Notes (Optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any internal notes about this status update..."
            className="text-text-base bg-bg border-border focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!status || isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
