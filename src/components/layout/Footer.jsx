import Logo from '../ui/Logo';
import { siteContent } from '../../data/siteContent';
import { route } from '../../utils/routes';

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-4 pt-12 md:pt-16">
        <div className="rounded-brand bg-cherry p-7 md:p-10 grid gap-8 md:grid-cols-[1fr_auto] items-end overflow-hidden relative">
          <div className="relative z-10 max-w-xl">
            <p className="text-[10px] font-bold tracking-[0.22em] text-cream/70 mb-3">THE TROPITWIST LETTER</p>
            <h2 className="font-display font-black text-5xl md:text-7xl leading-[0.85] tracking-tight">GOOD SKIN,<br /><span className="text-banana">GOOD ENERGY.</span></h2>
            <p className="mt-5 text-sm text-cream/80 max-w-md">Join for warm-weather rituals, new drops, and a little more glow in your inbox.</p>
          </div>
          <form className="relative z-10 w-full md:w-80" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <div className="flex items-center gap-2 border-b border-cream/60 pb-3">
              <input id="footer-email" type="email" required placeholder="YOUR EMAIL" className="min-w-0 flex-1 bg-transparent text-xs tracking-widest text-cream placeholder:text-cream/60 outline-none" />
              <button type="submit" className="text-[10px] font-bold tracking-widest text-banana hover:text-cream transition-colors">JOIN →</button>
            </div>
          </form>
          <div className="absolute -right-8 -top-14 h-40 w-40 rounded-full border-[18px] border-cream/10" />
        </div>
        <div className="py-12 md:py-16 grid gap-10 md:grid-cols-[1.2fr_2fr]">
          <div>
            <a href={route('/')} aria-label="Tropitwist home"><Logo className="h-14 w-14 mb-5" /></a>
            <p className="font-display font-black text-4xl leading-none tracking-tight">{siteContent.footer.statement}</p>
            <p className="mt-4 text-sm text-cream/55 max-w-xs">Simple, feel-good skincare for skin that keeps up.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {siteContent.footer.columns.map((col) => <div key={col.title}>
              <h4 className="font-body font-bold text-[10px] tracking-widest mb-4 text-banana">{col.title}</h4>
              <ul className="space-y-2">{col.links.map((link) => <li key={link}><a href={link === 'Skincare' ? route('/skincare') : link === 'Body Care' ? route('/body-care') : link === 'Bundles' ? route('/bundles') : '#'} className="text-sm text-cream/70 hover:text-cream transition-colors">{link}</a></li>)}</ul>
            </div>)}
            <div>
              <h4 className="font-body font-bold text-[10px] tracking-widest mb-4 text-banana">SAY HI</h4>
              <div className="flex gap-2"><a href="#" aria-label="Instagram" className="w-9 h-9 border border-cream/25 rounded-full flex items-center justify-center text-sm hover:bg-banana hover:text-ink hover:border-banana transition-colors">◎</a><a href="#" aria-label="TikTok" className="w-9 h-9 border border-cream/25 rounded-full flex items-center justify-center text-sm hover:bg-banana hover:text-ink hover:border-banana transition-colors">♪</a></div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10"><div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row gap-3 items-center justify-between text-[10px] tracking-widest text-cream/45"><p>© 2026 TROPITWIST</p><div className="flex gap-5"><a href="#" className="hover:text-cream">PRIVACY</a><a href="#" className="hover:text-cream">TERMS</a><a href="#" className="hover:text-cream">SHIPPING</a></div></div></div>
    </footer>
  );
}