"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Browser-only state is hydrated once from local storage. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORE_CONFIG, type FulfillmentMethod } from "@/lib/store-config";

export type CartProduct = { id: string; brand: string; title: string; price: number; imageLabel: string };
export type CartItem = CartProduct & { quantity: number };
type CartContextValue = {
  items: CartItem[]; fulfillmentMethod: FulfillmentMethod; itemCount: number; subtotal: number; fulfillmentFee: number; total: number;
  addItem: (product: CartProduct) => void; removeItem: (id: string) => void; setFulfillmentMethod: (method: FulfillmentMethod) => void;
};
const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "okoume-store-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("delivery");
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => { try { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved) { const parsed = JSON.parse(saved) as Pick<CartContextValue, "items" | "fulfillmentMethod">; if (Array.isArray(parsed.items)) setItems(parsed.items); if (parsed.fulfillmentMethod === "delivery" || parsed.fulfillmentMethod === "pickup") setFulfillmentMethod(parsed.fulfillmentMethod); } } catch { window.localStorage.removeItem(STORAGE_KEY); } finally { setIsHydrated(true); } }, []);
  useEffect(() => { if (isHydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, fulfillmentMethod })); }, [items, fulfillmentMethod, isHydrated]);
  const addItem = useCallback((product: CartProduct) => setItems((current) => { const existing = current.find((item) => item.id === product.id); return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]; }), []);
  const removeItem = useCallback((id: string) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const value = useMemo(() => { const itemCount = items.reduce((sum, item) => sum + item.quantity, 0); const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0); const fulfillmentFee = fulfillmentMethod === "delivery" ? STORE_CONFIG.delivery.fee : STORE_CONFIG.pickup.fee; return { items, fulfillmentMethod, itemCount, subtotal, fulfillmentFee, total: subtotal + fulfillmentFee, addItem, removeItem, setFulfillmentMethod }; }, [addItem, fulfillmentMethod, items, removeItem]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used within CartProvider"); return context; }
