import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
  UtensilsCrossed,
} from "lucide-react";

const categories = [
  "Starter",
  "Main Course",
  "Pizza",
  "Burger",
  "Pasta",
  "Sandwich",
  "Chinese",
  "South Indian",
  "North Indian",
  "Dessert",
  "Beverage",
  "Snack",
  "Combo",
  "Other",
];

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  veg: true,
  available: true,
  featured: false,
};

export default function EditFood() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!id) {
      setError("Invalid food item.");
      setLoading(false);
      return;
    }

    const foodRef = doc(db, "menu", id);

    const unsubscribe = onSnapshot(
      foodRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("Food item not found.");
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        setForm({
          name: data.name || "",
          description: data.description || "",
          price:
            data.price !== undefined && data.price !== null
              ? String(data.price)
              : "",
          category: data.category || "",
          image: data.image || "",
          veg: data.veg ?? true,
          available: data.available ?? true,
          featured: data.featured ?? false,
        });

        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to load food item.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const previewImage = useMemo(() => {
    if (!form.image.trim()) return "";
    return form.image.trim();
  }, [form.image]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setValidationErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
  };

  const validate = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Food name is required.";
    }

    if (!form.description.trim()) {
      errors.description = "Description is required.";
    }

    if (!form.category.trim()) {
      errors.category = "Please select a category.";
    }

    if (form.price === "") {
      errors.price = "Price is required.";
    } else if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      errors.price = "Enter a valid price.";
    }

    if (!form.image.trim()) {
      errors.image = "Image URL is required.";
    } else {
      try {
        new URL(form.image);
      } catch {
        errors.image = "Enter a valid image URL.";
      }
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validate()) return;

    setUpdating(true);

    try {
      await updateDoc(doc(db, "menu", id), {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        image: form.image.trim(),
        veg: form.veg,
        available: form.available,
        featured: form.featured,
        updatedAt: serverTimestamp(),
      });

      navigate("/admin/menu");
    } catch (err) {
      console.error(err);
      setError("Failed to update food item. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="flex items-center gap-3 rounded-xl bg-white shadow-lg px-6 py-5">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="font-medium text-gray-700">
            Loading food details...
          </span>
        </div>
      </div>
    );
  }

  if (error && !form.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl bg-white shadow-xl p-8 text-center">
          <AlertCircle className="mx-auto h-14 w-14 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
          <p className="text-gray-600 mt-2">{error}</p>

          <button
            onClick={() => navigate("/admin/menu")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white font-medium hover:bg-green-700 transition"
          >
            <ArrowLeft size={18} />
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <UtensilsCrossed className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">Edit Food Item</h1>
                <p className="text-green-100 mt-1">
                  Update menu information and save changes.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid lg:grid-cols-2 gap-8 p-8"
          >
            <div className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Food Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  rows={5}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.description}
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  {validationErrors.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Category</option>

                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  {validationErrors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.category}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Image URL
                </label>

                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                {validationErrors.image && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.image}
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="veg"
                    checked={form.veg}
                    onChange={handleChange}
                    className="h-5 w-5 accent-green-600"
                  />

                  <span className="font-medium">Veg Item</span>
                </label>

                <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="available"
                    checked={form.available}
                    onChange={handleChange}
                    className="h-5 w-5 accent-green-600"
                  />

                  <span className="font-medium">Available</span>
                </label>

                <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50 sm:col-span-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                    className="h-5 w-5 accent-green-600"
                  />

                  <span className="font-medium">Featured Item</span>
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border bg-gray-50 overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={form.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                      Image Preview
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900">
                    {form.name || "Food Name"}
                  </h2>

                  <p className="text-gray-600 mt-2 line-clamp-4">
                    {form.description || "Food description will appear here."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                      ₹ {form.price || "0"}
                    </span>

                    {form.category && (
                      <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium">
                        {form.category}
                      </span>
                    )}

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        form.veg
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {form.veg ? "Veg" : "Non-Veg"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        form.available
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {form.available ? "Available" : "Unavailable"}
                    </span>

                    {form.featured && (
                      <span className="rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-sm font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 transition disabled:opacity-70"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() => navigate("/admin/menu")}
                  className="flex-1 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold px-6 py-3 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}