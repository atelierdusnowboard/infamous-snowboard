export function ManifestoSection() {
  const principles = [
    {
      title: "Timeless Value",
      text: "Products are not reset every season to chase attention. A board, a binding, or a garment should hold its meaning and value over time.",
    },
    {
      title: "Intentional Shapes",
      text: "Every shape starts with a specific riding need, then gets tested and dialed until it feels right. No pointless changes, no cosmetic noise.",
    },
    {
      title: "Built On Trust",
      text: "Infamous produces only what is needed, avoids waste, and treats every purchase as a shared act of trust with the people who ride it.",
    },
  ];

  return (
    <section id="manifesto" className="scroll-mt-16 bg-black text-white py-20 md:py-28">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-8">
            — Manifesto
          </p>
          <blockquote className="text-3xl md:text-5xl font-black uppercase tracking-wider leading-tight mb-10">
            Forget The Fame,<br />
            Stay The Same.
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 border-t border-white/20 pt-8">
            <div className="space-y-5">
              <p className="text-sm md:text-base text-white/70 leading-relaxed uppercase tracking-widest">
                Infamous Snowboard was born out of an inner necessity, not a strategy.
                It stands for a timeless and honest way to build: no artificial
                devaluation, no easy celebrity, no fleeting trends.
              </p>
              <p className="text-sm md:text-base text-white/70 leading-relaxed uppercase tracking-widest">
                The work stays focused on the mountain, the ride, and a sincere
                desire to create products that perform for the people who use them.
                Less talk, more ride.
              </p>
            </div>
            <div className="border border-white/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40 mb-4">
                Mindset
              </p>
              <p className="text-xl md:text-2xl font-black uppercase tracking-wider leading-snug">
                One trick a day keeps the evil away.
              </p>
              <p className="text-sm text-white/60 leading-relaxed uppercase tracking-widest mt-5">
                Progress every day, find meaning in every run, and treat riding
                as more than a sport: a way of existing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/20 mt-10">
            {principles.map((principle) => (
              <div key={principle.title} className="bg-black p-5 md:p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.25em] mb-4">
                  {principle.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed uppercase tracking-widest">
                  {principle.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-white/20 pt-6">
            <p className="text-sm md:text-base font-black uppercase tracking-[0.25em] leading-relaxed">
              Less noise, more shapes. Less talk, more ride.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
