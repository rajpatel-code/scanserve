import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";

import { db } from "../firebase/firebase";
import { useCart } from "../context/CartContext";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const GST_RATE = 0.18;
const DELIVERY_FEE = 50;

const initialCustomer = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const Checkout = () => {
  const navigate = useNavigate();

  const tableNumber = localStorage.getItem("scanserve_table") || "";

  const { cartItems, clearCart } = useCart();
  const [customer, setCustomer] = useState(initialCustomer);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // CART CALCULATIONS
  // --------------------------------------------------

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price || item.offerPrice || 0);
      const qty = Number(item.quantity || 1);

      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  const gst = useMemo(() => {
    return Number((subtotal * GST_RATE).toFixed(2));
  }, [subtotal]);

  const deliveryFee = useMemo(() => {
    return subtotal > 0 ? DELIVERY_FEE : 0;
  }, [subtotal]);

  const total = useMemo(() => {
    return Number((subtotal + gst + deliveryFee).toFixed(2));
  }, [subtotal, gst, deliveryFee]);

  // --------------------------------------------------
  // LOAD RAZORPAY SDK
  // --------------------------------------------------

  useEffect(() => {
    if (window.Razorpay) return;

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) return;

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      console.log("Razorpay SDK loaded");
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
    };

    document.body.appendChild(script);
  }, []);

  // --------------------------------------------------
  // INPUT CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validate = () => {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
    } = customer;

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      alert("Please fill all customer details.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email.");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (!/^\d{6}$/.test(pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return false;
    }

    if (!cartItems.length) {
      alert("Your cart is empty.");
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // SAVE ORDER TO FIRESTORE
  // --------------------------------------------------

  const saveOrder = async ({
    paymentStatus,
    paymentMethodName,
    paymentId = "",
    razorpayOrderId = "",
  }) => {
    /*
      IMPORTANT:

      We generate the Firebase document ID BEFORE saving.

      This same ID will be:
      1. Firestore document ID
      2. orderId field
      3. Success page Order ID
      4. Track Order URL ID
      5. Admin order reference
    */

    const orderRef = doc(collection(db, "orders"));

    const orderId = orderRef.id;

    const orderData = {
  orderId,

  customer,

  tableNumber,

  items: cartItems,

  subtotal,
  deliveryFee,
  gst,
  total,

  paymentMethod: paymentMethodName,

      paymentStatus,

      paymentId,

      razorpayOrderId,

      status: "Pending",

      createdAt: serverTimestamp(),
    };

    // Save order
    await setDoc(orderRef, orderData);

    // Save payment/order information temporarily
    // so Success page can recover it even after refresh.
    sessionStorage.setItem(
      "scanserve_order",
      JSON.stringify({
        orderId,
        paymentId,
        razorpayOrderId,
        paymentMethod: paymentMethodName,
        paymentStatus,
        totalAmount: total,
      })
    );

    // Clear cart
    clearCart();

    // Go to success page WITH complete state
    navigate("/success", {
      replace: true,
      state: {
        orderId,
        paymentId,
        razorpayOrderId,
        paymentMethod: paymentMethodName,
        paymentStatus,
        totalAmount: total,
        order: {
          id: orderId,
          orderId,
          paymentMethod: paymentMethodName,
          paymentStatus,
          paymentId,
          razorpayOrderId,
          totalAmount: total,
          tableNumber,
        },
      },
    });

    return orderId;
  };

  // --------------------------------------------------
  // COD ORDER
  // --------------------------------------------------

  const placeCODOrder = async () => {
    await saveOrder({
      paymentMethodName: "Cash on Delivery",
      paymentStatus: "Pending",
      paymentId: "",
      razorpayOrderId: "",
    });
  };

  // --------------------------------------------------
  // ONLINE RAZORPAY ORDER
  // --------------------------------------------------

  const placeOnlineOrder = async () => {
    if (!RAZORPAY_KEY_ID) {
      throw new Error(
        "Razorpay Key ID is missing. Check VITE_RAZORPAY_KEY_ID in client .env"
      );
    }

    if (!window.Razorpay) {
      throw new Error(
        "Razorpay SDK is not loaded. Please refresh the page and try again."
      );
    }

    // ------------------------------------------------
    // CREATE RAZORPAY ORDER ON SERVER
    // ------------------------------------------------

    const orderRes = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/api/payment/create-order`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          amount: total,
        }),
      }
    );

    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.success) {
      throw new Error(
        orderData.message || "Unable to create Razorpay payment order."
      );
    }

    console.log("Razorpay Order Created:", orderData);

    // ------------------------------------------------
    // OPEN RAZORPAY CHECKOUT
    // ------------------------------------------------

    await new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key: RAZORPAY_KEY_ID,

        amount: orderData.amount,

        currency: orderData.currency,

        name: "Raj Cafe",

        description: "Restaurant Order Payment",

        order_id: orderData.orderId,

        prefill: {
          name: customer.fullName,
          email: customer.email,
          contact: customer.phone,
        },

        theme: {
          color: "#e8792f",
        },

        handler: async (response) => {
          try {
            console.log("Razorpay Payment Response:", response);

            // ------------------------------------------
            // VERIFY PAYMENT ON SERVER
            // ------------------------------------------

            const verifyRes = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/api/payment/verify-payment`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,

                  razorpay_payment_id: response.razorpay_payment_id,

                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            console.log("Payment Verified Successfully");

            // ------------------------------------------
            // SAVE FIRESTORE ORDER
            // ------------------------------------------

            const firebaseOrderId = await saveOrder({
              paymentMethodName: "Online Payment",

              paymentStatus: "Paid",

              paymentId: response.razorpay_payment_id,

              razorpayOrderId: response.razorpay_order_id,
            });

            console.log(
              "Firestore Order Created:",
              firebaseOrderId
            );

            resolve();
          } catch (error) {
            console.error("Payment Handler Error:", error);

            reject(error);
          }
        },
      });

      // ----------------------------------------------
      // PAYMENT FAILED
      // ----------------------------------------------

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay Payment Failed:", response);

        reject(
          new Error(
            response.error?.description ||
              response.error?.reason ||
              "Payment failed."
          )
        );
      });

      // ----------------------------------------------
      // OPEN RAZORPAY
      // ----------------------------------------------

      razorpay.open();
    });
  };

  // --------------------------------------------------
  // PLACE ORDER
  // --------------------------------------------------

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      if (paymentMethod === "COD") {
        await placeCODOrder();
      } else {
        await placeOnlineOrder();
      }
    } catch (error) {
      console.error("Place Order Error:", error);

      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">

        {/* ================= CUSTOMER FORM ================= */}

        <form
          onSubmit={handlePlaceOrder}
          className="rounded-xl bg-white p-6 shadow-md lg:col-span-2"
        >
          <h2 className="mb-6 text-2xl font-bold">
            Checkout
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            <input
              className="rounded-lg border p-3"
              name="fullName"
              placeholder="Full Name"
              value={customer.fullName}
              onChange={handleChange}
            />

            <input
              className="rounded-lg border p-3"
              type="email"
              name="email"
              placeholder="Email"
              value={customer.email}
              onChange={handleChange}
            />

            <input
              className="rounded-lg border p-3"
              type="tel"
              name="phone"
              placeholder="Phone"
              value={customer.phone}
              onChange={handleChange}
            />

            <input
              className="rounded-lg border p-3"
              name="city"
              placeholder="City"
              value={customer.city}
              onChange={handleChange}
            />

            <input
              className="rounded-lg border p-3"
              name="state"
              placeholder="State"
              value={customer.state}
              onChange={handleChange}
            />

            <input
              className="rounded-lg border p-3"
              name="pincode"
              placeholder="Pincode"
              value={customer.pincode}
              onChange={handleChange}
            />

            <textarea
              className="rounded-lg border p-3 md:col-span-2"
              rows={4}
              name="address"
              placeholder="Address"
              value={customer.address}
              onChange={handleChange}
            />
          </div>

          {/* ================= PAYMENT METHOD ================= */}

          <div className="mt-8">
            <h3 className="mb-3 text-lg font-semibold">
              Payment Method
            </h3>

            <label className="mb-3 flex cursor-pointer items-center gap-3 rounded-lg border p-3">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />

              <span>Cash on Delivery</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "ONLINE"}
                onChange={() => setPaymentMethod("ONLINE")}
              />

              <span>Razorpay Online Payment</span>
            </label>
          </div>

          {/* ================= PLACE ORDER ================= */}

          <button
            disabled={loading}
            type="submit"
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </form>

        {/* ================= ORDER SUMMARY ================= */}

        <div className="h-fit rounded-xl bg-white p-6 shadow-md">
          <h3 className="mb-4 text-xl font-bold">
            Order Summary
          </h3>

          <div className="max-h-80 space-y-3 overflow-y-auto">

            {cartItems.map((item, index) => {
              const qty = Number(item.quantity || 1);

              const price = Number(
                item.price || item.offerPrice || 0
              );

              return (
                <div
                  key={item.id || index}
                  className="flex justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">
                      {item.name ||
                        item.title ||
                        "Product"}
                    </p>

                    <p className="text-sm text-gray-500">
                      Qty: {qty}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹{(price * qty).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-2 text-sm">

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>

            <hr />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span>
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;