import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();
  const shipping = subtotal >= 750 || subtotal === 0 ? 0 : 60;
  const total = subtotal + shipping;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      <div className="mb-10">
        <p className="text-[10px] font-bold tracking-[0.2em] text-cherry mb-3">YOUR TROPITWIST BAG</p>
        <h1 className="font-display font-bold text-ink text-6xl md:text-8xl leading-[0.82]">YOUR<br /><span className="text-cherry">CART.</span></h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-brand bg-banana p-10 md:p-16 text-center">
          <h2 className="font-display font-bold text-ink text-5xl">YOUR BAG IS GLOWINGLY EMPTY.</h2>
          <p className="mt-4 text-sm text-ink/65">Add something good to your daily routine.</p>
          <a href="/skincare" className="inline-block mt-7 rounded-full bg-ink text-cream px-7 py-4 text-xs font-bold tracking-widest hover:bg-cherry transition-colors">SHOP SKINCARE</a>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <section className="divide-y divide-ink/10 border-y border-ink/10">
            {items.map(({ product, quantity }) => (
              <article key={product.id} className="py-6 flex gap-4 md:gap-6">
                <a href={`/products/${product.id}`} className="w-28 h-32 md:w-36 md:h-40 shrink-0 rounded-brand bg-[#FFF1D8] overflow-hidden">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply" />
                </a>
                <div className="flex-1 flex flex-col justify-between gap-4">
                  <div className="flex justify-between gap-4">
                    <div><h2 className="font-body font-semibold text-sm md:text-base">{product.name}</h2><p className="mt-1 text-xs text-ink/50">{product.size || 'Daily essential'}</p></div>
                    <span className="font-bold text-sm whitespace-nowrap">LE {product.price * quantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-ink/15 rounded-full">
                      <button aria-label={`Decrease ${product.name}`} onClick={() => updateQuantity(product.id, quantity - 1)} className="px-3 py-1.5">−</button>
                      <span className="w-7 text-center text-xs">{quantity}</span>
                      <button aria-label={`Increase ${product.name}`} onClick={() => updateQuantity(product.id, quantity + 1)} className="px-3 py-1.5">+</button>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="text-[10px] font-bold tracking-widest text-ink/45 hover:text-cherry">REMOVE</button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-brand bg-[#FFF1D8] p-6 md:p-8 lg:sticky lg:top-28">
            <h2 className="font-display font-bold text-4xl">ORDER SUMMARY</h2>
            <div className="mt-6 space-y-3 border-b border-ink/10 pb-6 text-sm">
              <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>LE {subtotal}</span></div>
              <div className="flex justify-between"><span className="text-ink/60">Delivery</span><span>{shipping ? `LE ${shipping}` : 'FREE'}</span></div>
            </div>
            <div className="flex justify-between font-bold text-lg mt-5"><span>Total</span><span>LE {total}</span></div>
            <p className="text-xs text-ink/55 mt-4">{shipping ? 'Add LE 750 for free delivery.' : 'You unlocked free delivery.'}</p>
            <a href="/checkout" className="block text-center w-full mt-7 rounded-full bg-cherry text-cream py-4 text-xs font-bold tracking-widest hover:bg-ink transition-colors">PROCEED TO CHECKOUT</a>
            <a href="/skincare" className="block text-center mt-5 text-[10px] font-bold tracking-widest hover:text-cherry">CONTINUE SHOPPING</a>
          </aside>
        </div>
      )}
    </main>
  );
}
