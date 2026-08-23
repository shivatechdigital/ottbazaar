import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { WishlistItem } from '../types';
import ProductCard from '../components/ProductCard';
import { authHeaders } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Wishlist() {
  const { session } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', { headers: authHeaders(session.access_token) });
      if (!res.ok) throw new Error('Could not load wishlist');
      setItems(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [session]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl">Saved lanterns</h1>
      <p className="text-stone-400 mt-2">Listings you pinned to come back to.</p>
      {error && <p className="text-rose-300 mt-4">{error}</p>}
      {loading ? (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-white/8 p-12 text-center text-stone-400">
          Nothing saved yet. <Link to="/shop" className="text-amber-300">Wander the bazaar</Link>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.filter((i) => i.product).map((i) => (
            <ProductCard key={i.id} product={i.product!} wished onWishChange={load} />
          ))}
        </div>
      )}
    </div>
  );
}
