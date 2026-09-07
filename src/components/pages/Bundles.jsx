import { useMemo, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';
import { route } from '../../utils/routes';
import CollectionSearch from '../ui/CollectionSearch';

const FILTERS = ['All bundles', 'Skincare sets', 'Body sets', 'Gift sets'];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
];

export default function Bundles() {
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState('All bundles');
  const [sort, setSort] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [query, setQuery] = useState('');
  const bundleProducts = useMemo(() => {
    const filtered = products.filter((product) =>
      product.category === 'bundles'
      && (activeFilter === 'All bundles' || product.type === activeFilter.toLowerCase())
      && `${product.name} ${product.description}`.toLowerCase().includes(query.trim().toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      return Number(b.featured) - Number(a.featured);
    });
  }, [activeFilter, query, sort]);

  return (
    <main>
      <section className="border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <p className="font-body text-[10px] font-bold tracking-[0.22em] text-cherry mb-4">TROPITWIST BUNDLES</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="font-display font-bold text-ink text-6xl md:text-[8rem] leading-[0.82] tracking-tight">MORE GLOW,<br /><span className="text-cherry">LESS GUESSING.</span></h1>
              <p className="font-body text-sm md:text-base text-ink/65 max-w-md mt-7 leading-relaxed">Curated routines that make good skin days easier, with a little extra value built in.</p>
            </div>
            <p className="font-body text-xs text-ink/55 leading-relaxed md:max-w-xs md:text-right">Pair your essentials, save on the routine, and make gifting feel effortless.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <CollectionSearch value={query} onChange={setQuery} placeholder="Search bundles" />
          <div className="flex flex-wrap items-center gap-2">
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
        </div>

        {bundleProducts.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
            {bundleProducts.map((product) => (
              <article key={product.id} className="group">
                <a href={route(`/products/${product.id}`)} className="block">
                  <div className="relative aspect-[4/5] rounded-brand overflow-hidden bg-[#FFF1D8] soft-shadow">
                    <span className="absolute left-4 top-4 z-10 rounded-full bg-banana px-3 py-1.5 text-[9px] font-bold tracking-widest">BUNDLE & SAVE</span>
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                  </div>
                </a>
                <div className="flex items-start justify-between gap-4 pt-4">
                  <div><h2 className="font-body font-semibold text-sm">{product.name}</h2><p className="mt-1 text-xs text-ink/50">{product.description}</p></div>
                  <span className="text-right whitespace-nowrap"><span className="block font-bold text-sm">LE {product.price}</span>{product.compareAtPrice > product.price && <span className="block text-xs text-ink/40 line-through">LE {product.compareAtPrice}</span>}</span>
                </div>
                <button onClick={() => addToCart(product.id)} className="mt-4 w-full rounded-full border border-ink/15 py-3 text-[10px] font-bold tracking-widest hover:border-cherry hover:bg-cherry hover:text-cream transition-colors">ADD BUNDLE TO CART</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-brand bg-banana p-10 text-center">
            <h2 className="font-display font-bold text-5xl">BUNDLES ARE COMING SOON.</h2>
            <p className="mt-3 text-sm text-ink/65">Curated glow routines are on the way.</p>
          </div>
        )}
      </section>
    </main>
  );
}
