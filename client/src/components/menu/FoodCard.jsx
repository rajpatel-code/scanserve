import { Heart, Star, Plus } from "lucide-react";
import useCart from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";

function FoodCard({ item }) {
  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isWishlisted,
  } = useWishlist();

  const liked = isWishlisted(item.id);

  return (
    <div className="group bg-white rounded-[32px] overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

      {/* Image */}

      <div className="relative overflow-hidden">

        <img
          src={item.image}
          alt={item.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
        />

        {item.bestSeller && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-full">
            🔥 Best Seller
          </div>
        )}

        {/* Wishlist */}

        <button
          onClick={() => toggleWishlist(item)}
          className={`absolute top-4 right-4 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition ${
            liked
              ? "bg-red-500 text-white"
              : "bg-white hover:bg-orange-500 hover:text-white"
          }`}
        >
          <Heart
            size={18}
            fill={liked ? "currentColor" : "none"}
          />
        </button>

      </div>

      {/* Content */}

      <div className="p-6">

        <div className="flex justify-between items-start">

          <div>

            <h3 className="text-xl font-bold text-gray-900">
              {item.name}
            </h3>

            <p className="text-gray-500 mt-1">
              {item.category}
            </p>

          </div>

          <div className="flex items-center gap-1 text-yellow-500 font-semibold">

            <Star
              size={16}
              fill="currentColor"
            />

            {item.rating}

          </div>

        </div>

        <div className="mt-6 flex justify-between items-center">

          <h2 className="text-3xl font-black text-orange-500">
            ₹{item.price}
          </h2>

          <button
            onClick={() => addToCart(item)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-semibold transition"
          >
            <Plus size={18} />
            Add
          </button>

        </div>

      </div>

    </div>
  );
}

export default FoodCard;