import { route } from '../../utils/routes';

export default function ProductCard({ product, onAdd, badge, description = 'For your daily glow', actionLabel = 'ADD TO CART', className = '', style }) {
  return (
    <article className={`group flex h-full flex-col ${className}`} style={style}>
      <a href={route(`/products/${product.id}`)} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-brand bg-[#FFF1D8] soft-shadow hover-lift">
          {(badge || product.bestseller) && (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-cherry px-3 py-1.5 text-[10px] font-bold tracking-widest text-cream">
              {badge || 'BESTSELLER'}
            </span>
          )}
          {product.compareAtPrice > product.price && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-banana px-3 py-1.5 text-[10px] font-bold tracking-widest">
              SALE
            </span>
          )}
          <img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
        </div>
      </a>
      <div className="flex flex-1 items-start justify-between gap-4 pt-4">
        <div>
          <h2 className="text-base font-semibold">{product.name}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-ink/65">{description}</p>
        </div>
        <span className="whitespace-nowrap text-right">
          <span className="block text-base font-bold">LE {product.price}</span>
          {product.compareAtPrice > product.price && <span className="block text-sm text-ink/50 line-through">LE {product.compareAtPrice}</span>}
        </span>
      </div>
      <button type="button" onClick={() => onAdd(product.id)} className="mt-4 w-full rounded-full border border-ink/15 py-3 text-xs font-bold tracking-widest transition-colors hover:border-cherry hover:bg-cherry hover:text-cream">
        {actionLabel}
      </button>
    </article>
  );
}
