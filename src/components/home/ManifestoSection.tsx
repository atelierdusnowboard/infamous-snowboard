export function ManifestoSection() {
  return (
    <section className="bg-black text-white py-24 md:py-32">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-8">
            — Manifesto
          </p>
          <blockquote className="text-3xl md:text-5xl font-black uppercase tracking-wider leading-tight mb-12">
            We Build Boards<br />
            For Riders Who<br />
            Don&apos;t Need<br />
            A Backstory.
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/20 pt-8">
            <p className="text-sm text-white/60 leading-relaxed uppercase tracking-widest">
              No celebrities. No marketing noise. Just shapes that work, built
              for the people who actually use them.
            </p>
            <p className="text-sm text-white/60 leading-relaxed uppercase tracking-widest">
              Every board starts from a problem on the mountain. The answer
              is in the shape, the flex, the construction. Nothing more.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
