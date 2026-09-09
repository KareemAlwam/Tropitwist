import { useCart } from '../../context/CartContext';
import { useProductCollection } from '../../hooks/useProductCollection';
import CollectionControls from './CollectionControls';
import ProductCard from './ProductCard';

export default function CollectionPage({ config }) {
  const { addToCart } = useCart();
  const state = useProductCollection({ category: config.category, allFilter: config.filters[0] });
  return (
    <main>
      <section className={`${config.headerClassName || 'page-spotlight'} border-b border-ink/10`}>
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
          <p className="motion-rise mb-4 text-[10px] font-bold tracking-[0.22em] text-cherry">{config.eyebrow}</p>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="motion-reveal font-display text-6xl font-bold leading-[0.82] tracking-tight md:text-[8rem]">
                {config.title}<br /><span className="text-cherry">{config.accent}</span>
              </h1>
              <p className="motion-rise motion-delay-2 mt-7 max-w-md text-sm leading-relaxed text-ink/65 md:text-base">{config.description}</p>
            </div>
            <p className="motion-rise motion-delay-3 text-xs leading-relaxed text-ink/55 md:max-w-xs md:text-right">{config.aside}</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <CollectionControls filters={config.filters} state={state} placeholder={config.searchPlaceholder} />
        {state.items.length ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {state.items.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
                badge={config.badge}
                description={config.cardDescription(product)}
                actionLabel={config.actionLabel}
                className="card-enter"
                style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="card-enter rounded-brand bg-banana p-10 text-center">
            <h2 className="font-display text-5xl font-bold">{config.emptyTitle}</h2>
            <p className="mt-3 text-sm text-ink/65">{config.emptyText}</p>
          </div>
        )}
      </section>
    </main>
  );
}
