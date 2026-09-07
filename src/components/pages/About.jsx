const VALUES = [
  { number: '01', title: 'EASY, NOT EMPTY', text: 'We keep routines simple without cutting corners. Every step earns its place.' },
  { number: '02', title: 'MADE FOR HEAT', text: 'Our point of view starts with real weather, real movement, and skin that has places to go.' },
  { number: '03', title: 'GLOW WITH INTENT', text: 'Comfort first, confidence always. Good skin should feel like yours, not a performance.' },
];

export default function About() {
  return (
    <main>
      <section className="max-w-7xl mx-auto px-4 pt-5 md:pt-8">
        <div className="grid md:grid-cols-[.9fr_1.1fr] min-h-[600px] overflow-hidden rounded-brand">
          <div className="bg-cherry text-cream p-8 md:p-14 flex flex-col justify-between">
            <p className="text-[10px] font-bold tracking-[0.22em]">THE TROPITWIST STORY</p>
            <div>
              <h1 className="font-display font-bold text-7xl md:text-[9rem] leading-[0.78] tracking-tight">GLOW<br />IS A<br /><span className="text-banana">MOOD.</span></h1>
              <p className="mt-8 max-w-sm text-sm text-cream/80 leading-relaxed">Tropitwist is skincare for the bright side of real life: uncomplicated, expressive, and made to move with you.</p>
            </div>
            <span className="font-display text-3xl text-banana">GLOW, DON'T MELT.</span>
          </div>
          <div className="bg-banana stripe-yellow-tight min-h-[440px] relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 md:w-96 md:h-96 rounded-full border-[24px] border-cherry/90 flex items-center justify-center rotate-12">
                <div className="w-40 h-40 md:w-64 md:h-64 rounded-full bg-cream flex items-center justify-center -rotate-12">
                  <span className="font-display font-bold text-cherry text-6xl md:text-8xl leading-[.8] text-center">TT<br /><small className="text-2xl md:text-3xl">SKIN</small></span>
                </div>
              </div>
            </div>
            <span className="absolute top-8 right-8 rounded-full bg-ink text-cream px-4 py-2 text-[10px] font-bold tracking-widest">EST. 2026</span>
            <span className="absolute bottom-8 left-8 font-display text-4xl text-cherry -rotate-90 origin-left">SUN ON. GLOW ON.</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="grid md:grid-cols-[.7fr_1.3fr] gap-10 md:gap-20">
          <p className="text-[10px] font-bold tracking-[0.22em] text-cherry">OUR POINT OF VIEW</p>
          <div>
            <h2 className="font-display font-bold text-ink text-5xl md:text-8xl leading-[.84]">SKINCARE SHOULD<br /><span className="text-cherry">FEEL LIKE FREEDOM.</span></h2>
            <p className="mt-8 max-w-xl text-sm md:text-base text-ink/65 leading-relaxed">No twelve-step pressure. No impossible promises. Just good formulas, clear choices, and a little joy in the everyday ritual. Tropitwist was made for the mornings you are running late and the evenings you finally get to slow down.</p>
            <div className="flex flex-wrap gap-3 mt-8"><a href="/skincare" className="rounded-full bg-ink text-cream px-6 py-3 text-xs font-bold tracking-widest hover:bg-cherry transition-colors">SHOP SKINCARE</a><a href="/bundles" className="rounded-full border border-ink/20 px-6 py-3 text-xs font-bold tracking-widest hover:border-cherry hover:text-cherry transition-colors">EXPLORE BUNDLES</a></div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-cream">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div><p className="text-[10px] font-bold tracking-[0.22em] text-banana mb-3">THE TROPITWIST CODE</p><h2 className="font-display font-bold text-6xl md:text-8xl leading-[.8]">KEEP IT<br /><span className="text-cherry">REAL.</span></h2></div>
            <p className="max-w-xs text-sm text-cream/60 leading-relaxed">Three things we come back to in every formula, story, and sunny day.</p>
          </div>
          <div className="grid md:grid-cols-3 border-t border-cream/15">
            {VALUES.map((value) => <article key={value.number} className="pt-6 md:pr-10 md:border-r md:border-cream/15 md:mr-10 mt-8 last:border-0">
              <span className="text-banana font-display text-4xl">{value.number}</span>
              <h3 className="font-display font-bold text-3xl mt-8">{value.title}</h3>
              <p className="text-sm text-cream/60 leading-relaxed mt-4 max-w-xs">{value.text}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="bg-banana rounded-brand p-8 md:p-16 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div><p className="text-[10px] font-bold tracking-[0.22em] mb-3">READY WHEN YOU ARE</p><h2 className="font-display font-bold text-6xl md:text-8xl leading-[.8]">MEET YOUR<br /><span className="text-cherry">NEW ROUTINE.</span></h2></div>
          <a href="/skincare" className="rounded-full bg-cherry text-cream px-7 py-4 text-xs font-bold tracking-widest w-fit hover:bg-ink transition-colors">START GLOWING</a>
        </div>
      </section>
    </main>
  );
}
