import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "scanserve_cart";
const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 499;
const GST_RATE = 0.05;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);
      if (!storedCart) return [];

      const parsedCart = JSON.parse(storedCart);
      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Failed to load cart:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cartItems]);

  const addToCart = useCallback((item) => {
    if (!item || item.id === undefined || item.id === null) return;

    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback(
    (id, quantity) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity,
              }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const increaseQuantity = useCallback((id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((id) => {
    setCartItems((prev) =>
      prev.reduce((acc, item) => {
        if (item.id !== id) {
          acc.push(item);
          return acc;
        }

        const newQuantity = item.quantity - 1;

        if (newQuantity > 0) {
          acc.push({
            ...item,
            quantity: newQuantity,
          });
        }

        return acc;
      }, [])
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0
    );
  }, [cartItems]);

  const deliveryFee = useMemo(() => {
    return subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0
      ? 0
      : DELIVERY_FEE;
  }, [subtotal]);

  const gst = useMemo(() => {
    return Number((subtotal * GST_RATE).toFixed(2));
  }, [subtotal]);

  const total = useMemo(() => {
    return Number((subtotal + deliveryFee + gst).toFixed(2));
  }, [subtotal, deliveryFee, gst]);

  const getSubtotal = useCallback(() => subtotal, [subtotal]);

  const getTotalItems = useCallback(() => totalItems, [totalItems]);

  const getCartTotal = useCallback(() => total, [total]);

  const isInCart = useCallback(
    (id) => cartItems.some((item) => item.id === id),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,

      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,

      totalItems,
      subtotal,
      deliveryFee,
      gst,
      total,

      getSubtotal,
      getTotalItems,
      getCartTotal,

      isInCart,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      totalItems,
      subtotal,
      deliveryFee,
      gst,
      total,
      getSubtotal,
      getTotalItems,
      getCartTotal,
      isInCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};

export default CartContext;