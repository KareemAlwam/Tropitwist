import { siteContent } from '../../data/siteContent';
import { route } from '../../utils/routes';

export default function Hero() {
  const { hero } = siteContent;
  return (
    <section className="max-w-7xl mx-auto px-4 pt-5 pb-12 md:pt-8 md:pb-20">
      <div className="grid md:grid-cols-[1.05fr_.95fr] min-h-[560px] overflow-hidden rounded-brand">
      <div className="bg-banana p-8 md:p-16 flex flex-col justify-center relative">
        <p className="font-body text-[11px] font-bold tracking-[0.2em] text-ink/65 mb-5">{hero.eyebrow}</p>
        <h1 className="font-display font-bold text-cherry text-7xl md:text-[9rem] leading-[0.82] tracking-tight">{hero.title.map((line) => <span key={line} className="block">{line}</span>)}</h1>
        <p className="mt-7 font-body text-ink/80 text-sm md:text-base max-w-sm leading-relaxed">{hero.description}</p>
        <a href={route(hero.buttonHref)} className="inline-flex mt-8 bg-cherry text-cream font-body font-bold text-xs tracking-widest px-7 py-4 rounded-full hover:bg-ink transition-colors w-fit">{hero.buttonLabel}</a>
      </div>
      <div className="bg-cream stripe-yellow-tight p-8 md:p-14 flex flex-col justify-end relative overflow-hidden min-h-[420px]">
        <div className="relative z-10 max-w-xs">
          <span className="inline-block bg-cream px-3 py-2 text-[10px] font-bold tracking-widest mb-4">{hero.motif}</span>
          <h2 className="font-display font-bold text-cherry text-5xl md:text-7xl leading-[0.85] tracking-tight">{hero.panelTitle.map((line) => <span key={line} className="block">{line}</span>)}</h2>
        </div>
        <div className="absolute top-1/2 right-8 -translate-y-1/2 w-56 md:w-72">
          <img
            src={hero.image}
            alt="Tropitwist product"
            className="w-full aspect-square object-cover rounded-full mix-blend-multiply drop-shadow-2xl"
          />
        </div>
      </div>
      </div>
    </section>
  );
}