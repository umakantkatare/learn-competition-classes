"use client";

import { useState } from "react";
import Script from "next/script";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

// ---------------------------------------------
// Types
// ---------------------------------------------

interface CreateOrderResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  };
}

interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    callback: (response: RazorpayFailureResponse) => void,
  ) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// ---------------------------------------------
// Component Props
// ---------------------------------------------

interface RazorpayCheckoutButtonProps {
  batchId: string;
  batchTitle?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

// ---------------------------------------------
// Component
// ---------------------------------------------

export function RazorpayCheckoutButton({
  batchId,
  batchTitle = "Batch Enrollment",
  disabled = false,
  className,
  children,
  onSuccess,
  onError,
}: RazorpayCheckoutButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "creating" | "checkout" | "verifying"
  >("idle");

  const isProcessing = paymentStatus !== "idle";

  // -------------------------------------------
  // Handle errors
  // -------------------------------------------

  const handleError = (message: string) => {
    setPaymentStatus("idle");
    toast.error(message);
    onError?.(message);
  };

  // -------------------------------------------
  // Verify payment
  // -------------------------------------------

  const verifyPayment = async (
    orderId: string,
    response: RazorpayPaymentResponse,
  ) => {
    try {
      setPaymentStatus("verifying");

      const res = await fetch("/api/v1/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }),
      });

      const result = (await res.json()) as VerifyPaymentResponse;

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Payment verification failed.");
      }

      setPaymentStatus("idle");

      toast.success(
        result.message || "Payment successful! Enrollment confirmed.",
      );

      onSuccess?.(result.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to verify payment.";

      handleError(message);
    }
  };

  // -------------------------------------------
  // Initiate Razorpay checkout
  // -------------------------------------------

  const handlePayment = async () => {
    if (isProcessing || disabled) return;

    if (!scriptLoaded || !window.Razorpay) {
      toast.error("Payment gateway is still loading.");
      return;
    }

    if (!batchId) {
      toast.error("Invalid batch selection.");
      return;
    }

    try {
      setPaymentStatus("creating");

      // 1. Create order on backend
      const res = await fetch("/api/v1/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batchId }),
      });

      const result = (await res.json()) as CreateOrderResponse;

      if (!res.ok || !result.success || !result.data) {
        throw new Error(result.error || "Unable to create payment order.");
      }

      const order = result.data;

      // 2. Configure Razorpay Checkout
      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Your Learning Platform",
        description: `Enrollment: ${batchTitle}`,
        order_id: order.razorpayOrderId,

        // 3. Payment success callback
        handler: async (response) => {
          await verifyPayment(order.orderId, response);
        },

        theme: {
          color: "#2563EB",
        },

        modal: {
          ondismiss: () => {
            setPaymentStatus((current) =>
              current === "checkout" ? "idle" : current,
            );
          },
        },
      };

      // 4. Open checkout
      const razorpay = new window.Razorpay(options);

      // 5. Payment failure callback
      razorpay.on("payment.failed", (response) => {
        const message =
          response.error?.description || "Payment failed. Please try again.";

        handleError(message);
      });

      setPaymentStatus("checkout");

      razorpay.open();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to initiate payment.";

      handleError(message);
    }
  };

  // -------------------------------------------
  // Render
  // -------------------------------------------

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onReady={() => setScriptLoaded(true)}
        onError={() => {
          setScriptLoaded(false);
          toast.error("Failed to load Razorpay Checkout.");
        }}
      />

      <Button
        type="button"
        size="lg"
        className={className ?? "w-full"}
        disabled={disabled || isProcessing || !scriptLoaded}
        onClick={handlePayment}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />

            {paymentStatus === "creating"
              ? "Creating Order..."
              : paymentStatus === "verifying"
                ? "Verifying Payment..."
                : "Opening Checkout..."}
          </>
        ) : (
          <>
            {children || (
              <>
                <Lock className="mr-2 size-4" />
                {scriptLoaded ? "Pay & Enroll" : "Loading Payment..."}
              </>
            )}
          </>
        )}
      </Button>
    </>
  );
}

export default RazorpayCheckoutButton;
