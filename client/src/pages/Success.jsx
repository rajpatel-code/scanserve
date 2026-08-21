import {
  CheckCircle2,
  Home,
  ShoppingBag,
  Receipt,
  CreditCard,
  BadgeCheck,
  Clock,
  Truck,
  
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") {
    return null;
  }

  const value = Number(amount);

  if (Number.isNaN(value)) {
    return amount;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

export default function Success() {
  const location = useLocation();

  const state = location.state || {};

  // Try to recover payment/order information from different possible locations
  const savedPayment =
    JSON.parse(sessionStorage.getItem("razorpay_payment") || "null") || {};

  const savedOrder =
    JSON.parse(sessionStorage.getItem("scanserve_order") || "null") || {};

  const orderObject =
    state.order ||
    savedOrder.order ||
    savedOrder ||
    {};

  const orderId =
    state.orderId ||
    state.id ||
    state.order?.id ||
    state.order?.orderId ||
    savedPayment.orderId ||
    savedOrder.orderId ||
    savedOrder.id ||
    orderObject.id ||
    orderObject.orderId ||
    "Not Available";

  const paymentId =
    state.paymentId ||
    state.razorpay_payment_id ||
    state.payment?.id ||
    savedPayment.paymentId ||
    savedPayment.razorpay_payment_id ||
    savedOrder.paymentId ||
    savedOrder.razorpay_payment_id ||
    "";

  const paymentMethod =
    state.paymentMethod ||
    state.order?.paymentMethod ||
    savedPayment.paymentMethod ||
    savedOrder.paymentMethod ||
    "Online Payment";

  const paymentStatus =
    state.paymentStatus ||
    state.order?.paymentStatus ||
    savedPayment.paymentStatus ||
    savedOrder.paymentStatus ||
    "Success";

  const amount =
    state.totalAmount ??
    state.amount ??
    state.total ??
    state.order?.totalAmount ??
    state.order?.amount ??
    savedPayment.amount ??
    savedOrder.totalAmount ??
    savedOrder.amount;

  const trackOrderId = orderId !== "Not Available" ? orderId : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-2xl">

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-8 py-10 text-center text-white">
            <div className="mb-5 flex justify-center">
              <div className="rounded-full bg-white/20 p-5 backdrop-blur-sm">
                <CheckCircle2 className="h-20 w-20 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight">
              Payment Successful!
            </h1>

            <p className="mt-3 text-lg text-green-100">
              Thank you for your order.
            </p>

            <p className="mt-2 text-green-50">
              Your order has been confirmed and is now being prepared.
            </p>
          </div>

          {/* Details */}
          <div className="p-6 md:p-8">
            <div className="space-y-5 rounded-2xl border border-green-100 bg-green-50 p-5">

              {/* Order ID */}
              <div className="flex items-start gap-3">
                <Receipt className="mt-1 h-5 w-5 text-green-600" />

                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Order ID
                  </p>

                  <p className="break-all font-semibold text-gray-900">
                    {orderId}
                  </p>
                </div>
              </div>

              <div className="h-px bg-green-100" />

              {/* Payment ID */}
              {paymentId && (
                <>
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-1 h-5 w-5 text-green-600" />

                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        Razorpay Payment ID
                      </p>

                      <p className="break-all font-semibold text-gray-900">
                        {paymentId}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-green-100" />
                </>
              )}

              {/* Payment Method */}
              <div className="flex items-start gap-3">
                <CreditCard className="mt-1 h-5 w-5 text-green-600" />

                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Payment Method
                  </p>

                  <p className="font-semibold text-gray-900">
                    {paymentMethod}
                  </p>
                </div>
              </div>

              <div className="h-px bg-green-100" />

              {/* Payment Status */}
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-1 h-5 w-5 text-green-600" />

                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Payment Status
                  </p>

                  <span className="mt-1 inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white">
                    {paymentStatus}
                  </span>
                </div>
              </div>

              {/* Amount */}
              {amount !== null &&
                amount !== undefined &&
                amount !== "" && (
                  <>
                    <div className="h-px bg-green-100" />

                    <div className="flex items-start gap-3">
                      <ShoppingBag className="mt-1 h-5 w-5 text-green-600" />

                      <div className="flex-1">
                        <p className="text-sm text-gray-500">
                          Total Amount
                        </p>

                        <p className="text-xl font-bold text-green-700">
                          {formatCurrency(amount)}
                        </p>
                      </div>
                    </div>
                  </>
                )}

              <div className="h-px bg-green-100" />

              {/* Delivery */}
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 text-green-600" />

                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Estimated Delivery
                  </p>

                  <p className="font-semibold text-gray-900">
                    30–45 minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Track Order */}
              {trackOrderId && (
                <Link
                  to={`/track-order/${trackOrderId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700"
                >
                  <Truck className="h-5 w-5" />
                  Track Order
                </Link>
              )}

              {/* Continue Shopping */}
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-green-700"
              >
                <ShoppingBag className="h-5 w-5" />
                Continue Shopping
              </Link>

              {/* Home */}
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-600 px-5 py-3 font-semibold text-green-700 transition-all duration-200 hover:bg-green-50"
              >
                <Home className="h-5 w-5" />
                Go Home
              </Link>
            </div>

            {/* Debug information - only shown if Order ID is missing */}
            {orderId === "Not Available" && (
              <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm font-semibold text-yellow-800">
                  Order ID is not available on this page.
                </p>

                <p className="mt-1 text-sm text-yellow-700">
                  Payment was successful, but Checkout did not pass the
                  order information to the Success page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}