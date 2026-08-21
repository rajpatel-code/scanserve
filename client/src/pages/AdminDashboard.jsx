import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Clock3,
  ChefHat,
  CheckCircle2,
  IndianRupee,
  Trash2,
  ExternalLink,
  Loader2,
  Package,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  CreditCard,
  Hash,
  User,
  Utensils,
  LogOut,
} from "lucide-react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const STATUS_OPTIONS = [
  "Pending",
  "Accepted",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
];

const statusStyles = {
  Pending:
    "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
  Accepted:
    "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
  Preparing:
    "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300",
  Ready:
    "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
  "Out for Delivery":
    "bg-cyan-100 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300",
  Delivered:
    "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
};

const paymentStyles = {
  Paid:
    "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
  Pending:
    "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (createdAt) => {
  if (!createdAt) return "-";

  try {
    const date =
      typeof createdAt?.toDate === "function"
        ? createdAt.toDate()
        : new Date(createdAt);

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "-";
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
  let unsubscribeOrders;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      navigate("/admin/login", { replace: true });
      return;
    }

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    unsubscribeOrders = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error("Orders Listener Error:", error);
        setLoading(false);
      }
    );
  });

  return () => {
    unsubscribeAuth();

    if (unsubscribeOrders) {
      unsubscribeOrders();
    }
  };
}, [navigate]);

  const filteredOrders = useMemo(() => {
  return orders.filter((order) => {
    const customerName = String(
  order.customer?.fullName || order.customerName || ""
).toLowerCase();

const orderId = String(
  order.displayOrderId ||
    order.customerOrderId ||
    order.id ||
    ""
).toLowerCase();

const phone = String(
  order.customer?.phone || order.phone || ""
).toLowerCase();

const keyword = search.toLowerCase();

const searchMatch =
  customerName.includes(keyword) ||
  orderId.includes(keyword) ||
  phone.includes(keyword);

    const statusMatch =
      statusFilter === "All" || order.status === statusFilter;

    return searchMatch && statusMatch;
  });
}, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      preparing: orders.filter((o) => o.status === "Preparing").length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      revenue: orders
        .filter((o) => o.status === "Delivered")
        .reduce((sum, o) => sum + Number(o.grandTotal || o.total || 0), 0),
    };
  }, [orders]);


  const tableStats = useMemo(() => {
  const tables = {};

  orders.forEach((order) => {
    const table = order.tableNumber;

    if (!table) return;
    if (order.status === "Delivered") return;

    if (!tables[table]) {
      tables[table] = {
        tableNumber: table,
        orders: 0,
        total: 0,
      };
    }

    tables[table].orders += 1;
    tables[table].total += Number(
      order.grandTotal || order.total || 0
    );
  });

  return Object.values(tables).sort(
    (a, b) => Number(a.tableNumber) - Number(b.tableNumber)
  );
}, [orders]);



  const updateStatus = async (id, status) => {
  try {
    const orderRef = doc(db, "orders", id);

    const order = orders.find((o) => o.id === id);

    const updates = {
      status,
    };

    // COD order delivered hone par payment paid mark karo
    if (
      status === "Delivered" &&
      order?.paymentMethod === "Cash on Delivery"
    ) {
      updates.paymentStatus = "Paid";
    }

    await updateDoc(orderRef, updates);
  } catch (error) {
    console.error("Update Status Error:", error);
    alert("Unable to update order status.");
  }
};

  const deleteOrder = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "orders", id));
    } catch (error) {
      console.error(error);
      alert("Unable to delete order.");
    }
  };

  const handleLogout = async () => {
  try {
    await signOut(auth);
    navigate("/admin/login", { replace: true });
  } catch (error) {
    console.error("Logout Error:", error);
    alert("Unable to logout. Please try again.");
  }
};

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">{value}</h2>
        </div>

        <div
          className={`rounded-xl p-3 ${color}`}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">
      Admin Dashboard
    </h1>

    <p className="mt-2 text-gray-500">
      Real-time Restaurant Order Management
    </p>
  </div>

  <button
    onClick={handleLogout}
    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
  >
    <LogOut className="h-5 w-5" />
    Logout
  </button>
</div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Orders"
            value={stats.total}
            icon={ShoppingBag}
            color="bg-blue-100 text-blue-700"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock3}
            color="bg-yellow-100 text-yellow-700"
          />

          <StatCard
            title="Preparing"
            value={stats.preparing}
            icon={ChefHat}
            color="bg-orange-100 text-orange-700"
          />

          <StatCard
            title="Delivered"
            value={stats.delivered}
            icon={CheckCircle2}
            color="bg-green-100 text-green-700"
          />

          <StatCard
            title="Revenue"
            value={formatCurrency(stats.revenue)}
            icon={IndianRupee}
            color="bg-emerald-100 text-emerald-700"
          />
        </div>

                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="mb-5">
    <h2 className="text-xl font-bold text-gray-900">
      Table-wise Active Orders
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Active dine-in orders by restaurant table
    </p>
  </div>

  {tableStats.length === 0 ? (
    <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">
      No active table orders
    </div>
  ) : (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tableStats.map((table) => (
        <div
          key={table.tableNumber}
          className="rounded-2xl border border-orange-200 bg-orange-50 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Table
              </p>

              <h3 className="mt-1 text-2xl font-bold text-orange-600">
                {table.tableNumber}
              </h3>
            </div>

            <Utensils className="h-8 w-8 text-orange-500" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Active Orders
            </span>

            <span className="font-bold text-gray-900">
              {table.orders}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Order Value
            </span>

            <span className="font-bold text-gray-900">
              {formatCurrency(table.total)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )}
</div>




          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />

              <input
                type="text"
                placeholder="Search customer, order ID, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:border-red-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border px-4 py-3 outline-none focus:border-red-500"
            >
              <option>All</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border bg-white p-16 text-center shadow-sm">
            <Package className="mx-auto h-20 w-20 text-gray-300" />
            <h2 className="mt-5 text-2xl font-bold text-gray-800">
              No Orders Found
            </h2>
            <p className="mt-2 text-gray-500">
              Orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const items = order.items || [];

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl border bg-white shadow-sm"
                >
                  <div className="border-b bg-gray-50 p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span className="text-sm break-all">
                            {order.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {order.displayOrderId ||
                              order.customerOrderId ||
                              "-"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                         <User className="h-4 w-4 text-gray-500" />
                         <span>{order.customer?.fullName || order.customerName || "-"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                         <Phone className="h-4 w-4 text-gray-500" />
                         <span>{order.customer?.phone || order.phone || "-"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                         <Mail className="h-4 w-4 text-gray-500" />
                         <span className="break-all">
                         {order.customer?.email || order.email || "-"}
                         </span>
                         </div>

                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold text-orange-600">
                        Table {order.tableNumber || "Delivery"}
                        </span>
                        </div>

                        <div className="flex items-start gap-2 md:col-span-2 xl:col-span-3">
                          <MapPin className="mt-1 h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700 break-words">
                          {order.customer?.address || order.address || "-"}
                           </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span>{order.paymentMethod}</span>
                        </div>

                        <div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              paymentStyles[
                                order.paymentStatus || "Pending"
                              ]
                            }`}
                          >
                            {order.paymentStatus || "Pending"}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[
                                order.status || "Pending"
                              ]
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="w-full max-w-xs space-y-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order.id, e.target.value)
                          }
                          className="w-full rounded-xl border px-4 py-3"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>

                        <div className="flex gap-2">
                          <Link
                            to={`/track-order/${order.id}`}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Track
                          </Link>

                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="flex items-center justify-center rounded-xl bg-red-600 px-4 text-white transition hover:bg-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto p-6">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-gray-500">
                          <th className="pb-3">Item</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Qty</th>
                          <th className="pb-3">Price</th>
                          <th className="pb-3">Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b last:border-none"
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    item.image ||
                                    item.imageUrl ||
                                    "https://placehold.co/80x80?text=Food"
                                  }
                                  alt={item.name}
                                  className="h-16 w-16 rounded-xl object-cover"
                                />

                                <span className="font-medium">
                                  {item.name}
                                </span>
                              </div>
                            </td>

                            <td>{item.category}</td>

                            <td>{item.quantity}</td>

                            <td>{formatCurrency(item.price)}</td>

                            <td>
                              {formatCurrency(
                                Number(item.price || 0) *
                                  Number(item.quantity || 1)
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-6 flex flex-col gap-3 border-t pt-5 text-sm md:flex-row md:justify-between">
                      <div className="font-medium text-gray-600">
                        Total Items : {items.length}
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          Grand Total :{" "}
                          {formatCurrency(
                            order.grandTotal || order.total || 0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}