import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../types';
import { authHeaders, bumpCart, durationLabel, formatINR } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Cart() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cart', { headers: authHeaders(session.access_token) });
      if (!res.ok) throw new Error('Could not load cart');
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

  const updateQty = async (id: number, quantity: number) => {
    if (!session || quantity < 1) return;
    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ id, quantity }),
    });
    if (res.ok) {
      bumpCart();
      load();
    } else toast('Could not update quantity', 'error');
  };

  const remove = async (id: number) => {
    if (!session) return;
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      bumpCart();
      toast('Removed from cart');
      load();
    }
  };

  const subtotal = items.reduce((s, i) => s + Number(i.product?.price || 0) * i.quantity, 0);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl sm:text-4xl">Your thaili</h1>
      <p className="text-stone-400 mt-2">Services you selected for WhatsApp checkout.</p>
      {error && <p className="text-rose-300 mt-4">{error}</p>}

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-white/8 p-12 text-center">
          <p className="text-stone-400">The bag is empty. The bazaar is still open.</p>
          <Link to="/shop" className="inline-block mt-4 text-amber-300">Browse listings</Link>
        </div>
      ) : (
        <div className="mt-8 grid lg:grid-cols-[1fr_280px] gap-8">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/8 bg-[#14101c] p-4 flex flex-col sm:flex-row gap-4">
                <img
                  src={item.product?.image_url || '/images/hero-cinema.jpg'}
                  alt=""
                  className="h-40 sm:h-24 w-full sm:w-28 object-cover rounded-2xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium leading-snug break-words">{item.product?.title || 'Unavailable listing'}</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {item.product?.platform_name} · {item.product ? durationLabel(item.product.duration_months) : ''}
                  </p>
                  <p className="text-amber-200 mt-2">{formatINR(item.product?.price || 0)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2 py-1">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}><Minus className="h-3.5 w-3.5" /></button>
                      <span className="text-sm w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button onClick={() => remove(item.id)} className="text-rose-300 text-sm inline-flex items-center gap-1">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="rounded-3xl border border-white/8 bg-[#14101c] p-6 h-fit">
            <h3 className="text-sm tracking-[0.2em] uppercase text-amber-200/80">Kiosk slip</h3>
            <div className="mt-4 flex justify-between text-sm text-stone-400">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-stone-400">
              <span>Platform fee</span>
              <span>₹0</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/8 flex justify-between font-medium">
              <span>Total</span>
              <span className="text-amber-200">{formatINR(subtotal)}</span>
            </div>
            <Link to="/checkout" className="mt-6 block text-center rounded-full bg-amber-400 text-[#1a1208] py-3 font-semibold">
              Continue to WhatsApp Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
