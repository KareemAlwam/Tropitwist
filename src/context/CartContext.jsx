import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readStorage, writeStorage } from '../services/storage';
import { useProductCatalog } from './ProductCatalogContext';

const STORAGE_KEY = 'tropitwist-cart';
const CartContext = createContext(null);

function readStoredCart() {
  return readStorage(STORAGE_KEY, []);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readStoredCart);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const { products, status: catalogStatus, error: catalogError } = useProductCatalog();

  useEffect(() => {
    writeStorage(STORAGE_KEY, cart);
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
    itemCount: cart.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    catalogStatus,
    catalogError,
    lastAddedItem,
    clearLastAddedItem: () => setLastAddedItem(null),
    addToCart: (productId, quantity = 1) => {
      const product = products.find((item) => item.id === productId);
      if (product) {
        setLastAddedItem({ product, quantity, addedAt: Date.now() });
      }
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
    clearCart: () => setCart([]),
  }), [cart, catalogError, catalogStatus, items, lastAddedItem, products]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
