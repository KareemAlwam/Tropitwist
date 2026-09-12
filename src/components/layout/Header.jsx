import { useEffect, useRef, useState } from 'react';
import Logo from '../ui/Logo';
import { useCart } from '../../context/CartContext';
import { currentRoute, route } from '../../utils/routes';

const NAV = [
  { label: 'ALL PRODUCTS', href: route('/search'), match: '/search' },
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
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const { itemCount } = useCart();
  const pathname = currentRoute(window.location.pathname);
  const utilityLinks = [
    { label: 'Search', href: route('/search') },
    { label: 'Account', href: route('/account') },
    { label: 'Wishlist', href: route('/wishlist') },
  ];

  const isActive = (item) => pathname === (item.match || currentRoute(new URL(item.href, window.location.origin).pathname));

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;

      const focusable = drawerRef.current?.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <button ref={menuButtonRef} type="button" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)} className="md:hidden p-2 -ml-2 text-ink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <a href={route('/')} aria-label="Tropitwist home" className="absolute left-1/2 -translate-x-1/2"><Logo className="h-10 w-10 md:h-12 md:w-12" /></a>
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-current={isActive(item) ? 'page' : undefined}
                className={`font-body text-[11px] font-semibold tracking-[0.18em] transition-colors hover:text-cherry ${isActive(item) ? 'text-cherry' : 'text-ink'}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 md:gap-2">
            {utilityLinks.map((item) => (
              <a key={item.label} href={item.href} aria-label={item.label} className={`${item.label === 'Account' || item.label === 'Wishlist' ? 'hidden md:block ' : ''}p-2 text-ink hover:text-cherry`}>
                <NavIcon name={item.label} />
              </a>
            ))}
            <a href={route('/cart')} aria-label={`Cart, ${itemCount} items`} className="relative p-2 text-ink hover:text-cherry">
              <NavIcon name="Cart" />
              {itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cherry px-1 text-[9px] font-bold text-cream">{itemCount}</span>}
            </a>
          </div>
        </div>
      </header>
      {open && <div className="fixed inset-0 z-50 h-dvh md:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <button type="button" aria-label="Close menu" className="mobile-menu-backdrop absolute inset-0 h-full w-full cursor-default bg-ink/45" onClick={() => setOpen(false)} />
        <aside ref={drawerRef} id="mobile-navigation" className="mobile-menu-panel absolute inset-y-0 left-0 flex w-[22rem] max-w-[88vw] flex-col overflow-y-auto overscroll-contain bg-cream shadow-2xl">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <a href={route('/')} aria-label="Tropitwist home" className="flex items-center gap-3">
              <Logo className="h-11 w-11" />
              <span className="font-display text-xl font-black tracking-[0.08em] text-ink">TROPITWIST</span>
            </a>
            <button ref={closeButtonRef} type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-cherry hover:bg-cherry hover:text-cream">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col px-5 pb-5 pt-6">
            <p className="mb-3 text-[10px] font-bold tracking-[0.24em] text-cherry">EXPLORE</p>
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation links">
              {NAV.map((item, index) => (
                <a key={item.label} href={item.href} aria-current={isActive(item) ? 'page' : undefined} className={`group flex min-h-14 items-center gap-3 rounded-xl px-3 py-3 transition-colors ${isActive(item) ? 'bg-banana/30 text-ink' : 'text-ink hover:bg-ink/5 hover:text-cherry'}`}>
                  <span className={`text-[9px] font-bold tracking-widest ${isActive(item) ? 'text-cherry' : 'text-ink/40'}`}>0{index + 1}</span>
                  <span className="flex-1 font-display text-[1.7rem] font-black leading-none tracking-tight">{item.label}</span>
                  <span className={`text-lg transition-transform group-hover:translate-x-1 ${isActive(item) ? 'text-cherry' : 'text-ink/30'}`} aria-hidden="true">→</span>
                </a>
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <p className="mb-3 text-[10px] font-bold tracking-[0.24em] text-ink/50">QUICK LINKS</p>
              <div className="grid grid-cols-3 gap-2">
                {utilityLinks.map((item) => (
                  <a key={item.label} href={item.href} className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-banana/10 px-2 py-3 text-[9px] font-bold tracking-wider text-ink transition-colors hover:border-cherry hover:text-cherry">
                    <NavIcon name={item.label} />
                    {item.label.toUpperCase()}
                  </a>
                ))}
              </div>
              <a href={route('/cart')} className="mt-3 flex min-h-14 items-center justify-between rounded-full bg-cherry px-5 py-3 text-xs font-bold tracking-[0.16em] text-cream transition-colors hover:bg-ink">
                <span>VIEW BAG</span>
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-cream px-2 text-[10px] text-cherry">{itemCount}</span>
              </a>
            </div>
          </div>
        </aside>
      </div>}
    </>
  );
}
