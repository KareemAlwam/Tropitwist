import { useState } from 'react';
import Logo from '../ui/Logo';
import { siteContent } from '../../data/siteContent';
import { route } from '../../utils/routes';

export default function Footer() {
  const [newsletterState, setNewsletterState] = useState('idle');

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    setNewsletterState('success');
  };

  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-6 py-12 md:px-10 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_.8fr_.9fr_.9fr_1.35fr]">
          <div>
            <a href={route('/')} aria-label="Tropitwist home" className="inline-flex items-center gap-3 mb-6"><Logo className="h-14 w-14" /><span className="font-display font-black text-xl">TROPITWIST</span></a>
            <ul className="space-y-4 text-sm text-cream/75">
              <li>Based in Cairo, Egypt</li>
              <li><a href="mailto:hello@tropitwist.com" className="hover:text-banana transition-colors">hello@tropitwist.com</a></li>
              <li><a href="tel:+201000000000" className="hover:text-banana transition-colors">+20 100 000 0000</a></li>
            </ul>
            <div className="flex gap-3 mt-6">
              <span aria-label="Instagram coming soon" title="Instagram coming soon" className="text-lg text-cream/35">◎</span>
              <span aria-label="TikTok coming soon" title="TikTok coming soon" className="text-lg text-cream/35">♪</span>
            </div>
          </div>
          <div>
            <h4 className="font-body font-bold text-sm mb-5">CATEGORIES</h4>
            <ul className="space-y-3 text-sm text-cream/75">
              <li><a href={route('/skincare')} className="hover:text-banana transition-colors">Skincare</a></li>
              <li><a href={route('/body-care')} className="hover:text-banana transition-colors">Body care</a></li>
              <li><a href={route('/bundles')} className="hover:text-banana transition-colors">Bundles</a></li>
              <li><a href={route('/search')} className="hover:text-banana transition-colors">All products</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-body font-bold text-sm mb-5">INFORMATION</h4>
            <ul className="space-y-3 text-sm text-cream/75">
              <li><a href={route('/about')} className="hover:text-banana transition-colors">About us</a></li>
              <li><span className="text-cream/40">Shipping policy soon</span></li>
              <li><span className="text-cream/40">Returns policy soon</span></li>
              <li><span className="text-cream/40">Privacy policy soon</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-body font-bold text-sm mb-5">USEFUL LINKS</h4>
            <ul className="space-y-3 text-sm text-cream/75">
              <li><a href={route('/account')} className="hover:text-banana transition-colors">My account</a></li>
              <li><a href={route('/wishlist')} className="hover:text-banana transition-colors">Wishlist</a></li>
              <li><a href={route('/cart')} className="hover:text-banana transition-colors">Shopping bag</a></li>
              <li><span className="text-cream/40">FAQ soon</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-body font-bold text-sm mb-5">NEWSLETTER SIGNUP</h4>
            <p className="text-sm text-cream/75 leading-relaxed max-w-xs">Get first access to new products and offers.</p>
            <form className="mt-6 flex h-11 overflow-hidden rounded-full border border-cream/35" onSubmit={handleNewsletterSubmit}>
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input id="footer-email" type="email" required placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-4 text-xs text-cream outline-none placeholder:text-cream/45" />
              <button type="submit" className="bg-banana px-5 text-xs font-bold text-ink hover:bg-cherry hover:text-cream transition-colors">JOIN</button>
            </form>
            {newsletterState === 'success' && <p className="mt-3 text-xs text-banana">Thanks. Newsletter signup is ready for backend connection.</p>}
          </div>
        </div>
      </div>
      <div className="border-t border-cream/15"><div className="max-w-7xl mx-auto px-6 py-5 text-center text-xs text-cream/65 md:px-10">© 2026 Tropitwist. All rights reserved.</div></div>
    </footer>
  );
}
