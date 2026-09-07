import { useState } from 'react';
import Logo from '../ui/Logo';
import { useCart } from '../../context/CartContext';
import { route } from '../../utils/routes';

const NAV = [
  { label: 'SHOP', href: route('/') },
  { label: 'SKINCARE', href: route('/skincare') },
  { label: 'BODY', href: route('/body-care') },
  { label: 'BUNDLES', href: route('/bundles') },
  { label: 'ABOUT', href: route('/about') },
];

function NavIcon({ name }) {
  const common = {
    width: 19,
    height: 19,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (name === 'Search') {
    return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>;
  }
  if (name === 'Account') {
    return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c.8-3.3 3.3-5 7.5-5s6.7 1.7 7.5 5" /></svg>;
  }
  if (name === 'Wishlist') {
    return <svg {...common}><path d="M20.8 8.8c0 5-8.8 10-8.8 10s-8.8-5-8.8-10A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" /></svg>;
  }
  return <svg {...common}><path d="M5 8h14l-1 11H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="md:hidden p-2 -ml-2 text-ink">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
        <a href={route('/')} aria-label="Tropitwist home" className="absolute left-1/2 -translate-x-1/2"><Logo className="h-10 w-10 md:h-12 md:w-12" /></a>
        <nav className="hidden md:flex items-center gap-7">
          {NAV.map((item) => <a key={item.label} href={item.href} className="font-body text-[11px] font-semibold text-ink tracking-[0.18em] hover:text-cherry transition-colors">{item.label}</a>)}
        </nav>
        <div className="flex items-center gap-1 md:gap-2">
          {['Search', 'Account', 'Wishlist'].map((label) => (
            <a key={label} href={label === 'Search' ? route('/search') : '#'} aria-label={label} className={`${label === 'Account' || label === 'Wishlist' ? 'hidden md:block ' : ''}p-2 text-ink hover:text-cherry`}>
              <NavIcon name={label} />
            </a>
          ))}
          <a href={route('/cart')} aria-label={`Cart, ${itemCount} items`} className="relative p-2 text-ink hover:text-cherry">
            <NavIcon name="Cart" />
            {itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cherry px-1 text-[9px] font-bold text-cream">{itemCount}</span>}
          </a>
        </div>
      </div>
      {open && <div className="fixed inset-0 z-50 md:hidden">
        <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
        <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85%] bg-cream p-6">
          <div className="flex items-center justify-between mb-8"><Logo className="h-10 w-10" /><button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 text-ink text-2xl">×</button></div>
          <nav className="flex flex-col gap-1">{NAV.map((item) => <a key={item.label} href={item.href} className="font-display font-black text-3xl text-ink py-3 border-b-2 border-cherry/20">{item.label}</a>)}</nav>
        </div>
      </div>}
    </header>
  );
}