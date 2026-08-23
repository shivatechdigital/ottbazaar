import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Order } from '../types';
import { authHeaders, durationLabel, formatINR } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Orders() {
  const { session } = useAuth();
  const location = useLocation();
  const justOrdered = (location.state as { justOrdered?: number } | null)?.justOrdered;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!session) return;
      try {
        const res = await fetch('/api/orders', { headers: authHeaders(session.access_token) });
        if (!res.ok) throw new Error('Could not load orders');
        setOrders(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [session]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl">Your passes</h1>
      {justOrdered && (
        <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100">
          Order #{justOrdered} is confirmed. The seller will share invite details shortly.
        </div>
      )}
      {error && <p className="text-rose-300 mt-4">{error}</p>}
      {loading ? (
        <div className="mt-10 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-white/8 p-12 text-center text-stone-400">
          No orders yet. <Link to="/shop" className="text-amber-300">Find a seat</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((o) => (
            <article key={o.id} className="rounded-3xl border border-white/8 bg-[#14101c] p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-xs text-stone-500">Order #{o.id}</p>
                  <p className="text-amber-200 text-lg font-medium">{formatINR(o.total)}</p>
                </div>
                <div className="text-right text-sm text-stone-400">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs uppercase tracking-wider">
                    {o.status}
                  </span>
                  <p className="mt-1">{new Date(o.created_at).toLocaleString('en-IN')}</p>
                  <p>{o.payment_method}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-stone-300">
                {(o.items || []).map((it, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span>{it.title} · {it.platform_name} · {durationLabel(it.duration_months)} × {it.quantity}</span>
                    <span>{formatINR(Number(it.price) * it.quantity)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
