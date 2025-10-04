import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdHelp, MdSearch } from "react-icons/md";

interface FormData {
  orderNumber: string;
  email: string;
}

export function OrderLookup() {
  const [formData, setFormData] = useState<FormData>({
    orderNumber: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.orderNumber.trim()) {
      newErrors.orderNumber = "Order number is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // First, verify the order exists and email matches
      const response = await fetch("/api/orders/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: formData.orderNumber.trim(),
          email: formData.email.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to order details page
        window.location.href = `/orders/${formData.orderNumber.trim()}`;
      } else {
        toast.error(result.error || "Order not found or email doesn't match");
      }
    } catch (error) {
      console.error("Error verifying order:", error);
      toast.error("Failed to verify order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Order Number" required error={errors.orderNumber}>
          <input
            type="text"
            value={formData.orderNumber}
            onChange={(e) => handleInputChange("orderNumber", e.target.value)}
            className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
            placeholder="ORD-2024-001"
            disabled={isLoading}
          />
          <p className="text-text-muted mt-1 text-xs">
            You can find your order number in the confirmation email
          </p>
        </FormField>

        <FormField label="Email Address" required error={errors.email}>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
            placeholder="your@email.com"
            disabled={isLoading}
          />
          <p className="text-text-muted mt-1 text-xs">
            Enter the email address used when placing the order
          </p>
        </FormField>

        <Button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="border-text-light h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              Searching...
            </>
          ) : (
            <>
              <MdSearch className="h-4 w-4" />
              Track Order
            </>
          )}
        </Button>
      </form>

      <div className="bg-primary/10 mt-6 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MdHelp className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <h4 className="text-text-base mb-2 font-medium">Need Help?</h4>
            <p className="text-text-muted mb-2 text-sm">
              If you're having trouble finding your order:
            </p>
            <ul className="text-text-muted space-y-1 text-sm">
              <li>• Check your email for the order confirmation</li>
              <li>• Make sure you're using the correct email address</li>
              <li>• Order numbers are case-sensitive</li>
            </ul>
            <p className="text-text-muted mt-3 text-sm">
              Still having issues? Contact us at{" "}
              <a
                href="mailto:support@cazzert.com"
                className="text-primary hover:underline"
              >
                support@cazzert.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
