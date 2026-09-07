import Logo from '../ui/Logo';
import { siteContent } from '../../data/siteContent';

export default function Footer() {
  return (
    <footer className="bg-cherry text-cream">
      <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo className="h-16 w-16 mb-4" />
          <p className="font-display font-black text-3xl md:text-4xl leading-none tracking-tight">{siteContent.footer.statement}</p>
        </div>
        {siteContent.footer.columns.map((col) => <div key={col.title} className="md:col-span-2">
          <h4 className="font-body font-bold text-xs tracking-widest mb-4 text-cream">{col.title}</h4>
          <ul className="space-y-2">{col.links.map((link) => <li key={link}><a href="#" className="text-sm text-cream/90 hover:text-banana transition-colors">{link}</a></li>)}</ul>
        </div>)}
        <div className="md:col-span-2">
          <h4 className="font-body font-bold text-xs tracking-widest mb-4 text-cream">SOCIAL</h4>
          <div className="flex gap-3"><a href="#" aria-label="Instagram" className="w-10 h-10 bg-cream/20 rounded-full flex items-center justify-center hover:bg-banana transition-colors">◎</a><a href="#" aria-label="TikTok" className="w-10 h-10 bg-cream/20 rounded-full flex items-center justify-center hover:bg-banana transition-colors">♪</a></div>
        </div>
      </div>
      <div className="border-t border-cream/20"><div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-cream/70"><p>© 2026 TROPITWIST. ALL RIGHTS RESERVED.</p><div className="flex gap-5"><a href="#" className="hover:text-cream">Privacy</a><a href="#" className="hover:text-cream">Terms</a><a href="#" className="hover:text-cream">Shipping</a></div></div></div>
    </footer>
  );
}