import { useMemo, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { route } from '../../utils/routes';

const FILTERS = ['All products', 'Skincare', 'Body care', 'Bundles'];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Low to high' },
  { value: 'price-high', label: 'High to low' },
];
const CATEGORY_VALUES = {
  Skincare: 'skincare',
  'Body care': 'body',
  Bundles: 'bundles',
};

export default function Search() {
  const { addToCart } = useCart();
  const { products, status, error } = useProductCatalog();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All products');
  const [sort, setSort] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesQuery = !normalizedQuery
        || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(normalizedQuery);
      const matchesFilter = activeFilter === 'All products'
        || product.category === CATEGORY_VALUES[activeFilter];
      return matchesQuery && matchesFilter;
    });
    return [...filtered].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      return Number(b.featured) - Number(a.featured);
    });
  }, [activeFilter, normalizedQuery, sort]);

  return (
    <main>
      <section className="max-w-7xl mx-auto px-4 pt-8 md:pt-12">
        <div className="relative overflow-hidden rounded-brand bg-banana p-8 md:p-14 min-h-[360px]">
          <div className="relative z-10 max-w-xl">
            <p className="motion-rise text-[10px] font-bold tracking-[0.22em] mb-4">THE TROPITWIST FINDER</p>
            <h1 className="motion-reveal font-display font-bold text-ink text-7xl md:text-[9rem] leading-[0.78] tracking-tight">FIND YOUR<br /><span className="text-cherry">GLOW.</span></h1>
          </div>
          <div className="motion-orbit absolute right-8 top-8 hidden md:block rounded-full border-2 border-cherry bg-cream px-5 py-4 font-display text-3xl text-cherry">
            GLOW FINDER
          </div>
          <label className="motion-rise motion-delay-2 absolute left-8 right-8 bottom-8 md:left-auto md:right-14 md:bottom-14 md:w-[380px]">
            <span className="sr-only">Search products</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search creams, oils, glow..."
              className="w-full rounded-full border-2 border-ink bg-cream px-5 py-4 text-sm placeholder:text-ink/45 focus:outline-none focus:ring-4 focus:ring-cherry/25"
            />
          </label>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {FILTERS.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-full px-4 py-2.5 text-[10px] font-bold tracking-widest transition-colors ${activeFilter === filter ? 'bg-ink text-cream' : 'border border-ink/15 hover:border-cherry hover:text-cherry'}`}>
              {filter}
            </button>
          ))}
          <div className="relative ml-auto">
            <button type="button" onClick={() => setSortOpen((open) => !open)} aria-expanded={sortOpen} className="flex items-center gap-3 text-[10px] font-bold tracking-widest">
              SORT: {SORT_OPTIONS.find((option) => option.value === sort).label.toUpperCase()} <span className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}>⌄</span>
            </button>
            {sortOpen && <div className="absolute right-0 top-8 z-20 w-52 rounded-brand border border-ink/10 bg-cream p-2 soft-shadow">{SORT_OPTIONS.map((option) => <button type="button" key={option.value} onClick={() => { setSort(option.value); setSortOpen(false); }} className={`block w-full rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${sort === option.value ? 'bg-banana font-bold' : 'hover:bg-ink/5'}`}>{option.label}</button>)}</div>}
          </div>
        </div>

        <p className="text-xs text-ink/50 mb-6">{status === 'loading' ? 'Loading products...' : `${results.length} ${results.length === 1 ? 'product' : 'products'} found${query ? ` for “${query}”` : ''}`}</p>
        {status === 'error' ? (
          <div className="card-enter rounded-brand bg-banana p-12 text-center"><h2 className="font-display font-bold text-5xl">CATALOG UNAVAILABLE.</h2><p className="mt-3 text-sm text-ink/65">{error}</p></div>
        ) : status === 'loading' ? (
          <div className="card-enter rounded-brand bg-banana p-12 text-center"><p className="text-sm text-ink/65">Loading products...</p></div>
        ) : results.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
            {results.map((product, index) => (
              <article key={product.id} className="group card-enter" style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}>
                <a href={route(`/products/${product.id}`)} className="block">
                  <div className="relative aspect-[4/5] rounded-brand overflow-hidden bg-[#FFF1D8] soft-shadow hover-lift">
                    {product.bestseller && <span className="absolute left-4 top-4 z-10 rounded-full bg-cherry text-cream px-3 py-1.5 text-[9px] font-bold tracking-widest">BESTSELLER</span>}
                    {product.compareAtPrice > product.price && <span className="absolute right-4 top-4 z-10 rounded-full bg-banana px-3 py-1.5 text-[9px] font-bold tracking-widest">SALE</span>}
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                  </div>
                </a>
                <div className="flex items-start justify-between gap-4 pt-4">
                  <div><h2 className="font-body font-semibold text-sm">{product.name}</h2><p className="mt-1 text-xs text-ink/50">{product.category}</p></div>
                  <span className="text-right whitespace-nowrap"><span className="block font-bold text-sm">LE {product.price}</span>{product.compareAtPrice > product.price && <span className="block text-xs text-ink/40 line-through">LE {product.compareAtPrice}</span>}</span>
                </div>
                <button onClick={() => addToCart(product.id)} className="mt-4 w-full rounded-full border border-ink/15 py-3 text-[10px] font-bold tracking-widest hover:border-cherry hover:bg-cherry hover:text-cream transition-colors">ADD TO CART</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="card-enter rounded-brand bg-banana p-12 text-center">
            <h2 className="font-display font-bold text-5xl">NO GLOW FOUND.</h2>
            <p className="mt-3 text-sm text-ink/65">Try another search or explore all products.</p>
            <button onClick={() => { setQuery(''); setActiveFilter('All products'); }} className="mt-6 rounded-full bg-ink text-cream px-6 py-3 text-xs font-bold tracking-widest">CLEAR SEARCH</button>
          </div>
        )}
      </section>
    </main>
  );
}
