import { siteContent } from '../../data/siteContent';
import { route } from '../../utils/routes';

export default function CampaignBanner() {
  const { campaign } = siteContent;
  return (
    <section className="max-w-7xl mx-auto px-4 pb-16 md:pb-24">
      <div className="grid md:grid-cols-2 overflow-hidden rounded-brand">
      <div className="stripe-yellow-tight p-8 md:p-16 flex flex-col justify-end min-h-[430px] relative overflow-hidden motion-drift">
        <div className="relative z-10 motion-rise">
          <p className="font-body text-[10px] font-bold tracking-[0.2em] text-ink/70 mb-4">{campaign.eyebrow}</p>
          <h2 className="font-display font-bold text-cherry text-6xl md:text-8xl leading-[0.82] tracking-tight">{campaign.title.map((line) => <span key={line} className="block">{line}</span>)}</h2>
        </div>
        <div className="absolute top-1/2 right-8 -translate-y-1/2 w-44 md:w-56 motion-float">
          <img
            src={campaign.image}
            alt="Tropitwist product"
            className="w-full aspect-square object-cover rounded-full mix-blend-multiply drop-shadow-2xl"
          />
        </div>
      </div>
      <div className="bg-banana p-8 md:p-16 flex flex-col justify-center motion-rise motion-delay-2">
        <p className="font-body text-[10px] font-bold tracking-[0.2em] text-ink/70 mb-4">{campaign.sideEyebrow}</p>
        <h3 className="font-display font-bold text-ink text-5xl md:text-7xl leading-[0.85] tracking-tight mb-6">{campaign.sideTitle.map((line, index) => <span key={line} className={`block ${index === campaign.sideTitle.length - 1 ? 'text-cherry' : ''}`}>{line}</span>)}</h3>
        <p className="font-body text-ink/75 text-sm md:text-base max-w-md mb-8 leading-relaxed">{campaign.description}</p>
        <a href={route(campaign.buttonHref)} className="inline-block bg-ink text-cream font-body font-bold text-xs tracking-widest px-7 py-4 rounded-full hover:bg-cherry hover:-translate-y-1 transition-all duration-300 w-fit">{campaign.buttonLabel}</a>
      </div>
      </div>
    </section>
  );
}