import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';

export default function Bestsellers() {
  const { addToCart } = useCart();
  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="font-body text-[10px] font-bold tracking-[0.2em] text-cherry mb-2">SHOP THE ROUTINE</p>
            <h2 className="font-display font-bold text-ink text-5xl md:text-7xl tracking-tight">BESTSELLERS</h2>
          </div>
          <a href="#" className="hidden md:inline font-body font-semibold text-xs tracking-widest text-ink hover:text-cherry transition-colors">VIEW ALL PRODUCTS →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {products.filter((product) => product.featured !== false).map((product) => (
            <article key={product.id} className="group">
              <div className="bg-[#FFF1D8] rounded-brand aspect-[4/5] p-5 relative overflow-hidden mb-4 soft-shadow">
                {product.bestseller && (
                  <span className="absolute top-5 left-5 bg-cherry text-cream rounded-full px-3 py-1 text-[9px] font-bold tracking-widest">BESTSELLER</span>
                )}
                <div className="absolute inset-8 top-14 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain mix-blend-multiply drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h4 className="font-body font-semibold text-ink text-sm">{product.name}</h4>
                <span className="text-right">
                  <span className="block text-ink font-bold text-sm">LE {product.price}</span>
                  {product.compareAtPrice > product.price && (
                    <span className="block text-xs text-ink/40 line-through">LE {product.compareAtPrice}</span>
                  )}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink/50">Daily glow essential</p>
              <button onClick={() => addToCart(product.id)} className="mt-4 w-full border border-ink/20 text-ink font-body font-bold text-[10px] tracking-widest py-3 rounded-full hover:bg-cherry hover:border-cherry hover:text-cream transition-colors">ADD TO CART</button>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center md:hidden"><a href="#" className="inline-block font-body font-semibold text-xs tracking-widest text-ink hover:text-cherry transition-colors border-b border-cherry pb-1">VIEW ALL PRODUCTS</a></div>
      </div>
    </section>
  );
}
