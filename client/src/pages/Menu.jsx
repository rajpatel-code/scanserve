import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  Search,
  Heart,
  ShoppingCart,
  Loader2,
  AlertCircle,
  Star,
  Leaf,
  Drumstick,
  Sparkles,
} from "lucide-react";

const categories = [
  "All",
  "Pizza",
  "Burger",
  "Pasta",
  "Chinese",
  "Drinks",
  "Dessert",
];

export default function Menu() {
  const navigate = useNavigate();
const [searchParams] = useSearchParams();

const [menu, setMenu] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [search, setSearch] = useState(
  () => searchParams.get("search") || ""
);

const [selectedCategory, setSelectedCategory] = useState("All");
  const { addToCart } = useCart();


  const tableNumber = searchParams.get("table");
  useEffect(() => {
  const urlSearch = searchParams.get("search") || "";
  setSearch(urlSearch);
}, [searchParams]);

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem("scanserve_table", tableNumber);
    }
  }, [tableNumber]);


  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, "menu"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMenu(data);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error(err);
        setError("Unable to load menu. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const availableItems = useMemo(() => {
    return menu.filter((item) => item.available === true);
  }, [menu]);

  const featuredItems = useMemo(() => {
    return availableItems.filter((item) => item.featured === true).slice(0, 4);
  }, [availableItems]);

  const filteredItems = useMemo(() => {
    return availableItems.filter((item) => {
      const name = (item.name || item.foodName || "").toLowerCase();
      const category = (item.category || "").toLowerCase();

      const matchesSearch =
        name.includes(search.toLowerCase()) ||
        category.includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        category === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [availableItems, search, selectedCategory]);

  const { wishlist, toggleWishlist } = useWishlist();


  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <p className="text-gray-600 font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">

      {tableNumber && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-orange-50 border border-orange-200 px-5 py-3 text-center">
            <p className="font-semibold text-orange-700">
              🍽️ Ordering from Table {tableNumber}
            </p>
          </div>
        </div>
      )}


      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
       {/* Header */}
<div className="relative text-center">
  <h1 className="text-4xl font-extrabold text-gray-900">Our Menu</h1>

  <p className="mt-3 text-gray-500">
    Freshly prepared dishes made with premium ingredients.
  </p>

  <button
    onClick={() => navigate("/cart")}
    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-orange-600 hover:-translate-y-1"
  >
    <ShoppingCart className="h-5 w-5" />
    Go to Cart
  </button>
</div>

        {/* Featured */}
        {!search.trim() && featuredItems.length > 0 && (
          <section className="mt-10">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="text-orange-500" />
              <h2 className="text-2xl font-bold">Featured Dishes</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative">
                    <img
                      src={
                        item.image ||
                        item.imageUrl ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
                      }
                      alt={item.name || item.foodName}
                      className="h-52 w-full object-cover"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white">
                      Featured
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-bold">
                        {item.name || item.foodName}
                      </h3>

                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">4.8</span>
                      </div>
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm text-gray-500">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-orange-600">
                        ₹{Number(item.price).toFixed(2)}
                      </span>

                      <button
                        onClick={() => addToCart(item)}
                        className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search */}
        <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border bg-white py-3 pl-12 pr-4 outline-none transition focus:border-orange-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu */}
        <section className="mt-10">
          {filteredItems.length === 0 ? (
            <div className="rounded-3xl bg-white py-20 text-center shadow">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-700">
                No food items found
              </h3>
              <p className="mt-2 text-gray-500">
                Try changing your search or category.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl bg-white shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative">
                    <img
                      src={
                        item.image ||
                        item.imageUrl ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
                      }
                      alt={item.name || item.foodName}
                      className="h-56 w-full object-cover"
                    />

                    <button
  type="button"
  onClick={() => toggleWishlist(item)}
  className="absolute right-3 top-3 rounded-full bg-white p-2 shadow transition hover:scale-110"
  aria-label={
    wishlist.some((wishItem) => wishItem.id === item.id)
      ? "Remove from wishlist"
      : "Add to wishlist"
  }
>
  <Heart
    className={`h-5 w-5 ${
      wishlist.some((wishItem) => wishItem.id === item.id)
        ? "fill-red-500 text-red-500"
        : "text-gray-500"
    }`}
  />
</button>

                    {item.featured && (
                      <span className="absolute left-3 top-3 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {item.name || item.foodName}
                        </h3>

                        <p className="mt-1 text-sm text-orange-600">
                          {item.category}
                        </p>
                      </div>

                      <span className="text-xl font-bold text-orange-600">
                        ₹{Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                      {item.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          item.type === "Non-Veg" ||
                          item.veg === false ||
                          item.isVeg === false
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.type === "Non-Veg" ||
                        item.veg === false ||
                        item.isVeg === false ? (
                          <>
                            <Drumstick className="h-3.5 w-3.5" />
                            Non-Veg
                          </>
                        ) : (
                          <>
                            <Leaf className="h-3.5 w-3.5" />
                            Veg
                          </>
                        )}
                      </span>

                      {item.featured && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                          ⭐ Featured
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}