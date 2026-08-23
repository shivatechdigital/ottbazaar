import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { authHeaders, durationLabel, formatINR } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Dashboard() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/products?mine=1', { headers: authHeaders(session.access_token) });
      if (!res.ok) throw new Error('Could not load your stall');
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

  const toggle = async (p: Product) => {
    if (!session) return;
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
    });
    if (res.ok) {
      toast(p.is_active ? 'Listing paused' : 'Listing live');
      load();
    }
  };

  const remove = async (id: number) => {
    if (!session) return;
    if (!confirm('Take this listing down?')) return;
    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast('Listing removed');
      load();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-rose-300/80">Seller desk</p>
          <h1 className="font-display text-4xl mt-2">Your stall</h1>
        </div>
        <Link to="/sell" className="px-5 py-2.5 rounded-full bg-amber-400 text-[#1a1208] font-medium">New listing</Link>
      </div>
      {error && <p className="text-rose-300 mt-4">{error}</p>}
      {loading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-white/8 p-12 text-center text-stone-400">
          No listings yet. <Link to="/sell" className="text-amber-300">Open your first stall</Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-stone-500">
              <tr>
                <th className="pb-3">Listing</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Seats</th>
                <th className="pb-3">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-white/8">
                  <td className="py-4">
                    <Link to={`/shop/${p.id}`} className="hover:text-amber-200">{p.title}</Link>
                    <p className="text-xs text-stone-500">{p.platform_name} · {durationLabel(p.duration_months)}</p>
                  </td>
                  <td>{formatINR(p.price)}</td>
                  <td>{p.slots_available}/{p.slots_total}</td>
                  <td>{p.is_active ? <span className="text-emerald-300">Live</span> : <span className="text-stone-500">Paused</span>}</td>
                  <td className="text-right space-x-3">
                    <button onClick={() => toggle(p)} className="text-amber-300">{p.is_active ? 'Pause' : 'Unpause'}</button>
                    <button onClick={() => remove(p.id)} className="text-rose-300">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
