import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Platform } from '../types';
import { authHeaders } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const IMAGES = [
  '/images/hero-cinema.jpg',
  '/images/watch-night.jpg',
  '/images/popcorn.jpg',
  '/images/music-stream.jpg',
  '/images/mobile-stream.jpg',
  '/images/seller-desk.jpg',
];

export default function Sell() {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    platform_id: '',
    title: '',
    plan_type: 'Premium',
    duration_months: '1',
    price: '',
    original_price: '',
    slots_total: '1',
    description: '',
    features: '4K,Ad-free,Multiple devices',
    image_url: IMAGES[0],
  });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/platforms').then((r) => r.json()).then(setPlatforms).catch(() => {});
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.platform_id) e.platform_id = 'Pick a platform';
    if (form.title.trim().length < 6) e.title = 'Give the listing a clearer title';
    if (!form.price || Number(form.price) < 49) e.price = 'Price should be at least ₹49';
    if (!form.description.trim()) e.description = 'Add a short description';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!validate()) return;
    setSending(true);
    setError('');
    const plat = platforms.find((p) => String(p.id) === form.platform_id);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: authHeaders(session.access_token),
        body: JSON.stringify({
          platform_id: Number(form.platform_id),
          platform_name: plat?.name,
          platform_color: plat?.color,
          title: form.title,
          plan_type: form.plan_type,
          duration_months: Number(form.duration_months),
          price: Number(form.price),
          original_price: Number(form.original_price) || Number(form.price),
          slots_total: Number(form.slots_total),
          description: form.description,
          features: JSON.stringify(form.features.split(',').map((s) => s.trim()).filter(Boolean)),
          image_url: form.image_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not list');
      toast('Stall is live');
      navigate(`/shop/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <section className="relative h-52 sm:h-64 overflow-hidden">
        <img src="/images/seller-desk.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#07040d]/70" />
        <div className="absolute inset-0 max-w-3xl mx-auto px-4 flex flex-col justify-end pb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-amber-300/80">Open a stall</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-2">List leftover seats</h1>
        </div>
      </section>
      <form onSubmit={submit} className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5">
        {error && <p className="text-rose-300 text-sm">{error}</p>}
        <label className="block text-sm">
          Platform
          <select
            value={form.platform_id}
            onChange={(e) => setForm({ ...form, platform_id: e.target.value })}
            className="mt-1 w-full bg-[#14101c] border border-white/10 rounded-xl px-3 py-2"
          >
            <option value="">Choose house</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {fieldErr.platform_id && <span className="text-rose-300 text-xs">{fieldErr.platform_id}</span>}
        </label>
        <label className="block text-sm">
          Listing title
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Netflix Premium — 1 unused profile"
            className="mt-1 w-full bg-[#14101c] border border-white/10 rounded-xl px-3 py-2"
          />
          {fieldErr.title && <span className="text-rose-300 text-xs">{fieldErr.title}</span>}
        </label>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block text-sm">
            Plan
            <select value={form.plan_type} onChange={(e) => setForm({ ...form, plan_type: e.target.value })} className="mt-1 w-full bg-[#14101c] border border-white/10 rounded-xl px-3 py-2">
              {['Mobile', 'Basic', 'Standard', 'Premium', 'Family', 'Student'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            Duration
            <select value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: e.target.value })} className="mt-1 w-full bg-[#14101c] border border-white/10 rounded-xl px-3 py-2">
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </label>
          <label className="block text-sm">
            Seats
            <input type="number" min={1} max={6} value={form.slots_total} onChange={(e) => setForm({ ...form, slots_total: e.target.value })} className="mt-1 w-full bg-[#14101c] border border-white/10 rounded-xl px-3 py-2" />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            Your price (₹)
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 w-full bg-[#14101c] border border-white/10 rounded-xl px-3 py-2" />
            {fieldErr.price && <span className="text-rose-300 text-xs">{fieldErr.price}</span>}
          </label>
          <label className="block text-sm">
            Retail price (₹)
            <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="mt-1 w-full bg-[#14101c] border border-white/10 rounded-xl px-3 py-2" />
          </label>
        </div>
        <label className="block text-sm">
          Description
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full bg-[#14101c] border border-white/10 rounded-xl px-3 py-2" />
          {fieldErr.description && <span className="text-rose-300 text-xs">{fieldErr.description}</span>}
        </label>
        <label className="block text-sm">
          Features (comma separated)
          <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="mt-1 w-full bg-[#14101c] border border-white/10 rounded-xl px-3 py-2" />
        </label>
        <div>
          <p className="text-sm mb-2">Cover image</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {IMAGES.map((src) => (
              <button type="button" key={src} onClick={() => setForm({ ...form, image_url: src })} className={`rounded-xl overflow-hidden border-2 ${form.image_url === src ? 'border-amber-400' : 'border-transparent'}`}>
                <img src={src} alt="" className="h-16 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <button disabled={sending} className="px-8 py-3 rounded-full bg-amber-400 text-[#1a1208] font-semibold disabled:opacity-50">
          {sending ? 'Publishing…' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
}
