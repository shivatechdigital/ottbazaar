import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: 'General', message: '' });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eMap: Record<string, string> = {};
    if (form.name.trim().length < 2) eMap.name = 'Tell us your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) eMap.email = 'Enter a valid email';
    if (form.message.trim().length < 10) eMap.message = 'Write a little more so we can help';
    setFieldErr(eMap);
    if (Object.keys(eMap).length) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send');
      toast('Message received — we will reply soon');
      setForm({ name: '', email: '', subject: 'General', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-2 gap-10">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-rose-300/80">Kiosk desk</p>
        <h1 className="font-display text-3xl sm:text-4xl mt-2">Write to the bazaar</h1>
        <p className="text-stone-400 mt-4 leading-relaxed">
          Disputes, listing help, press — drop a note. We sit in Bandra and answer within one working day.
        </p>
        <div className="mt-8 space-y-3 text-sm text-stone-300">
          <p>Bandra West, Mumbai 400050</p>
          <p>hello@ottbazaar.in</p>
          <p>+91 98765 43210</p>
        </div>
        <img src="/images/hero-cinema.jpg" alt="" className="mt-8 rounded-[2rem] h-52 w-full object-cover" />
      </div>
      <form onSubmit={submit} className="rounded-3xl border border-white/8 bg-[#14101c] p-6 space-y-4">
        {error && <p className="text-rose-300 text-sm">{error}</p>}
        <label className="block text-sm">
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
          {fieldErr.name && <span className="text-rose-300 text-xs">{fieldErr.name}</span>}
        </label>
        <label className="block text-sm">
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
          {fieldErr.email && <span className="text-rose-300 text-xs">{fieldErr.email}</span>}
        </label>
        <label className="block text-sm">
          Subject
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2">
            {['General', 'Buyer support', 'Seller support', 'Partnerships'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          Message
          <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
          {fieldErr.message && <span className="text-rose-300 text-xs">{fieldErr.message}</span>}
        </label>
        <button disabled={sending} className="px-6 py-3 rounded-full bg-amber-400 text-[#1a1208] font-semibold disabled:opacity-50">
          {sending ? 'Sending…' : 'Send note'}
        </button>
      </form>
    </div>
  );
}
