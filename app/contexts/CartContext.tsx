import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getCart, addToCart as apiAdd, updateCartItem as apiUpdate, removeCartItem as apiRemove, clearCart as apiClear } from "../lib/api";
import { useAuth } from "./AuthContext";
import type { Cart, CartItem } from "../lib/types";

interface CartContextType {
  cart: Cart;
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);
const EMPTY_CART: Cart = { items: [] };

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(EMPTY_CART); return; }
    setLoading(true);
    try {
      const res = await getCart();
      setCart(res.data.data.cart ?? EMPTY_CART);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    const res = await apiAdd(productId, quantity);
    setCart(res.data.data.cart);
  };

  const updateItem = async (productId: string, quantity: number) => {
    const res = await apiUpdate(productId, quantity);
    setCart(res.data.data.cart);
  };

  const removeItem = async (productId: string) => {
    const res = await apiRemove(productId);
    setCart(res.data.data.cart);
  };

  const clearCart = async () => {
    await apiClear();
    setCart(EMPTY_CART);
  };

  const cartCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.items.reduce((s, i) => s + i.quantity * (i.product?.price ?? 0), 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, loading, addToCart, updateItem, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
