import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import { useWishlist } from "../context/WishlistContext";
import useCart from "../hooks/useCart";

function Wishlist() {
  const navigate = useNavigate();

  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <>
        <Navbar />

        <section className="min-h-screen bg-gray-50 flex justify-center items-center px-6">
          <div className="text-center">

            <Heart
              size={90}
              className="mx-auto text-red-500"
            />

            <h1 className="text-5xl font-black mt-6">
              Wishlist is Empty
            </h1>

            <p className="text-gray-500 mt-4 text-lg">
              Save your favourite dishes here.
            </p>

            <button
              onClick={() => navigate("/menu")}
              className="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold"
            >
              Browse Menu
            </button>

          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-16">

        <div className="max-w-7xl mx-auto px-6">

          <h1 className="text-5xl font-black mb-12">
            My Wishlist ❤️
          </h1>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg"
              >

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-60 object-cover"
                />

                <div className="p-6">

                  <h2 className="text-2xl font-bold">
                    {item.name}
                  </h2>

                  <p className="text-gray-500 mt-2">
                    {item.category}
                  </p>

                  <h3 className="text-3xl font-black text-orange-500 mt-4">
                    ₹{item.price}
                  </h3>

                  <div className="flex gap-3 mt-6">

                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Add
                    </button>

                    <button
                      onClick={() => toggleWishlist(item)}
                      className="w-14 rounded-xl bg-red-500 hover:bg-red-600 text-white flex justify-center items-center"
                    >
                      <Heart
                        size={20}
                        fill="white"
                      />
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </section>
    </>
  );
}

export default Wishlist;