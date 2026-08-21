import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  PackageOpen,
  AlertCircle,
  Leaf,
  Drumstick,
  Star,
  IndianRupee,
} from "lucide-react";
import { db } from "../firebase/firebase";


export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "menu"),
      (snapshot) => {
        const data = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));
console.log("Snapshot size:", snapshot.size);
console.log("Docs:", snapshot.docs);
console.log("Data:", data);
        setMenuItems(data);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error(err);
        setError("Failed to load menu items.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return menuItems.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const category = (item.category || "").toLowerCase();

      return name.includes(keyword) || category.includes(keyword);
    });
  }, [menuItems, search]);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "menu", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete menu item.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Menu Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage restaurant menu items in real time.
            </p>
          </div>

          <Link
            to="/admin/add-food"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Food
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search by food name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex h-72 flex-col items-center justify-center rounded-3xl bg-white shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="mt-4 text-slate-500">Loading menu...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <AlertCircle size={22} />
            <span>{error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 shadow-sm">
            <PackageOpen className="h-16 w-16 text-slate-300" />
            <h2 className="mt-5 text-xl font-semibold text-slate-700">
              No menu items found
            </h2>
            <p className="mt-2 text-slate-500">
              Add food items or try another search.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const isVeg =
                item.type?.toLowerCase() === "veg" ||
                item.foodType?.toLowerCase() === "veg" ||
                item.veg === true;

              const available =
                item.available !== undefined
                  ? item.available
                  : item.inStock !== undefined
                  ? item.inStock
                  : true;

              const featured =
                item.featured === true || item.isFeatured === true;

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative">
                    <img
                      src={
                        item.image ||
                        item.imageUrl ||
                        "https://placehold.co/600x400?text=Food"
                      }
                      alt={item.name}
                      className="h-56 w-full object-cover"
                    />

                    {featured && (
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                        <Star size={13} fill="currentColor" />
                        Featured
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-1 text-xl font-bold text-slate-900">
                        {item.name}
                      </h2>

                      <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-green-700">
                        <IndianRupee size={14} />
                        <span className="font-semibold">
                          {item.price ?? 0}
                        </span>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-sm text-slate-600">
                      {item.description || "No description available."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {item.category || "General"}
                      </span>

                      {isVeg ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          <Leaf size={13} />
                          Veg
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          <Drumstick size={13} />
                          Non-Veg
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          available
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {available ? "Available" : "Out of Stock"}
                      </span>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Link
                        to={`/admin/edit-food/${item.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 font-semibold text-white transition hover:bg-amber-600"
                      >
                        <Edit size={17} />
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 font-semibold text-white transition hover:bg-red-700"
                      >
                        <Trash2 size={17} />
                        Delete
                      </button>
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