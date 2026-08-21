import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  Leaf,
  Drumstick,
  ShoppingBag,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 40;
const GST_RATE = 0.05;

export default function Cart() {
  const navigate = useNavigate();

  const {
  cartItems,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = useCart();

  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(true);
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const summary = useMemo(() => {
    const totalItems = cartItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * (item.quantity || 0),
      0
    );

    const delivery =
      subtotal === 0
        ? 0
        : subtotal >= DELIVERY_THRESHOLD
        ? 0
        : DELIVERY_FEE;

    const gst = subtotal * GST_RATE;
    const grandTotal = subtotal + delivery + gst;

    return {
      totalItems,
      subtotal,
      delivery,
      gst,
      grandTotal,
    };
  }, [cartItems]);

  const formatPrice = (value) =>
    `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    setCouponMessage("Coupon applied successfully.");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <p className="text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full bg-orange-100 p-8">
          <ShoppingCart className="h-20 w-20 text-orange-500" />
        </div>

        <h2 className="mt-8 text-3xl font-bold text-gray-900">
          Your cart is empty
        </h2>

        <p className="mt-3 max-w-md text-gray-600">
          Looks like you haven't added any delicious food yet. Explore the menu
          and start your order.
        </p>

        <button
          onClick={() => navigate("/menu")}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Shopping Cart
            </h1>
            <p className="mt-2 text-gray-600">
              {summary.totalItems} item
              {summary.totalItems > 1 ? "s" : ""} in your cart
            </p>
          </div>

          <button
            onClick={clearCart}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={18} />
            Clear Cart
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {cartItems.map((item) => {
              const quantity = item.quantity || 1;
              const total = Number(item.price || 0) * quantity;

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 p-5 sm:flex-row">
                    <img
                      src={
                        item.image ||
                        item.imageUrl ||
                        "https://via.placeholder.com/200x200?text=Food"
                      }
                      alt={item.name}
                      className="h-36 w-full rounded-xl object-cover sm:w-40"
                    />

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">
                              {item.name}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                              {item.category}
                            </p>

                            <div className="mt-3">
                              {String(
                                item.type || item.foodType || item.veg
                              ).toLowerCase() === "veg" ||
                              item.isVeg === true ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                  <Leaf size={14} />
                                  Veg
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                  <Drumstick size={14} />
                                  Non-Veg
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100"
                          >
                            <Minus size={18} />
                          </button>

                          <span className="min-w-[36px] text-center text-lg font-bold">
                            {quantity}
                          </span>

                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100"
                          >
                            <Plus size={18} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-8">
                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Price
                            </p>
                            <p className="font-semibold">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase text-gray-500">
                              Total
                            </p>
                            <p className="text-lg font-bold text-orange-600">
                              {formatPrice(total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/menu")}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold transition hover:bg-gray-100"
              >
                <ArrowLeft size={18} />
                Continue Shopping
              </button>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-orange-500" />
                <h2 className="text-2xl font-bold">Order Summary</h2>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span className="font-semibold">
                    {summary.totalItems}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(summary.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold">
                    {summary.delivery === 0
                      ? "FREE"
                      : formatPrice(summary.delivery)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-semibold">
                    {formatPrice(summary.gst)}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between text-xl font-bold">
                  <span>Grand Total</span>
                  <span className="text-orange-600">
                    {formatPrice(summary.grandTotal)}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <label className="mb-2 flex items-center gap-2 font-semibold">
                  <Tag size={18} />
                  Coupon Code
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon"
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />

                  <button
                    onClick={handleApplyCoupon}
                    className="rounded-xl bg-orange-500 px-4 font-semibold text-white transition hover:bg-orange-600"
                  >
                    Apply
                  </button>
                </div>

                {couponMessage && (
                  <p className="mt-2 text-sm text-green-600">
                    {couponMessage}
                  </p>
                )}
              </div>

              <div className="mt-8 rounded-xl bg-orange-50 p-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <ShieldCheck size={18} />
                  <span className="font-semibold">
                    Secure Checkout
                  </span>
                </div>

                <p className="mt-2 text-sm text-orange-600">
                  Your payment information is encrypted and protected.
                </p>
              </div>

              <button
                disabled={!cartItems.length}
                onClick={() => navigate("/checkout")}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-bold transition ${
                  cartItems.length
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "cursor-not-allowed bg-gray-300 text-gray-500"
                }`}
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>

              {summary.subtotal < DELIVERY_THRESHOLD &&
                summary.subtotal > 0 && (
                  <p className="mt-4 text-center text-sm text-gray-500">
                    Add{" "}
                    <span className="font-semibold text-orange-600">
                      {formatPrice(
                        DELIVERY_THRESHOLD - summary.subtotal
                      )}
                    </span>{" "}
                    more for FREE delivery.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}