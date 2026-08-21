import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Package,
  ChefHat,
  ShoppingBag,
  Truck,
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Wallet,
  CalendarDays,
  ArrowLeft,
  UtensilsCrossed,
} from "lucide-react";

const STATUS_FLOW = [
  "Pending",
  "Accepted",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
];

const normalizeStatus = (status = "") => {
  const value = String(status).trim().toLowerCase();

  if (value.includes("pending")) return "Pending";
  if (value.includes("accept")) return "Accepted";
  if (value.includes("prepar")) return "Preparing";
  if (value === "ready" || value.includes("ready")) return "Ready";
  if (value.includes("out")) return "Out for Delivery";
  if (value.includes("deliver")) return "Delivered";

  return "Pending";
};

const statusIcon = (status) => {
  switch (status) {
    case "Pending":
      return Clock3;
    case "Accepted":
      return CheckCircle2;
    case "Preparing":
      return ChefHat;
    case "Ready":
      return Package;
    case "Out for Delivery":
      return Truck;
    case "Delivered":
      return Home;
    default:
      return Clock3;
  }
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  try {
    let date;

    if (dateValue?.toDate) {
      date = dateValue.toDate();
    } else if (dateValue?.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      date = new Date(dateValue);
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "-";
  }
};

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const orderRef = doc(db, "orders", orderId);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setNotFound(true);
          setOrder(null);
        } else {
          setOrder({
            id: snapshot.id,
            ...snapshot.data(),
          });
          setNotFound(false);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Track order error:", error);
        setLoading(false);
        setNotFound(true);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  const currentStatus = normalizeStatus(order?.status);

  const currentStep = useMemo(
    () => STATUS_FLOW.indexOf(currentStatus),
    [currentStatus]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800">
            Loading Order...
          </h2>
          <p className="text-slate-500 mt-2">
            Fetching the latest tracking information.
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-10 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-5" />

          <h2 className="text-2xl font-bold text-slate-900">
            Order Not Found
          </h2>

          <p className="text-slate-500 mt-3">
            We couldn't find the requested order. Please verify your tracking
            link.
          </p>

          <button
            onClick={() => navigate("/menu")}
            className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            <ArrowLeft size={18} />
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const total =
    order.grandTotal ??
    order.total ??
    items.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">Track Your Order</h1>

              <p className="mt-2 text-blue-100">
                Stay updated with your order in real-time.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="bg-white/15 px-4 py-2 rounded-xl">
                  Order ID:{" "}
                  <span className="font-semibold">
                    {order.displayOrderId ||
                      order.customerOrderId ||
                      order.orderNumber ||
                      order.id}
                  </span>
                </span>

                <span className="bg-green-500 px-4 py-2 rounded-xl font-semibold">
                  {currentStatus}
                </span>
              </div>
            </div>

            <ShoppingBag className="w-24 h-24 opacity-20 hidden lg:block" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-xl font-bold mb-8">Order Timeline</h2>

              <div className="space-y-6">
                {STATUS_FLOW.map((step, index) => {
                  const Icon = statusIcon(step);

                  const completed = index < currentStep;
                  const current = index === currentStep;

                  const circle = completed
                    ? "bg-green-500 text-white"
                    : current
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500";

                  const line = completed
                    ? "bg-green-500"
                    : "bg-gray-300";

                  return (
                    <div key={step} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${circle}`}
                        >
                          <Icon size={20} />
                        </div>

                        {index !== STATUS_FLOW.length - 1 && (
                          <div className={`w-1 h-10 mt-1 ${line}`} />
                        )}
                      </div>

                      <div className="pt-1">
                        <h3
                          className={`font-semibold ${
                            completed
                              ? "text-green-600"
                              : current
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {step}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {completed
                            ? "Completed"
                            : current
                            ? "Current Status"
                            : "Upcoming"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-xl font-bold mb-6">Ordered Items</h2>

              <div className="space-y-5">
                {items.map((item, index) => {
                  const qty = Number(item.quantity || 1);
                  const price = Number(item.price || 0);

                  return (
                    <div
                      key={index}
                      className="border rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
                    >
                      <img
                        src={
                          item.image ||
                          item.imageUrl ||
                          "https://placehold.co/120x120?text=Food"
                        }
                        alt={item.name}
                        className="w-28 h-28 rounded-xl object-cover bg-gray-100"
                      />

                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-lg">
                              {item.name || item.foodName}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {item.category || "Food"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(price)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-5 text-sm">
                          <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-semibold">{qty}</p>
                          </div>

                          <div>
                            <p className="text-gray-500">Price</p>
                            <p className="font-semibold">
                              {formatCurrency(price)}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-bold text-green-600">
                              {formatCurrency(price * qty)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t mt-6 pt-6 flex justify-between items-center">
                <span className="text-lg font-semibold">Grand Total</span>

                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow p-6">
              <h2 className="font-bold text-xl mb-5">Order Details</h2>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Package className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Customer Order ID</p>
                    <p className="font-semibold break-all">
                      {order.displayOrderId ||
                        order.customerOrderId ||
                        order.orderNumber ||
                        order.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3 className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Order Status</p>
                    <p className="font-semibold">{currentStatus}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Payment Method</p>
                    <p className="font-semibold">
                      {order.paymentMethod || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Wallet className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Payment Status</p>
                    <p className="font-semibold">
                      {order.paymentStatus || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Order Date & Time</p>
                    <p className="font-semibold">
                      {formatDate(
                        order.createdAt ||
                          order.orderDate ||
                          order.timestamp
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow p-6">
  <h2 className="font-bold text-xl mb-5">Customer Information</h2>

  <div className="space-y-5">
    <div className="flex gap-3">
      <User className="text-blue-600 mt-1" size={20} />

      <div>
        <p className="text-gray-500 text-sm">Full Name</p>
        <p className="font-semibold">
          {order.fullName ||
            order.customerName ||
            order.name ||
            order.customer?.fullName ||
            order.customer?.customerName ||
            order.customer?.name ||
            order.customerInfo?.fullName ||
            order.customerInfo?.name ||
            "-"}
        </p>
      </div>
    </div>

    <div className="flex gap-3">
      <Phone className="text-blue-600 mt-1" size={20} />

      <div>
        <p className="text-gray-500 text-sm">Phone</p>
        <p className="font-semibold">
          {order.phone ||
            order.mobile ||
            order.phoneNumber ||
            order.customer?.phone ||
            order.customer?.mobile ||
            order.customer?.phoneNumber ||
            order.customerInfo?.phone ||
            order.customerInfo?.mobile ||
            "-"}
        </p>
      </div>
    </div>

    <div className="flex gap-3">
      <Mail className="text-blue-600 mt-1" size={20} />

      <div>
        <p className="text-gray-500 text-sm">Email</p>
        <p className="font-semibold break-all">
          {order.email ||
            order.customerEmail ||
            order.customer?.email ||
            order.customerInfo?.email ||
            "-"}
        </p>
      </div>
    </div>
  </div>
</div>

<div className="bg-white rounded-3xl shadow p-6">
  <h2 className="font-bold text-xl mb-5">Delivery Address</h2>

  <div className="flex gap-3">
    <MapPin className="text-blue-600 mt-1" size={20} />

    <div className="space-y-1">
      <p className="font-semibold">
        {order.customer?.address ||
  order.address ||
  order.deliveryAddress?.address ||
  order.deliveryAddress?.street ||
  order.addressDetails?.address ||
  order.shippingAddress?.address ||
  "-"}
      </p>

      <p className="text-slate-600">
        {order.customer?.city ||
  order.city ||
  order.deliveryAddress?.city ||
  order.addressDetails?.city ||
  order.shippingAddress?.city ||
  "-"}
        ,{" "}
        {order.customer?.state ||
  order.state ||
  order.deliveryAddress?.state ||
  order.addressDetails?.state ||
  order.shippingAddress?.state ||
  "-"}
      </p>

      <p className="text-slate-600">
        {order.customer?.pincode ||
  order.pincode ||
  order.pinCode ||
  order.deliveryAddress?.pincode ||
  order.deliveryAddress?.pinCode ||
  order.addressDetails?.pincode ||
  order.addressDetails?.pinCode ||
  order.shippingAddress?.pincode ||
  order.shippingAddress?.pinCode ||
  "-"}
      </p>
    </div>
  </div>
</div>
    

            <div className="bg-white rounded-3xl shadow p-6 space-y-4">
              <button
                onClick={() => navigate("/menu")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
              >
                <ArrowLeft size={18} />
                Back to Menu
              </button>

              <button
                onClick={() => navigate("/menu")}
                className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
              >
                <UtensilsCrossed size={18} />
                Place Another Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}