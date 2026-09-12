import { useState } from 'react';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { currentRoute, route } from '../../utils/routes';
import { api, getSession } from '../../services/api';

const CATEGORY_BACK_LINKS = {
  body: { href: '/body-care', label: 'BACK TO BODY CARE' },
  bundles: { href: '/bundles', label: 'BACK TO BUNDLES' },
  skincare: { href: '/skincare', label: 'BACK TO SKINCARE' },
};

export default function ProductDetail() {
  const productId = currentRoute(window.location.pathname).split('/').filter(Boolean).pop();
  const product = products.find((item) => item.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [savedStatus, setSavedStatus] = useState('');
  const { addToCart } = useCart();

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <section className="page-spotlight border-b border-ink/10 pb-12">
          <p className="motion-rise mb-4 text-[10px] font-bold tracking-[0.22em] text-cherry">PRODUCT NOT FOUND</p>
          <h1 className="motion-reveal font-display text-6xl font-bold leading-[0.82] text-ink md:text-8xl">
            THIS GLOW<br /><span className="text-cherry">MOVED.</span>
          </h1>
          <p className="motion-rise motion-delay-2 mt-6 max-w-md text-sm leading-relaxed text-ink/70">
            The product link is not available anymore. Browse the full catalog to find something close.
          </p>
          <a href={route('/search')} className="motion-rise motion-delay-3 mt-8 inline-block rounded-full bg-cherry px-7 py-4 text-xs font-bold tracking-widest text-cream hover:bg-ink">
            VIEW ALL PRODUCTS
          </a>
        </section>
      </main>
    );
  }

  const backLink = CATEGORY_BACK_LINKS[product.category] || CATEGORY_BACK_LINKS.skincare;

  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <a href={route(backLink.href)} className="text-[10px] font-bold tracking-widest text-ink/55 hover:text-cherry">
          ← {backLink.label}
        </a>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-14">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="card-enter bg-[#FFF1D8] rounded-brand p-8 md:p-14 soft-shadow hover-lift">
            <div className="aspect-square">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply rounded-brand" />
            </div>
          </div>

          <div className="lg:pt-8">
            <p className="motion-rise text-[10px] font-bold tracking-[0.2em] text-cherry mb-4">TROPITWIST DAILY ESSENTIAL</p>
            <h1 className="motion-reveal font-display font-bold text-ink text-6xl md:text-8xl leading-[0.82] tracking-tight">
              {product.name.split(' ').slice(0, -1).join(' ')}<br /><span className="text-cherry">{product.name.split(' ').slice(-1)}.</span>
            </h1>
            <div className="motion-rise motion-delay-1 flex items-center gap-3 mt-6">
              <span className="text-cherry tracking-widest">★★★★★</span>
              <span className="text-xs text-ink/55">4.9 · 28 reviews</span>
            </div>
            <p className="motion-rise motion-delay-2 font-body text-ink/65 text-sm md:text-base leading-relaxed max-w-lg mt-7">
              {product.description}
            </p>
            <div className="card-enter motion-delay-2 flex items-center justify-between border-y border-ink/10 py-5 mt-8 max-w-lg">
              <span>
                <span className="font-body font-bold text-xl">LE {product.price}</span>
                {product.compareAtPrice > product.price && (
                  <span className="ml-3 text-sm text-ink/40 line-through">LE {product.compareAtPrice}</span>
                )}
              </span>
              <span className="text-xs text-ink/50">{product.size || '50 ml'} · In stock</span>
            </div>
            <div className="card-enter motion-delay-3 flex flex-col gap-3 mt-6 max-w-lg sm:flex-row">
              <div className="flex items-center border border-ink/15 rounded-full">
                <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-lg">−</button>
                <span className="w-7 text-center text-sm">{quantity}</span>
                <button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-lg">+</button>
              </div>
              <button onClick={() => addToCart(product.id, quantity)} className="min-h-12 flex-1 rounded-full bg-cherry px-4 py-3 text-xs font-bold tracking-widest text-cream hover:bg-ink transition-colors">
                ADD TO CART · LE {product.price * quantity}
              </button>
              <button type="button" onClick={async () => { if (!getSession()) { setSavedStatus('Sign in to save products.'); return; } try { await api('/wishlist/items', { method: 'POST', body: JSON.stringify({ productId: product.id }) }); setSavedStatus('Saved to wishlist.'); } catch (error) { setSavedStatus(error.message); } }} className="min-h-12 rounded-full border border-ink/20 px-4 py-3 text-[10px] font-bold tracking-widest hover:border-cherry hover:text-cherry">SAVE</button>
            </div>
            {savedStatus && <p role="status" className="mt-3 text-sm text-ink/65">{savedStatus}</p>}
            <div className="grid grid-cols-3 gap-2 mt-8 max-w-lg">
              {['Soft finish', 'Daily use', 'Cruelty free'].map((item) => (
                <div key={item} className="card-enter bg-banana/50 rounded-brand p-3 text-center text-[10px] font-bold tracking-wide">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-cream">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-3 gap-10">
          <div><p className="text-[10px] tracking-[0.2em] text-banana font-bold mb-3">WHY YOU'LL LOVE IT</p><h2 className="font-display text-5xl leading-none">YOUR DAILY<br />GLOW STEP.</h2></div>
          <p className="text-sm text-cream/70 leading-relaxed">{product.detail}</p>
          <div className="text-sm text-cream/70 leading-relaxed"><p className="text-cream font-bold mb-2">HOW TO USE</p><p>Massage onto clean, dry skin. Use morning and night, and follow with SPF during the day.</p></div>
        </div>
      </section>
    </main>
  );
}
