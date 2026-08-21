import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");

    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (item) => {
    const exists = wishlist.find((food) => food.id === item.id);

    if (exists) {
      setWishlist(
        wishlist.filter((food) => food.id !== item.id)
      );
    } else {
      setWishlist([...wishlist, item]);
    }
  };

  const isWishlisted = (id) => {
    return wishlist.some((food) => food.id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);