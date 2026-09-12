import { useEffect, useState } from 'react';
import { route } from '../../utils/routes';
import { useCart } from '../../context/CartContext';
import { api, restoreSession } from '../../services/api';

export default function Wishlist() {
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  useEffect(() => { restoreSession().then((savedSession) => { if (!savedSession) { setStatus('signed-out'); return; } api('/wishlist').then((data) => { setItems(data); setStatus('ready'); }).catch(() => setStatus('error')); }); }, []);
  async function remove(id) { try { await api(`/wishlist/items/${id}`, { method: 'DELETE' }); setItems((current) => current.filter((item) => item.id !== id)); } catch { setStatus('error'); } }
  return (
    <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="page-spotlight -mx-4 border-b border-ink/10 px-4 pb-10 md:pb-14">
        <p className="motion-rise text-[10px] font-bold tracking-[0.22em] text-cherry mb-4">SAVED FOR LATER</p>
        <h1 className="motion-reveal font-display font-bold text-ink text-6xl md:text-8xl leading-[0.82]">YOUR<br /><span className="text-cherry">WISHLIST.</span></h1>
      </div>
      {status === 'signed-out' ? <div className="card-enter mt-12 rounded-brand bg-banana p-10 text-center"><h2 className="font-display font-bold text-5xl">SIGN IN TO SAVE.</h2><a href={route('/account')} className="inline-block mt-7 rounded-full bg-ink text-cream px-7 py-4 text-xs font-bold tracking-widest">SIGN IN</a></div> : status === 'loading' ? <p className="mt-12 text-center text-sm text-ink/60">Loading wishlist...</p> : !items.length ? (
        <div className="card-enter mt-12 rounded-brand bg-banana p-10 text-center">
          <h2 className="font-display font-bold text-5xl">NOTHING SAVED YET.</h2>
          <p className="mt-3 text-sm text-ink/65">Your favorite essentials will live here.</p>
          <a href={route('/search')} className="inline-block mt-7 rounded-full bg-ink text-cream px-7 py-4 text-xs font-bold tracking-widest">VIEW ALL PRODUCTS</a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {items.map((product, index) => (
            <article key={product.id} className="group card-enter" style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}>
              <a href={route(`/products/${product.id}`)} className="block aspect-[4/5] rounded-brand overflow-hidden bg-[#FFF1D8] hover-lift">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
              </a>
              <h2 className="mt-4 text-sm font-semibold">{product.name}</h2>
              <p className="mt-1 font-bold text-sm">LE {product.price}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => addToCart(product.id)} className="flex-1 rounded-full bg-cherry text-cream py-3 text-[10px] font-bold tracking-widest">ADD TO CART</button>
                <button onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`} className="px-4 rounded-full border border-ink/15 text-xs">×</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
