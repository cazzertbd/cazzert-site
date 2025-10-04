import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MdEmail,
  MdHistory,
  MdSecurity,
  MdShoppingCart,
  MdTimer,
  MdVerified,
} from "react-icons/md";
import { OrderHistoryList } from "./OrderHistoryList";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
  createdAt: string;
  deliveryDate?: string;
  paymentStatus: string;
}

type Step = "email" | "otp" | "orders";

// Key for localStorage
const VERIFIED_EMAILS_KEY = "cazzert_verified_emails";

// Helper functions for localStorage
const getVerifiedEmails = (): string[] => {
  try {
    const stored = localStorage.getItem(VERIFIED_EMAILS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading verified emails from localStorage:", error);
    return [];
  }
};

const addVerifiedEmail = (email: string): void => {
  try {
    const verifiedEmails = getVerifiedEmails();
    const normalizedEmail = email.trim().toLowerCase();

    if (!verifiedEmails.includes(normalizedEmail)) {
      verifiedEmails.push(normalizedEmail);
      // Keep only the last 10 verified emails to prevent localStorage bloat
      const limitedEmails = verifiedEmails.slice(-10);
      localStorage.setItem(VERIFIED_EMAILS_KEY, JSON.stringify(limitedEmails));
    }
  } catch (error) {
    console.error("Error saving verified email to localStorage:", error);
  }
};

const isEmailVerified = (email: string): boolean => {
  const verifiedEmails = getVerifiedEmails();
  return verifiedEmails.includes(email.trim().toLowerCase());
};

const removeVerifiedEmail = (email: string): void => {
  try {
    const verifiedEmails = getVerifiedEmails();
    const normalizedEmail = email.trim().toLowerCase();
    const updatedEmails = verifiedEmails.filter((e) => e !== normalizedEmail);
    localStorage.setItem(VERIFIED_EMAILS_KEY, JSON.stringify(updatedEmails));
  } catch (error) {
    console.error("Error removing verified email from localStorage:", error);
  }
};

export function OrderHistoryPage() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

  const { execute: sendOTP, isPending: isSendingOTP } = useAstroAction(
    actions.otp.sendOTP,
  );
  const { execute: verifyOTP, isPending: isVerifyingOTP } = useAstroAction(
    actions.otp.verifyOTP,
  );
  const { execute: getHistory, isPending: isLoadingHistory } = useAstroAction(
    actions.orders.getHistory,
  );

  // Check for auto-verification on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");

    if (emailParam && isEmailVerified(emailParam)) {
      setEmail(emailParam);
      autoLoadOrderHistory(emailParam);
    }
  }, []);

  const autoLoadOrderHistory = async (emailAddress: string) => {
    setIsAutoVerifying(true);
    setError("");

    try {
      const historyResult = await getHistory({ email: emailAddress.trim() });

      if (historyResult.success) {
        setOrders(historyResult.orders);
        setCurrentStep("orders");
        // Store verification in session for seamless order viewing
        sessionStorage.setItem(
          `email_verified`,
          emailAddress.trim().toLowerCase(),
        );
        toast.success(
          `Welcome back! Found ${historyResult.orders.length} order(s).`,
        );
      } else {
        // If orders can't be loaded, the email verification might be stale
        removeVerifiedEmail(emailAddress);
        setError(
          "Failed to load order history. Please verify your email again.",
        );
        toast.error("Please verify your email again");
      }
    } catch (error) {
      console.error("Error in auto-verification:", error);
      removeVerifiedEmail(emailAddress);
      setError("Failed to load order history. Please verify your email again.");
      toast.error("Please verify your email again");
    } finally {
      setIsAutoVerifying(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email is already verified
    if (isEmailVerified(normalizedEmail)) {
      toast.success("Email already verified! Loading your orders...");
      autoLoadOrderHistory(normalizedEmail);
      return;
    }

    setError("");

    const result = await sendOTP({ email: email.trim() });

    if (result.success) {
      setCurrentStep("otp");
      setCountdown(300); // 5 minutes in seconds
      startCountdown();
      toast.success("Verification code sent to your email!");
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("Verification code is required");
      return;
    }

    if (otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setError("");

    // First verify OTP
    const verifyResult = await verifyOTP({
      email: email.trim(),
      otp: otp.trim(),
    });

    if (verifyResult.success) {
      // Save email to localStorage for future use
      addVerifiedEmail(email.trim());

      // Then get order history
      const historyResult = await getHistory({ email: email.trim() });

      if (historyResult.success) {
        setOrders(historyResult.orders);
        setCurrentStep("orders");
        // Store verification in session for seamless order viewing
        sessionStorage.setItem(`email_verified`, email.trim().toLowerCase());
        toast.success(
          `Verification saved! Found ${historyResult.orders.length} order(s)!`,
        );
      } else {
        setError("Failed to load order history");
        toast.error("Failed to load orders");
      }
    } else {
      setError(verifyResult.message);
      toast.error(verifyResult.message);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    const result = await sendOTP({ email: email.trim() });

    if (result.success) {
      setCountdown(300);
      setOtp("");
      setError("");
      startCountdown();
      toast.success("New verification code sent!");
    } else {
      toast.error("Failed to resend verification code");
    }
  };

  const handleViewOrder = (orderNumber: string) => {
    // Store the verified email in session for seamless order viewing
    sessionStorage.setItem(
      `order_verified_${orderNumber}`,
      email.trim().toLowerCase(),
    );
    window.location.href = `/orders/${orderNumber}`;
  };

  const handleForgetEmail = () => {
    removeVerifiedEmail(email);
    setCurrentStep("email");
    setEmail("");
    setOtp("");
    setOrders([]);
    setError("");
    toast.success(
      "Email verification removed. You'll need to verify again next time.",
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      month: "short",
      day: "numeric",
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
      case "PAID":
        return "info";
      case "PREPARING":
        return "primary";
      case "READY":
      case "OUT_FOR_DELIVERY":
        return "info";
      case "DELIVERED":
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "danger";
      default:
        return "default";
    }
  };

  // Auto-verification loading state
  if (isAutoVerifying) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-text-muted">
            Verifying email and loading orders...
          </p>
          <p className="text-text-subtle mt-1 text-sm">{email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Email Step */}
      {currentStep === "email" && (
        <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
          <div className="mb-6 flex items-center gap-3">
            <MdHistory className="text-primary h-6 w-6" />
            <h2 className="font-Secondary text-xl font-semibold">
              Find Your Orders
            </h2>
          </div>

          {/* Show verification status if email is already verified */}
          {email && isEmailVerified(email) && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <MdVerified className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Email already verified
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  No need to verify again for this email
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <FormField label="Email Address" required error={error}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                placeholder="your@email.com"
                disabled={isSendingOTP}
                autoFocus
              />
              <p className="text-text-muted mt-1 text-xs">
                {email && isEmailVerified(email)
                  ? "This email is already verified. Click below to load your orders directly."
                  : "We'll send a verification code to this email address"}
              </p>
            </FormField>

            <Button
              type="submit"
              disabled={isSendingOTP}
              className="flex w-full items-center justify-center gap-2"
            >
              {isSendingOTP ? (
                <>
                  <div className="border-text-light h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  Sending Code...
                </>
              ) : email && isEmailVerified(email) ? (
                <>
                  <MdVerified className="h-4 w-4" />
                  Load My Orders
                </>
              ) : (
                <>
                  <MdEmail className="h-4 w-4" />
                  Send Verification Code
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* OTP Step */}
      {currentStep === "otp" && (
        <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
          <div className="mb-6 flex items-center gap-3">
            <MdSecurity className="text-primary h-6 w-6" />
            <div>
              <h2 className="font-Secondary text-xl font-semibold">
                Verify Your Email
              </h2>
              <p className="text-text-muted text-sm">
                Enter the 6-digit code sent to {email}
              </p>
            </div>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <FormField label="Verification Code" required error={error}>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                  if (error) setError("");
                }}
                className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 text-center font-mono text-2xl tracking-widest focus:ring-2 focus:outline-none"
                placeholder="000000"
                disabled={isVerifyingOTP || isLoadingHistory}
                autoFocus
                maxLength={6}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-text-muted text-xs">
                  Enter the 6-digit code from your email
                </p>
                {countdown > 0 && (
                  <div className="text-text-muted flex items-center gap-1 text-xs">
                    <MdTimer className="h-3 w-3" />
                    {formatTime(countdown)}
                  </div>
                )}
              </div>
            </FormField>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="mb-1 text-xs font-medium text-blue-800 dark:text-blue-300">
                🔒 One-time verification
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                After verification, you won't need to verify this email again
                for future order lookups.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={
                  isVerifyingOTP || isLoadingHistory || otp.length !== 6
                }
                className="flex flex-1 items-center justify-center gap-2"
              >
                {isVerifyingOTP || isLoadingHistory ? (
                  <>
                    <div className="border-text-light h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    {isVerifyingOTP ? "Verifying..." : "Loading Orders..."}
                  </>
                ) : (
                  "Verify & View Orders"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResendOtp}
                disabled={isSendingOTP || countdown > 0}
              >
                {isSendingOTP ? "Sending..." : "Resend"}
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setCurrentStep("email");
                setOtp("");
                setError("");
              }}
              className="w-full"
            >
              Use Different Email
            </Button>
          </form>
        </div>
      )}

      {/* Orders List */}
      {currentStep === "orders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-Secondary text-text-base text-lg font-semibold">
                Order History
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-text-muted text-sm">
                  {orders.length > 0
                    ? `Found ${orders.length} order(s) for ${email}`
                    : `No orders found for ${email}`}
                </p>
                {isEmailVerified(email) && (
                  <div className="flex items-center gap-1">
                    <MdVerified className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      Verified
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isEmailVerified(email) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleForgetEmail}
                  className="text-xs"
                >
                  Forget Email
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentStep("email");
                  setEmail("");
                  setOtp("");
                  setOrders([]);
                  setError("");
                }}
              >
                Different Email
              </Button>
            </div>
          </div>

          {orders.length > 0 ? (
            <OrderHistoryList
              orders={orders}
              onViewOrder={handleViewOrder}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusVariant={getStatusVariant}
            />
          ) : (
            <div className="bg-bg-alt border-border/20 rounded-lg border p-8 text-center">
              <MdShoppingCart className="text-text-muted mx-auto mb-4 h-16 w-16" />
              <h4 className="font-Secondary text-text-base mb-2 text-lg font-semibold">
                No Orders Found
              </h4>
              <p className="text-text-muted mb-6">
                We couldn't find any orders for this email address.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep("email");
                    setEmail("");
                    setOtp("");
                    setError("");
                  }}
                >
                  Try Different Email
                </Button>
                <Button onClick={() => (window.location.href = "/products")}>
                  Browse Products
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-primary/10 rounded-lg p-6">
        <h4 className="text-text-base mb-3 font-medium">Need Help?</h4>
        <div className="space-y-2 text-sm">
          <p className="text-text-muted">
            • Your email verification is saved for future visits
          </p>
          <p className="text-text-muted">
            • Make sure you're using the same email address used when placing
            orders
          </p>
          <p className="text-text-muted">
            • Check your spam/junk folder if you don't receive the verification
            code
          </p>
          <p className="text-text-muted">
            • Verification codes expire after 5 minutes for security
          </p>
        </div>
        <div className="mt-4">
          <p className="text-text-muted text-sm">
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
  );
}
