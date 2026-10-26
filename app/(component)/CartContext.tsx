"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const MAX_QUANTITY = 99;
const CartContext = createContext<CartContextType | undefined>(undefined);

function readCart(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    const unique = new Map<number, CartItem>();
    for (const candidate of parsed.slice(0, 100)) {
      if (!candidate || typeof candidate !== 'object') continue;
      const item = candidate as Partial<CartItem>;
      if (!Number.isSafeInteger(item.id) || (item.id ?? 0) <= 0 ||
          !Number.isSafeInteger(item.quantity) || (item.quantity ?? 0) < 1 ||
          typeof item.name !== 'string' || typeof item.price !== 'number' ||
          !Number.isFinite(item.price) || item.price < 0 || typeof item.image !== 'string') continue;
      // Cart data is a display cache; checkout verifies every price and item on the server.
      unique.set(item.id!, {
        id: item.id!, name: item.name.slice(0, 200), price: item.price,
        quantity: Math.min(item.quantity!, MAX_QUANTITY),
        image: item.image.startsWith('/') && !item.image.startsWith('//') ? item.image : '/shop.webp',
        categoryId: Number.isSafeInteger(item.categoryId) ? item.categoryId! : 0,
        inventory: Number.isSafeInteger(item.inventory) && item.inventory! >= 0 ? item.inventory : undefined,
      });
    }
    return Array.from(unique.values());
  } catch { return []; }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let stored: CartItem[] = [];
    try { stored = readCart(window.localStorage.getItem('cart')); } catch { /* Storage may be disabled. */ }
    setItems(stored);
    setHydrated(true);
    const controller = new AbortController();
    fetch('/api/products', { signal: controller.signal, cache: 'no-store' })
      .then(async response => response.ok ? response.json() as Promise<Product[]> : null)
      .then(products => {
        if (!Array.isArray(products)) return;
        setItems(current => current.map(item => {
          const product = products.find(entry => entry.id === item.id);
          return product ? { ...item, name: product.name, price: product.price, image: product.image, inventory: product.inventory } : { ...item, inventory: 0 };
        }));
      }).catch(() => { /* Checkout independently confirms availability. */ });
    const synchronize = (event: StorageEvent) => { if (event.key === 'cart') setItems(readCart(event.newValue)); };
    window.addEventListener('storage', synchronize);
    return () => { controller.abort(); window.removeEventListener('storage', synchronize); };
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem('cart', JSON.stringify(items)); } catch { /* Keep the in-memory cart usable. */ }
  }, [items, hydrated]);

  const addItem = (product: Product, quantity: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || product.inventory < 1) return;
    setItems(current => {
      const existing = current.find(item => item.id === product.id);
      const next = { id: product.id, name: product.name, price: product.price, image: product.image, categoryId: product.categoryId,
        inventory: product.inventory, quantity: Math.min((existing?.quantity ?? 0) + quantity, MAX_QUANTITY, product.inventory) };
      return existing ? current.map(item => item.id === product.id ? next : item) : [...current, next].slice(0, 100);
    });
  };
  const updateItemQuantity = (id: number, quantity: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    setItems(current => current.map(item => item.id === id ? {
      ...item, quantity: Math.min(quantity, MAX_QUANTITY, Math.max(1, item.inventory ?? MAX_QUANTITY)),
    } : item));
  };
  const removeItem = (id: number) => setItems(current => current.filter(item => item.id !== id));
  const clearCart = () => setItems([]);
  const completePurchase = (purchased: Array<{ id: number; quantity: number }>) => setItems(current => current
    .map(item => ({ ...item, quantity: item.quantity - (purchased.find(entry => entry.id === item.id)?.quantity ?? 0) }))
    .filter(item => item.quantity > 0));
  return <CartContext.Provider value={{ items, hydrated, addItem, updateItemQuantity, removeItem, clearCart, completePurchase }}>{children}</CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
