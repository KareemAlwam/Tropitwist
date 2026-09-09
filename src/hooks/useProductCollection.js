import { useMemo, useState } from 'react';
import { products } from '../data/products';

export function useProductCollection({ category, allFilter }) {
  const [activeFilter, setActiveFilter] = useState(allFilter);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = products.filter((product) => product.category === category && (activeFilter === allFilter || product.type === activeFilter.toLowerCase()) && `${product.name} ${product.description}`.toLowerCase().includes(normalizedQuery));
    return [...filtered].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : Number(b.featured) - Number(a.featured));
  }, [activeFilter, allFilter, category, query, sort]);
  return { activeFilter, items, query, setActiveFilter, setQuery, setSort, sort };
}
