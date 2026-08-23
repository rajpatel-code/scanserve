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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/menu?search=${encodeURIComponent(search.trim())}`);
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
          <img
  src="/raj-cafe-logo.jpeg"
  alt="Raj Cafe"
  className="h-14 w-14 object-contain"
/>


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

          <NavLink
  to="/offers"
  className={({ isActive }) =>
    isActive
      ? "text-orange-500 font-semibold"
      : "text-gray-700 hover:text-orange-500 transition"
  }
>
  Offers
</NavLink>

<NavLink
  to="/reviews"
  className={({ isActive }) =>
    isActive
      ? "text-orange-500 font-semibold"
      : "text-gray-700 hover:text-orange-500 transition"
  }
>
  Reviews
</NavLink>

<NavLink
  to="/contact"
  className={({ isActive }) =>
    isActive
      ? "text-orange-500 font-semibold"
      : "text-gray-700 hover:text-orange-500 transition"
  }
>
  Contact
</NavLink>

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

          <button
  type="button"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  className="relative z-50 text-2xl lg:hidden cursor-pointer p-2"
  aria-label="Toggle mobile menu"
>
  {mobileMenuOpen ? <FiX /> : <FiMenu />}
</button>

        </div>

      </div>


{mobileMenuOpen && (
  <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
    <div className="flex flex-col px-6 py-4 gap-4 font-medium">
      <NavLink
        to="/"
        onClick={() => setMobileMenuOpen(false)}
        className="text-gray-700 hover:text-orange-500"
      >
        Home
      </NavLink>

      <NavLink
        to="/menu"
        onClick={() => setMobileMenuOpen(false)}
        className="text-gray-700 hover:text-orange-500"
      >
        Menu
      </NavLink>

      <NavLink
        to="/wishlist"
        onClick={() => setMobileMenuOpen(false)}
        className="text-gray-700 hover:text-orange-500"
      >
        Wishlist
      </NavLink>

      <NavLink
  to="/offers"
  onClick={() => setMobileMenuOpen(false)}
  className="text-gray-700 hover:text-orange-500"
>
  Offers
</NavLink>

<NavLink
  to="/reviews"
  onClick={() => setMobileMenuOpen(false)}
  className="text-gray-700 hover:text-orange-500"
>
  Reviews
</NavLink>

<NavLink
  to="/contact"
  onClick={() => setMobileMenuOpen(false)}
  className="text-gray-700 hover:text-orange-500"
>
  Contact
</NavLink>

      <button
        onClick={() => {
          setMobileMenuOpen(false);
          navigate("/menu");
        }}
        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-semibold"
      >
        Order Now
      </button>
    </div>
  </div>
)}




    </nav>
  );
}

export default Navbar;