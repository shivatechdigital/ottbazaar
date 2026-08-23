import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CartItem } from '../types';
import { authHeaders, formatINR } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Checkout() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    payment_method: 'UPI',
  });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});

  useEffect(() => {
    const run = async () => {
      if (!session || !user) return;
      setForm((f) => ({
        ...f,
        customer_email: user.email || '',
        customer_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      }));
      const res = await fetch('/api/cart', { headers: authHeaders(session.access_token) });
      if (res.ok) setItems(await res.json());
      setLoading(false);
    };
    run();
  }, [session, user]);

  const total = items.reduce((s, i) => s + Number(i.product?.price || 0) * i.quantity, 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.customer_name.trim().length < 2) e.customer_name = 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) e.customer_email = 'Enter a valid email';
    if (!/^[0-9]{10}$/.test(form.customer_phone.replace(/\s/g, ''))) e.customer_phone = 'Enter a 10-digit phone';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || items.length === 0) return;
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      const lines = items.map((item, idx) => {
        const qty = item.quantity || 1;
        const title = item.product?.title || 'Service';
        return `${idx + 1}. ${title} x ${qty}`;
      });

      const msg = [
        'Hi Team,',
        'I like your services will you please provide the below services. Send me the QR will send the money',
        '',
        ...lines,
      ].join('\n');

      const whatsappUrl = `https://wa.me/919905711407?text=${encodeURIComponent(msg)}`;
      window.location.href = whatsappUrl;
      toast('Redirecting to WhatsApp...');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open WhatsApp');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-400">Nothing to checkout.</p>
        <Link to="/shop" className="text-amber-300 mt-3 inline-block">Return to shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl sm:text-4xl">Kiosk checkout</h1>
      <form onSubmit={place} className="mt-8 grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-4 rounded-3xl border border-white/8 bg-[#14101c] p-6">
          {error && <p className="text-rose-300 text-sm">{error}</p>}
          <label className="block text-sm">
            Full name
            <input
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            />
            {fieldErr.customer_name && <span className="text-rose-300 text-xs">{fieldErr.customer_name}</span>}
          </label>
          <label className="block text-sm">
            Email
            <input
              type="email"
              value={form.customer_email}
              onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
              className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            />
            {fieldErr.customer_email && <span className="text-rose-300 text-xs">{fieldErr.customer_email}</span>}
          </label>
          <label className="block text-sm">
            Phone
            <input
              value={form.customer_phone}
              onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              placeholder="10-digit mobile"
              className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            />
            {fieldErr.customer_phone && <span className="text-rose-300 text-xs">{fieldErr.customer_phone}</span>}
          </label>
          <div>
            <p className="text-sm mb-2">Pay with</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['UPI', 'Card', 'Netbanking'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setForm({ ...form, payment_method: m })}
                  className={`rounded-xl border py-2 text-sm ${
                    form.payment_method === m ? 'border-amber-400 bg-amber-400/10 text-amber-200' : 'border-white/10'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        <aside className="rounded-3xl border border-white/8 bg-[#14101c] p-6 h-fit">
          {items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm mb-2 text-stone-300">
              <span className="truncate mr-3">{i.product?.title} × {i.quantity}</span>
              <span>{formatINR(Number(i.product?.price || 0) * i.quantity)}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-white/8 flex justify-between font-medium">
            <span>Total</span>
            <span className="text-amber-200">{formatINR(total)}</span>
          </div>
          <button
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-amber-400 text-[#1a1208] py-3 font-semibold disabled:opacity-50"
          >
            {submitting ? 'Opening WhatsApp...' : `Buy now on WhatsApp ${formatINR(total)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}
