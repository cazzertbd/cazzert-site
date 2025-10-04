import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MdArrowBack,
  MdCheck,
  MdLocalShipping,
  MdRefresh,
  MdSchedule,
  MdSecurity,
  MdStore,
} from "react-icons/md";
import { OrderItemsList } from "./OrderItemsList";
import { OrderTimeline } from "./OrderTimeline";

interface OrderTrackingPageProps {
  orderNumber: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryNotes?: string;
  paymentMethod?: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  estimatedReady?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    customization?: string;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
  }>;
}

export function OrderTrackingPage({ orderNumber }: OrderTrackingPageProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { execute: getOrderDetails, isPending: isFetching } = useAstroAction(
    actions.orders.getDetails,
  );

  const verifyEmail = async (emailToVerify: string) => {
    setIsVerifying(true);
    setEmailError("");

    try {
      const response = await fetch("/api/orders/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: orderNumber,
          email: emailToVerify.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsVerified(true);
        // Store verification in sessionStorage for this order
        sessionStorage.setItem(`order_verified_${orderNumber}`, emailToVerify);
        await fetchOrderDetails();
      } else {
        setEmailError(result.error || "Email verification failed");
        toast.error("Email doesn't match this order");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setEmailError("Failed to verify email. Please try again.");
      toast.error("Failed to verify email");
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getOrderDetails({ orderNumber });

      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.error || "Order not found");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if email is already verified in session
  useEffect(() => {
    const verifiedEmail = sessionStorage.getItem(
      `order_verified_${orderNumber}`,
    );
    if (verifiedEmail) {
      setEmail(verifiedEmail);
      setIsVerified(true);
      fetchOrderDetails();
    }
  }, [orderNumber]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    verifyEmail(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError("");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          variant: "warning" as const,
          icon: MdSchedule,
          title: "Order Received",
          description: "We've received your order and are processing it.",
        };
      case "CONFIRMED":
        return {
          variant: "info" as const,
          icon: MdCheck,
          title: "Order Confirmed",
          description: "Your order has been confirmed and is in queue.",
        };
      case "PAID":
        return {
          variant: "success" as const,
          icon: MdCheck,
          title: "Payment Received",
          description:
            "Payment received successfully. Order is being prepared.",
        };
      case "PREPARING":
        return {
          variant: "primary" as const,
          icon: MdStore,
          title: "Preparing Your Order",
          description: "Our bakers are working on your delicious cakes!",
        };
      case "READY":
        return {
          variant: "success" as const,
          icon: MdCheck,
          title: "Order Ready",
          description: "Your order is ready for pickup or delivery.",
        };
      case "OUT_FOR_DELIVERY":
        return {
          variant: "info" as const,
          icon: MdLocalShipping,
          title: "Out for Delivery",
          description: "Your order is on its way to you!",
        };
      case "DELIVERED":
        return {
          variant: "success" as const,
          icon: MdCheck,
          title: "Delivered",
          description: "Your order has been delivered successfully.",
        };
      case "COMPLETED":
        return {
          variant: "success" as const,
          icon: MdCheck,
          title: "Order Completed",
          description: "Order completed. Thank you for choosing Cazzert!",
        };
      case "CANCELLED":
        return {
          variant: "danger" as const,
          icon: MdSchedule,
          title: "Order Cancelled",
          description: "This order has been cancelled.",
        };
      default:
        return {
          variant: "default" as const,
          icon: MdSchedule,
          title: "Processing",
          description: "Your order is being processed.",
        };
    }
  };

  // Email verification form
  if (!isVerified) {
    return (
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-Secondary text-text-base mb-2 text-2xl font-bold">
            Verify Your Email
          </h1>
          <p className="text-text-muted mb-2">
            Please enter your email address to view order details
          </p>
          <p className="text-text-base font-medium">Order: {orderNumber}</p>
        </div>

        <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <MdSecurity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Security Verification Required
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Enter the email address used when placing this order
              </p>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <FormField label="Email Address" required error={emailError}>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                placeholder="your@email.com"
                disabled={isVerifying}
                autoFocus
              />
            </FormField>

            <Button
              type="submit"
              disabled={isVerifying || !email.trim()}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <div className="border-text-light mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  Verifying...
                </>
              ) : (
                "Access Order Details"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/orders/track")}
              className="text-sm"
            >
              <MdArrowBack className="mr-1 h-4 w-4" />
              Back to Order Lookup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-text-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="bg-bg-alt border-border/20 rounded-lg border p-8">
          <h2 className="font-Secondary text-text-base mb-4 text-2xl font-bold">
            Order Not Found
          </h2>
          <p className="text-text-muted mb-6">
            {error || "We couldn't find an order with that number."}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                sessionStorage.removeItem(`order_verified_${orderNumber}`);
                setIsVerified(false);
                setEmail("");
                setError(null);
              }}
            >
              Try Different Email
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/orders/track")}
            >
              <MdArrowBack className="mr-2 h-4 w-4" />
              Track Another Order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/orders/track")}
            className="flex items-center gap-2"
          >
            <MdArrowBack className="h-4 w-4" />
            Track Another Order
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrderDetails}
              disabled={isFetching}
              className="flex items-center gap-2"
            >
              <MdRefresh
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-Secondary text-text-base mb-2 text-3xl font-bold">
            Order {order.orderNumber}
          </h1>
          <p className="text-text-muted">
            Placed on {formatDate(order.createdAt)}
          </p>
          <p className="text-text-muted mt-1 text-sm">Verified for: {email}</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-bg-alt border-border/20 mb-8 rounded-lg border p-6">
        <div className="mb-4 flex items-center gap-4">
          <div className={`rounded-full p-3 bg-${statusInfo.variant}/10`}>
            <StatusIcon className={`h-6 w-6 text-${statusInfo.variant}`} />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h2 className="font-Secondary text-text-base text-xl font-semibold">
                {statusInfo.title}
              </h2>
              <Badge variant={statusInfo.variant} size="md">
                {order.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-text-muted">{statusInfo.description}</p>
          </div>
        </div>

        {order.estimatedReady && (
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-text-base font-medium">
              Estimated Ready: {formatDate(order.estimatedReady)}
            </p>
          </div>
        )}
      </div>

      {/* Order Timeline */}
      <div className="mb-8">
        <OrderTimeline
          currentStatus={order.status}
          orderDate={order.createdAt}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Order Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
            <h3 className="font-Secondary mb-4 text-lg font-semibold">
              Order Items
            </h3>
            <OrderItemsList items={order.items} />
          </div>

          {/* Delivery Information */}
          {(order.deliveryAddress || order.deliveryDate) && (
            <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
              <h3 className="font-Secondary mb-4 text-lg font-semibold">
                Delivery Information
              </h3>
              <div className="space-y-3">
                {order.deliveryAddress && (
                  <div>
                    <span className="text-text-muted text-sm">Address:</span>
                    <p className="text-text-base">{order.deliveryAddress}</p>
                  </div>
                )}
                {order.deliveryDate && (
                  <div>
                    <span className="text-text-muted text-sm">Date:</span>
                    <p className="text-text-base">
                      {formatDate(order.deliveryDate)}
                    </p>
                  </div>
                )}
                {order.deliveryTime && (
                  <div>
                    <span className="text-text-muted text-sm">Time:</span>
                    <p className="text-text-base">{order.deliveryTime}</p>
                  </div>
                )}
                {order.deliveryNotes && (
                  <div>
                    <span className="text-text-muted text-sm">
                      Special Instructions:
                    </span>
                    <p className="text-text-base">{order.deliveryNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
            <h3 className="font-Secondary mb-4 text-lg font-semibold">
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Subtotal:</span>
                <span className="text-text-base">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Delivery Fee:</span>
                <span className="text-text-base">
                  {formatCurrency(order.deliveryFee)}
                </span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Tax:</span>
                  <span className="text-text-base">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Discount:</span>
                  <span className="text-red-600">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              <div className="border-border/20 border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-text-base font-semibold">Total:</span>
                  <span className="text-text-base text-lg font-bold">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
            <h3 className="font-Secondary mb-4 text-lg font-semibold">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-text-muted text-sm">Name:</span>
                <p className="text-text-base">{order.customerName}</p>
              </div>
              <div>
                <span className="text-text-muted text-sm">Email:</span>
                <p className="text-text-base">{order.customerEmail}</p>
              </div>
              {order.customerPhone && (
                <div>
                  <span className="text-text-muted text-sm">Phone:</span>
                  <p className="text-text-base">{order.customerPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
            <h3 className="font-Secondary mb-4 text-lg font-semibold">
              Payment Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-text-muted text-sm">Method:</span>
                <p className="text-text-base">
                  {order.paymentMethod?.replace("_", " ") || "Cash on Delivery"}
                </p>
              </div>
              <div>
                <span className="text-text-muted text-sm">Status:</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      order.paymentStatus === "PAID" ? "success" : "warning"
                    }
                    size="sm"
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
