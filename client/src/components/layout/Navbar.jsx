import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiHeart,
} from "react-icons/fi";

import useCart from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";

function Navbar() {
  const navigate = useNavigate();

  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/menu?search=${search}`);
      setShowSearch(false);
      setSearch("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}

        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <h1 className="text-3xl font-extrabold text-orange-500">
            Raj Cafe
          </h1>

          <span className="text-3xl">☕</span>
        </div>

        {/* Navigation */}

        <ul className="hidden lg:flex items-center gap-10 font-medium">

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-orange-500 font-semibold"
                : "text-gray-700 hover:text-orange-500 transition"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/menu"
            className={({ isActive }) =>
              isActive
                ? "text-orange-500 font-semibold"
                : "text-gray-700 hover:text-orange-500 transition"
            }
          >
            Menu
          </NavLink>

          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              isActive
                ? "text-orange-500 font-semibold"
                : "text-gray-700 hover:text-orange-500 transition"
            }
          >
            Wishlist
          </NavLink>

          <li className="text-gray-700 hover:text-orange-500 cursor-pointer">
            Offers
          </li>

          <li className="text-gray-700 hover:text-orange-500 cursor-pointer">
            Reviews
          </li>

          <li className="text-gray-700 hover:text-orange-500 cursor-pointer">
            Contact
          </li>

        </ul>

        {/* Right */}

        <div className="flex items-center gap-5">

          {/* Search */}

          {showSearch ? (
            <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2">

              <FiSearch className="text-gray-500" />

              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search food..."
                className="bg-transparent outline-none px-2 w-48"
              />

              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearch("");
                }}
              >
                <FiX />
              </button>

            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="text-2xl hover:text-orange-500 transition"
            >
              <FiSearch />
            </button>
          )}

          {/* Wishlist */}

          <button
            onClick={() => navigate("/wishlist")}
            className="relative"
          >
            <FiHeart className="text-2xl hover:text-red-500 transition" />

            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart */}

          <button
            onClick={() => navigate("/cart")}
            className="relative"
          >
            <FiShoppingCart className="text-2xl hover:text-orange-500 transition" />

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Order */}

          <button
            onClick={() => navigate("/menu")}
            className="hidden md:block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Order Now
          </button>

          <FiMenu className="text-2xl lg:hidden cursor-pointer" />

        </div>

      </div>

    </nav>
  );
}

export default Navbar;