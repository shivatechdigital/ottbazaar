import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Platform, Product } from '../types';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { authHeaders } from '../lib/api';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { session } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [wishIds, setWishIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = params.get('search') || '';
  const platform = params.get('platform') || '';
  const duration = params.get('duration') || '';
  const sort = params.get('sort') || 'featured';
  const max = params.get('max') || '';

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
    fetch('/api/platforms').then((r) => r.json()).then(setPlatforms).catch(() => {});
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const q = new URLSearchParams();
        if (search) q.set('search', search);
        if (platform) q.set('platform', platform);
        if (duration) q.set('duration', duration);
        if (max) q.set('maxPrice', max);
        const res = await fetch(`/api/products?${q.toString()}`);
        if (!res.ok) throw new Error('Could not load listings');
        setProducts(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [search, platform, duration, max]);

  useEffect(() => {
    loadWish();
  }, [session]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'duration') list.sort((a, b) => a.duration_months - b.duration_months);
    return list;
  }, [products, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-xs tracking-[0.3em] uppercase text-rose-300/80">The bazaar</p>
      <h1 className="font-display text-3xl sm:text-5xl mt-2">Every stall, open tonight</h1>
      <p className="text-stone-400 mt-3 max-w-2xl">Filter by house, months or budget. Prices are per remaining seat, not per whole family plan.</p>

      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 space-y-6">
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-amber-200/80 mb-3">Platform</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('platform', '')}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  !platform ? 'bg-amber-400 text-[#1a1208] border-amber-400' : 'border-white/10 text-stone-300'
                }`}
              >
                All
              </button>
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilter('platform', p.name)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    platform === p.name ? 'bg-amber-400 text-[#1a1208] border-amber-400' : 'border-white/10 text-stone-300'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-amber-200/80 mb-3">Duration</h3>
            <div className="flex flex-wrap gap-2">
              {['', '1', '3', '6', '12'].map((d) => (
                <button
                  key={d || 'any'}
                  onClick={() => setFilter('duration', d)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    duration === d ? 'bg-amber-400 text-[#1a1208] border-amber-400' : 'border-white/10 text-stone-300'
                  }`}
                >
                  {d === '' ? 'Any' : d === '1' ? '1 mo' : d === '12' ? '1 yr' : `${d} mo`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-amber-200/80 mb-3">Max price</h3>
            <input
              type="range"
              min={99}
              max={2000}
              step={50}
              value={max || 2000}
              onChange={(e) => setFilter('max', e.target.value === '2000' ? '' : e.target.value)}
              className="w-full accent-amber-400"
            />
            <p className="text-xs text-stone-500 mt-1">Up to ₹{max || 2000}</p>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <p className="text-sm text-stone-400">{loading ? 'Loading…' : `${sorted.length} listings`}</p>
            <select
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value === 'featured' ? '' : e.target.value)}
              className="bg-[#14101c] border border-white/10 rounded-full px-4 py-2 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="duration">Shortest duration</option>
            </select>
          </div>

          {error && <p className="text-rose-300 mb-4">{error}</p>}
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-3xl border border-white/8 p-12 text-center text-stone-400">
              No stalls match those filters. Try widening the search.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sorted.map((p) => (
                <ProductCard key={p.id} product={p} wished={wishIds.has(p.id)} onWishChange={loadWish} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
