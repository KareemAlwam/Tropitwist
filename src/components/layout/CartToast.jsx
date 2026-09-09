import { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { route } from '../../utils/routes';

export default function CartToast() {
  const { lastAddedItem, clearLastAddedItem, subtotal, itemCount } = useCart();

  useEffect(() => {
    if (!lastAddedItem) return undefined;
    const timeout = window.setTimeout(clearLastAddedItem, 4500);
    return () => window.clearTimeout(timeout);
  }, [clearLastAddedItem, lastAddedItem]);

  if (!lastAddedItem) return null;

  const { product, quantity } = lastAddedItem;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm" role="status" aria-live="polite">
      <div className="rounded-brand border border-ink/10 bg-cream p-4 shadow-2xl">
        <div className="flex gap-3">
          <div className="h-16 w-14 shrink-0 overflow-hidden rounded-brand bg-[#FFF1D8]">
            <img src={product.image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-[0.18em] text-cherry">ADDED TO BAG</p>
            <p className="mt-1 truncate text-sm font-bold">{product.name}</p>
            <p className="mt-1 text-xs text-ink/65">
              Qty {quantity} · {itemCount} item{itemCount === 1 ? '' : 's'} · LE {subtotal}
            </p>
          </div>
          <button type="button" onClick={clearLastAddedItem} aria-label="Close cart confirmation" className="h-9 w-9 shrink-0 rounded-full text-xl leading-none text-ink/65 hover:bg-ink/5 hover:text-ink">
            ×
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={route('/cart')} className="rounded-full border border-ink/20 px-4 py-3 text-center text-[10px] font-bold tracking-widest hover:border-ink">
            VIEW BAG
          </a>
          <a href={route('/checkout')} className="rounded-full bg-cherry px-4 py-3 text-center text-[10px] font-bold tracking-widest text-cream hover:bg-ink">
            CHECKOUT
          </a>
        </div>
      </div>
    </div>
  );
}
