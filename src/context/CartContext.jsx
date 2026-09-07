import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { products } from '../data/products';

const STORAGE_KEY = 'tropitwist-cart';
const CartContext = createContext(null);

function readStoredCart() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readStoredCart);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const items = useMemo(
    () =>
      cart
        .map(({ productId, quantity }) => {
          const product = products.find((item) => item.id === productId);
          return product ? { product, quantity } : null;
        })
        .filter(Boolean),
    [cart],
  );

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    addToCart: (productId, quantity = 1) => {
      setCart((current) => {
        const existing = current.find((item) => item.productId === productId);
        if (existing) {
          return current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [...current, { productId, quantity }];
      });
    },
    updateQuantity: (productId, quantity) => {
      setCart((current) =>
        quantity > 0
          ? current.map((item) => item.productId === productId ? { ...item, quantity } : item)
          : current.filter((item) => item.productId !== productId),
      );
    },
    removeFromCart: (productId) => {
      setCart((current) => current.filter((item) => item.productId !== productId));
    },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
