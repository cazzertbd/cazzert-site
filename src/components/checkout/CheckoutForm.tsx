import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useAstroAction } from "@/hooks/useAstroAction";
import { useCart } from "@/hooks/useCart";
import { actions } from "astro:actions";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  MdCheck,
  MdLocationOn,
  MdPayment,
  MdPerson,
  MdSecurity,
  MdShoppingCart,
  MdTimer,
  MdVerified,
} from "react-icons/md";
import { CartItemComponent } from "./CartItem";
import { OrderSummary } from "./OrderSummary";

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryNotes: string;
}

const DELIVERY_TIME_SLOTS = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "1:00 PM - 3:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM",
  "7:00 PM - 9:00 PM",
];

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

const checkIsEmailVerified = (email: string): boolean => {
  const verifiedEmails = getVerifiedEmails();
  return verifiedEmails.includes(email.trim().toLowerCase());
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

export function CheckoutForm() {
  // Use the proper cart hook
  const {
    cart,
    summary,
    isLoading: isCartLoading,
    isInitialized,
    updateQuantity,
    removeItem,
    clearCart,
    getShippingCost,
  } = useCart();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
    deliveryDate: "",
    deliveryTime: "",
    deliveryNotes: "",
  });

  // Form validation
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // OTP verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showOtpStep, setShowOtpStep] = useState(false);

  // Actions
  const { execute: placeOrder, isPending: isPlacingOrder } = useAstroAction(
    actions.orders.place,
  );
  const { execute: sendOTP, isPending: isSendingOTP } = useAstroAction(
    actions.otp.sendOTP,
  );
  const { execute: verifyOTP, isPending: isVerifyingOTP } = useAstroAction(
    actions.otp.verifyOTP,
  );

  // Calculate delivery fee and totals
  const deliveryFee = getShippingCost();
  const finalTotal = cart.total + deliveryFee;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // If email is changed, reset verification status
    if (field === "customerEmail") {
      const normalizedEmail = value.trim().toLowerCase();
      const verified = checkIsEmailVerified(normalizedEmail);
      setIsEmailVerified(verified);
      setShowOtpStep(false);
      setOtp("");
      setOtpError("");

      if (verified) {
        toast.success("Email already verified!");
      }
    }
  };

  const startCountdown = () => {
    setCountdown(300); // 5 minutes
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendOtp = async () => {
    if (!formData.customerEmail.trim()) {
      setOtpError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      setOtpError("Please enter a valid email address");
      return;
    }

    setOtpError("");

    const result = await sendOTP({ email: formData.customerEmail.trim() });

    if (result.success) {
      setShowOtpStep(true);
      startCountdown();
      toast.success("Verification code sent to your email!");
    } else {
      setOtpError(result.message);
      toast.error(result.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError("Verification code is required");
      return;
    }

    if (otp.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit code");
      return;
    }

    setOtpError("");

    const result = await verifyOTP({
      email: formData.customerEmail.trim(),
      otp: otp.trim(),
    });

    if (result.success) {
      setIsEmailVerified(true);
      setShowOtpStep(false);
      addVerifiedEmail(formData.customerEmail.trim());
      toast.success("Email verified successfully!");
    } else {
      setOtpError(result.message);
      toast.error(result.message);
    }
  };

  const handleResendOtp = async () => {
    const result = await sendOTP({ email: formData.customerEmail.trim() });

    if (result.success) {
      startCountdown();
      setOtp("");
      setOtpError("");
      toast.success("New verification code sent!");
    } else {
      toast.error("Failed to resend verification code");
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      // Validate cart
      if (cart.items.length === 0) {
        toast.error("Your cart is empty");
        return false;
      }
    }

    if (step === 2) {
      // Validate customer information
      if (!formData.customerName.trim()) {
        newErrors.customerName = "Name is required";
      }
      if (!formData.customerEmail.trim()) {
        newErrors.customerEmail = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
        newErrors.customerEmail = "Please enter a valid email";
      }
      if (!formData.customerPhone.trim()) {
        newErrors.customerPhone = "Phone number is required";
      } else if (formData.customerPhone.length < 10) {
        newErrors.customerPhone = "Phone number must be at least 10 digits";
      }

      // Check email verification
      if (!isEmailVerified) {
        toast.error("Please verify your email address before proceeding");
        return false;
      }
    }

    if (step === 3) {
      // Validate delivery information
      if (!formData.deliveryAddress.trim()) {
        newErrors.deliveryAddress = "Delivery address is required";
      } else if (formData.deliveryAddress.length < 10) {
        newErrors.deliveryAddress = "Please provide a complete address";
      }
      if (!formData.deliveryDate) {
        newErrors.deliveryDate = "Delivery date is required";
      }
      if (!formData.deliveryTime) {
        newErrors.deliveryTime = "Delivery time is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    if (!isEmailVerified) {
      toast.error("Please verify your email address before placing the order");
      return;
    }

    try {
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        deliveryNotes: formData.deliveryNotes,
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          customization:
            [
              item.customizations?.message,
              item.customizations?.specialInstructions,
              item.customizations?.size
                ? `Size: ${item.customizations.size}`
                : undefined,
            ]
              .filter(Boolean)
              .join(" | ") || undefined,
        })),
      };

      const result = await placeOrder(orderData);

      if (result.success) {
        // Clear cart using the hook
        await clearCart();

        // Show success and redirect
        toast.success(result.message || "Order placed successfully!");
        setCurrentStep(4);

        // Redirect to order confirmation after a delay
        setTimeout(() => {
          window.location.href = `/orders/${result.data.orderNumber}`;
        }, 3000);
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    }
  };

  // Get minimum delivery date (tomorrow)
  const getMinDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step <= currentStep
                  ? "border-primary bg-primary text-text-light"
                  : "border-border text-text-muted"
              }`}
            >
              {step < currentStep ? <MdCheck className="h-5 w-5" /> : step}
            </div>
            {step < 4 && (
              <div
                className={`mx-4 h-1 w-16 ${
                  step < currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <div className="grid grid-cols-4 gap-8 text-center text-sm">
          <span
            className={
              currentStep >= 1 ? "text-primary font-medium" : "text-text-muted"
            }
          >
            Review Cart
          </span>
          <span
            className={
              currentStep >= 2 ? "text-primary font-medium" : "text-text-muted"
            }
          >
            Customer Info
          </span>
          <span
            className={
              currentStep >= 3 ? "text-primary font-medium" : "text-text-muted"
            }
          >
            Delivery Details
          </span>
          <span
            className={
              currentStep >= 4 ? "text-primary font-medium" : "text-text-muted"
            }
          >
            Confirmation
          </span>
        </div>
      </div>
    </div>
  );

  // Show loading if cart is not initialized
  if (!isInitialized) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-text-muted">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="font-Secondary text-text-base mb-2 text-3xl font-bold">
          Checkout
        </h1>
        <p className="text-text-muted">
          Complete your order in a few simple steps
        </p>
      </div>

      {renderStepIndicator()}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
              <div className="mb-6 flex items-center gap-3">
                <MdShoppingCart className="text-primary h-6 w-6" />
                <h2 className="font-Secondary text-xl font-semibold">
                  Review Your Order
                </h2>
              </div>

              {cart.items.length === 0 ? (
                <div className="py-8 text-center">
                  <MdShoppingCart className="text-text-muted mx-auto mb-4 h-16 w-16" />
                  <p className="text-text-muted mb-4">Your cart is empty</p>
                  <Button
                    onClick={() => (window.location.href = "/products")}
                    className="mx-auto"
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item, index) => (
                    <CartItemComponent
                      key={`${item.product.id}-${index}`}
                      item={item}
                      onUpdateQuantity={(quantity) =>
                        updateQuantity(
                          item.product.id,
                          quantity,
                          item.customizations,
                        )
                      }
                      onRemove={() =>
                        removeItem(item.product.id, item.customizations)
                      }
                      isLoading={isCartLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
              <div className="mb-6 flex items-center gap-3">
                <MdPerson className="text-primary h-6 w-6" />
                <h2 className="font-Secondary text-xl font-semibold">
                  Customer Information
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    label="Full Name"
                    required
                    error={errors.customerName}
                    className="md:col-span-2"
                  >
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) =>
                        handleInputChange("customerName", e.target.value)
                      }
                      className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </FormField>

                  <FormField
                    label="Email Address"
                    required
                    error={errors.customerEmail}
                    className="md:col-span-2"
                  >
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) =>
                            handleInputChange("customerEmail", e.target.value)
                          }
                          className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 pr-10 focus:ring-2 focus:outline-none"
                          placeholder="your@email.com"
                        />
                        {isEmailVerified && (
                          <MdVerified className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-green-600 dark:text-green-400" />
                        )}
                      </div>

                      {/* Email verification status */}
                      {formData.customerEmail && (
                        <div>
                          {isEmailVerified ? (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                              <MdVerified className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                  Email verified
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  Ready to proceed with checkout
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {!showOtpStep ? (
                                <div className="bg-primary-light/5 ring-primary-light/20 rounded-lg p-4 ring-1">
                                  <div className="flex items-start gap-3">
                                    <MdSecurity className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-text-base text-sm font-medium">
                                        Email verification required
                                      </p>
                                      <p className="text-text-muted mt-1 text-xs">
                                        We need to verify your email before you
                                        can place an order
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={handleSendOtp}
                                      disabled={
                                        isSendingOTP ||
                                        !formData.customerEmail.trim()
                                      }
                                      className="flex-shrink-0"
                                    >
                                      {isSendingOTP
                                        ? "Sending..."
                                        : "Verify Email"}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="border-border/30 bg-bg-alt ring-primary-light/10 rounded-lg border p-4 shadow-sm ring-1">
                                  <div className="mb-4 flex items-center gap-3">
                                    <div className="bg-primary-light/15 flex h-8 w-8 items-center justify-center rounded-full">
                                      <MdSecurity className="text-primary h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="text-text-base text-sm font-medium">
                                        Verify your email
                                      </p>
                                      <p className="text-text-muted text-xs">
                                        Enter the 6-digit code sent to{" "}
                                        <span className="text-text-base font-medium">
                                          {formData.customerEmail}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <FormField
                                    label="Verification Code"
                                    error={otpError}
                                  >
                                    <input
                                      type="text"
                                      value={otp}
                                      onChange={(e) => {
                                        const value = e.target.value
                                          .replace(/\D/g, "")
                                          .slice(0, 6);
                                        setOtp(value);
                                        if (otpError) setOtpError("");
                                      }}
                                      className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-3 text-center font-mono text-xl tracking-widest focus:ring-2 focus:outline-none"
                                      placeholder="000000"
                                      disabled={isVerifyingOTP}
                                      maxLength={6}
                                    />
                                    <div className="mt-2 flex items-center justify-between">
                                      <p className="text-text-muted text-xs">
                                        Enter the 6-digit code from your email
                                      </p>
                                      {countdown > 0 && (
                                        <div className="text-text-subtle flex items-center gap-1 text-xs">
                                          <MdTimer className="h-3 w-3" />
                                          <span className="font-medium">
                                            {formatTime(countdown)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </FormField>

                                  <div className="mt-4 flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={handleVerifyOtp}
                                      disabled={
                                        isVerifyingOTP || otp.length !== 6
                                      }
                                      className="flex-1"
                                    >
                                      {isVerifyingOTP
                                        ? "Verifying..."
                                        : "Verify Code"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleResendOtp}
                                      disabled={isSendingOTP || countdown > 0}
                                      className="border-border hover:bg-bg-feature-card"
                                    >
                                      {isSendingOTP ? "Sending..." : "Resend"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </FormField>

                  <FormField
                    label="Phone Number"
                    required
                    error={errors.customerPhone}
                  >
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        handleInputChange("customerPhone", e.target.value)
                      }
                      className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                      placeholder="+880 1234 567890"
                    />
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-bg-alt border-border/20 rounded-lg border p-6">
              <div className="mb-6 flex items-center gap-3">
                <MdLocationOn className="text-primary h-6 w-6" />
                <h2 className="font-Secondary text-xl font-semibold">
                  Delivery Information
                </h2>
              </div>

              <div className="space-y-4">
                <FormField
                  label="Delivery Address"
                  required
                  error={errors.deliveryAddress}
                >
                  <textarea
                    value={formData.deliveryAddress}
                    onChange={(e) =>
                      handleInputChange("deliveryAddress", e.target.value)
                    }
                    rows={3}
                    className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                    placeholder="Enter complete delivery address with landmarks"
                  />
                </FormField>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    label="Delivery Date"
                    required
                    error={errors.deliveryDate}
                  >
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) =>
                        handleInputChange("deliveryDate", e.target.value)
                      }
                      min={getMinDeliveryDate()}
                      className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                    />
                  </FormField>

                  <FormField
                    label="Preferred Time"
                    required
                    error={errors.deliveryTime}
                  >
                    <select
                      value={formData.deliveryTime}
                      onChange={(e) =>
                        handleInputChange("deliveryTime", e.target.value)
                      }
                      className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                    >
                      <option value="">Select time slot</option>
                      {DELIVERY_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <FormField label="Special Instructions (Optional)">
                  <textarea
                    value={formData.deliveryNotes}
                    onChange={(e) =>
                      handleInputChange("deliveryNotes", e.target.value)
                    }
                    rows={2}
                    className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
                    placeholder="Any special delivery instructions or cake customization requests"
                  />
                </FormField>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="bg-bg-alt border-border/20 rounded-lg border p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <MdCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-Secondary text-text-base mb-2 text-2xl font-semibold">
                Order Placed Successfully!
              </h2>
              <p className="text-text-muted mb-4">
                Thank you for your order. We'll start preparing your delicious
                cakes right away.
              </p>
              <p className="text-text-muted text-sm">
                Redirecting to order details...
              </p>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary
            cart={cart}
            summary={summary}
            deliveryFee={deliveryFee}
            finalTotal={finalTotal}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                disabled={currentStep === 1 && cart.items.length === 0}
                className="flex items-center gap-2"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isPlacingOrder || !isEmailVerified}
                className="flex items-center gap-2"
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
                <MdPayment className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
