import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Wishlist from "./pages/Wishlist";
import TrackOrder from "./pages/TrackOrder";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMenu from "./pages/AdminMenu";
import AddFood from "./pages/AddFood";
import EditFood from "./pages/EditFood";
import TableQRCodes from "./pages/TableQRCodes";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <h1 className="text-7xl font-bold text-gray-900">404</h1>

      <p className="mt-4 text-2xl font-semibold text-gray-700">
        Page Not Found
      </p>

      <Link
        to="/"
        className="mt-8 rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800"
      >
        Go to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= CUSTOMER ROUTES ================= */}

        <Route path="/" element={<Home />} />

        <Route path="/menu" element={<Menu />} />

        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/success" element={<Success />} />

        <Route path="/admin/table-qr" element={<TableQRCodes />} />

        <Route
          path="/track-order/:orderId"
          element={<TrackOrder />}
        />

        {/* ================= ADMIN LOGIN ================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* ================= PROTECTED ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute>
              <AdminMenu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-food"
          element={
            <ProtectedRoute>
              <AddFood />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/edit-food/:id"
          element={
            <ProtectedRoute>
              <EditFood />
            </ProtectedRoute>
          }
        />

        {/* ================= 404 ================= */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;