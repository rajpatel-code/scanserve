import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  ArrowLeft,
  Save,
  Loader2,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const categories = [
  "Starter",
  "Main Course",
  "Biryani",
  "Pizza",
  "Burger",
  "Pasta",
  "Chinese",
  "South Indian",
  "North Indian",
  "Dessert",
  "Beverage",
  "Snack",
];

export default function AddFood() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    veg: true,
    available: true,
    featured: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Food name is required.";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required.";
    }

    if (!form.category) {
      newErrors.category = "Please select a category.";
    }

    if (form.price === "") {
      newErrors.price = "Price is required.";
    } else {
      const price = Number(form.price);
      if (Number.isNaN(price) || price <= 0) {
        newErrors.price = "Enter a valid price greater than 0.";
      }
    }

    if (!form.image.trim()) {
      newErrors.image = "Image URL is required.";
    } else {
      try {
        new URL(form.image);
      } catch {
        newErrors.image = "Enter a valid image URL.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    if (!validate()) return;

    try {
      setLoading(true);

      await addDoc(collection(db, "menu"), {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        image: form.image.trim(),
        veg: form.veg,
        available: form.available,
        featured: form.featured,
        createdAt: serverTimestamp(),
      });

      setMessage({
        type: "success",
        text: "Food item added successfully.",
      });

      setTimeout(() => {
        navigate("/admin/menu");
      }, 900);
    } catch (error) {
  console.error("ADD FOOD ERROR:", error);

  setMessage({
    type: "error",
    text: error?.message || "Failed to save food item.",
  });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white shadow-xl">
          <div className="border-b border-slate-200 p-6">
            <button
              onClick={() => navigate("/admin/menu")}
              className="mb-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-100 p-4">
                <UtensilsCrossed className="text-emerald-600" size={30} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Add Food Item
                </h1>
                <p className="mt-1 text-slate-500">
                  Create a new menu item for your restaurant.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {message.text && (
              <div
                className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Food Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-emerald-500 ${
                    errors.name ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Paneer Butter Masala"
                />

                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-500 ${
                    errors.category ? "border-red-500" : "border-slate-300"
                  }`}
                >
                  <option value="">Select Category</option>

                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    handleChange("description", e.target.value)
                  }
                  className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-500 ${
                    errors.description ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="Write a short description..."
                />

                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Price (₹)
                </label>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-500 ${
                    errors.price ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="199"
                />

                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Image URL
                </label>

                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-500 ${
                    errors.image ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="https://example.com/image.jpg"
                />

                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Food Type
                </label>

                <div className="flex gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={form.veg}
                      onChange={() => handleChange("veg", true)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span>Veg</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={!form.veg}
                      onChange={() => handleChange("veg", false)}
                      className="h-4 w-4 accent-red-600"
                    />
                    <span>Non-Veg</span>
                  </label>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Available
                    </h3>
                    <p className="text-sm text-slate-500">
                      Show item on customer menu.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleChange("available", !form.available)
                    }
                    className={`relative h-7 w-14 rounded-full transition ${
                      form.available ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        form.available ? "left-8" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Featured
                    </h3>
                    <p className="text-sm text-slate-500">
                      Highlight on homepage.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleChange("featured", !form.featured)
                    }
                    className={`relative h-7 w-14 rounded-full transition ${
                      form.featured ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        form.featured ? "left-8" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/menu")}
                disabled={loading}
                className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Food
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}