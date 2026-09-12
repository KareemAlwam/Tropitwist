import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const ProductCatalogContext = createContext(null);

export function ProductCatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const data = await api('/products?limit=100');
      setProducts(data);
      setStatus('ready');
    } catch (requestError) {
      setProducts([]);
      setError(requestError.message || 'The product catalog is unavailable.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(() => ({ products, status, error, reload }), [products, status, error, reload]);
  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export function useProductCatalog() {
  const context = useContext(ProductCatalogContext);
  if (!context) throw new Error('useProductCatalog must be used within ProductCatalogProvider');
  return context;
}
