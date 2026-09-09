import { route } from '../../utils/routes';

export default function NotFound() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <section className="max-w-2xl">
        <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-cherry">PAGE NOT FOUND</p>
        <h1 className="font-display text-6xl font-bold leading-[0.85] text-ink md:text-8xl">
          NOTHING HERE<br /><span className="text-cherry">YET.</span>
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-ink/70">
          This page does not exist or the link has changed. Start with the product catalog or go back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={route('/search')} className="rounded-full bg-cherry px-6 py-3 text-xs font-bold tracking-widest text-cream hover:bg-ink">
            ALL PRODUCTS
          </a>
          <a href={route('/')} className="rounded-full border border-ink/20 px-6 py-3 text-xs font-bold tracking-widest text-ink hover:border-cherry hover:text-cherry">
            HOME
          </a>
        </div>
      </section>
    </main>
  );
}
