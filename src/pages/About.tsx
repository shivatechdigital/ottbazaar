export default function About() {
  return (
    <div>
      <section className="relative h-[52vh] min-h-[360px] overflow-hidden">
        <img src="/images/about-team.jpg" alt="People streaming together" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07040d] via-[#07040d]/50 to-black/20" />
        <div className="absolute inset-0 max-w-5xl mx-auto px-4 flex flex-col justify-end pb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-amber-300/90">Our story</p>
          <h1 className="font-display text-5xl mt-2">A lane for leftover seats</h1>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-6 text-stone-300 leading-relaxed">
        <p>
          OttBazaar started on a Mumbai terrace when four friends realised they were paying for four Netflix houses and using one.
          The unused seats felt like unsold lanterns after a festival — still warm, still useful, just sitting in a box.
        </p>
        <p>
          We built a marketplace where those seats can change hands without shady WhatsApp forwards. Sellers keep the master account.
          Buyers get a clear duration, a locked price, and a review trail. Payments stay on the kiosk until the invite is sent.
        </p>
        <p>
          Today the bazaar hosts Netflix, Prime Video, JioHotstar, SonyLIV, Zee5, Spotify, YouTube Premium, Crunchyroll and more.
          Every listing is a real leftover month, not a grey-market code farm.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-5 pb-16">
        {[
          { n: '48k+', l: 'Seats rehomed' },
          { n: '120+', l: 'Indian cities' },
          { n: '4.8', l: 'Average stall rating' },
        ].map((s) => (
          <div key={s.l} className="rounded-3xl border border-white/8 bg-[#14101c] p-8 text-center">
            <div className="font-display text-4xl text-amber-300">{s.n}</div>
            <p className="text-sm text-stone-400 mt-2">{s.l}</p>
          </div>
        ))}
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-6 pb-20">
        <img src="/images/watch-night.jpg" alt="" className="rounded-[2rem] h-72 w-full object-cover" />
        <img src="/images/music-stream.jpg" alt="" className="rounded-[2rem] h-72 w-full object-cover" />
      </section>
    </div>
  );
}
