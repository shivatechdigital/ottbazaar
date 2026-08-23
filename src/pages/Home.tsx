import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Shield, Sparkles, Users } from 'lucide-react';
import type { Platform, Product, Testimonial } from '../types';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { authHeaders } from '../lib/api';

export default function Home() {
  const { session } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [stories, setStories] = useState<Testimonial[]>([]);
  const [wishIds, setWishIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWish = async () => {
    if (!session) {
      setWishIds(new Set());
      return;
    }
    const res = await fetch('/api/wishlist', { headers: authHeaders(session.access_token) });
    if (res.ok) {
      const data = await res.json();
      setWishIds(new Set((data || []).map((w: { product_id: number }) => w.product_id)));
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        const [pRes, dRes, tRes] = await Promise.all([
          fetch('/api/platforms'),
          fetch('/api/products'),
          fetch('/api/testimonials'),
        ]);
        if (!pRes.ok || !dRes.ok || !tRes.ok) throw new Error('Failed to load marketplace');
        setPlatforms(await pRes.json());
        const products: Product[] = await dRes.json();
        setDeals(
          [...products].sort((a, b) => Number(b.original_price) - Number(b.price) - (Number(a.original_price) - Number(a.price))).slice(0, 8),
        );
        setStories(await tRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    loadWish();
  }, [session]);

  return (
    <div>
      <section className="relative min-h-[80vh] sm:min-h-[88vh] flex items-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/hero-cinema.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07040d] via-[#07040d]/85 to-[#07040d]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07040d] via-transparent to-[#07040d]/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs tracking-[0.25em] sm:tracking-[0.4em] uppercase text-amber-300/90 mb-5"
          >
            India&apos;s OTT bazaar
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[0.96] sm:leading-[0.92] max-w-3xl"
          >
            Share seats.
            <br />
            <span className="text-amber-300">Stream richer.</span>
          </motion.h1>
          <p className="mt-6 max-w-xl text-stone-300 text-base sm:text-lg leading-relaxed">
            Unused Netflix, Hotstar, Prime and Spotify slots find new homes here. Honest prices, verified sellers, instant checkout.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 text-[#1a1208] font-semibold hover:bg-amber-300"
            >
              Browse the bazaar <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:border-amber-300/50"
            >
              Sell a leftover seat
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: 'Escrow-style checkout', copy: 'Slots reserved only after payment is confirmed.' },
            { icon: Users, title: 'Neighbourhood sellers', copy: 'Real people listing leftover family-plan seats.' },
            { icon: Sparkles, title: 'Cinematic savings', copy: 'Typical 30–60% off retail monthly prices.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/8 bg-[#14101c]/90 backdrop-blur p-5">
              <item.icon className="h-5 w-5 text-amber-300 mb-3" />
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm text-stone-400 mt-1">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-rose-300/80">Aisles</p>
            <h2 className="font-display text-3xl sm:text-4xl mt-2">Featured platforms</h2>
          </div>
          <Link to="/shop" className="text-sm text-amber-300 hover:text-amber-200">View all</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-rose-300">{error}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((p) => (
              <Link
                key={p.id}
                to={`/shop?platform=${encodeURIComponent(p.name)}`}
                className="rounded-2xl p-5 border border-white/8 bg-[#14101c] hover:-translate-y-1 transition"
                style={{ boxShadow: `inset 0 0 0 1px ${p.color}22` }}
              >
                <div className="h-2 w-10 rounded-full mb-4" style={{ background: p.color }} />
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-xs text-stone-500 mt-1">{p.tagline}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-rose-300/80">Tonight&apos;s stalls</p>
            <h2 className="font-display text-3xl sm:text-4xl mt-2">Trending deals</h2>
          </div>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} wished={wishIds.has(p.id)} onWishChange={loadWish} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-24 relative overflow-hidden">
        <img src="/images/hero-bazaar.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-[#07040d]/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <p className="text-xs tracking-[0.3em] uppercase text-amber-300/80">How the bazaar works</p>
          <h2 className="font-display text-3xl sm:text-4xl mt-2 mb-10 sm:mb-12">Three lanterns, then you stream</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', t: 'Pick a stall', d: 'Filter by platform, months and budget. Every listing shows remaining seats.' },
              { n: '02', t: 'Pay at the kiosk', d: 'UPI, card or netbanking. We lock the seat the moment checkout succeeds.' },
              { n: '03', t: 'Join the plan', d: 'Seller shares invite details from your order page. Rate them when you are in.' },
            ].map((s) => (
              <div key={s.n} className="rounded-3xl border border-white/10 bg-black/30 p-7">
                <div className="font-display text-4xl text-amber-300/70">{s.n}</div>
                <h3 className="text-xl mt-3">{s.t}</h3>
                <p className="text-stone-400 mt-2 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
        <h2 className="font-display text-3xl sm:text-4xl mb-8">Voices from the lane</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {stories.map((s) => (
            <blockquote key={s.id} className="rounded-3xl border border-white/8 bg-[#14101c] p-6">
              <div className="text-amber-300 text-sm mb-3">{'★'.repeat(s.rating)}</div>
              <p className="text-stone-200 leading-relaxed">“{s.quote}”</p>
              <footer className="mt-5 text-sm text-stone-500">
                {s.name} · {s.city}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 grid lg:grid-cols-2 gap-8 items-center">
        <img src="/images/popcorn.jpg" alt="Movie night" className="rounded-[2rem] h-64 sm:h-[380px] w-full object-cover" />
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-rose-300/80">For hosts</p>
          <h2 className="font-display text-3xl sm:text-4xl mt-2">Turn empty family seats into chai money</h2>
          <p className="text-stone-400 mt-4 leading-relaxed">
            If your Premium plan has two idle profiles, list them in under a minute. Set your price, pick duration, and we handle checkout.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-stone-300">
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-amber-300" /> Keep control of your master account</li>
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-amber-300" /> Pause or close a listing anytime</li>
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-amber-300" /> Track sales from Seller Desk</li>
          </ul>
          <Link to="/sell" className="inline-flex mt-7 px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-400 font-medium">
            Open a stall
          </Link>
        </div>
      </section>
    </div>
  );
}
