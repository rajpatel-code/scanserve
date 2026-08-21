import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setFirebaseError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const getFirebaseMessage = (code) => {
    switch (code) {
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      case "auth/invalid-email":
        return "Invalid email address.";
      default:
        return "Login failed. Please try again.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setFirebaseError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      navigate("/admin");
    } catch (error) {
      setFirebaseError(getFirebaseMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-white to-amber-100 px-4 py-10">
      <div className="absolute inset-0">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
            <ShieldCheck size={40} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Admin Login
          </h1>

          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the restaurant dashboard.
          </p>
        </div>

        {firebaseError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {firebaseError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <div className="flex items-center rounded-xl border border-gray-300 bg-white/80 px-4 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200">
              <Mail size={18} className="text-gray-500" />

              <input
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full bg-transparent px-3 py-3 text-gray-900 outline-none"
              />
            </div>

            {errors.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="flex items-center rounded-xl border border-gray-300 bg-white/80 px-4 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200">
              <Lock size={18} className="text-gray-500" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full bg-transparent px-3 py-3 text-gray-900 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-gray-500 transition hover:text-orange-600"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-2 text-sm text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />

              Remember Me
            </label>

            <button
              type="button"
              className="font-medium text-orange-600 transition hover:text-orange-700"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing In...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}