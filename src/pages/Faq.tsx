import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Faq } from '../types';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/faqs');
        if (!res.ok) throw new Error('Could not load FAQs');
        setFaqs(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const cats = [...new Set(faqs.map((f) => f.category))];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-rose-300/80">Lantern notes</p>
      <h1 className="font-display text-3xl sm:text-4xl mt-2">Questions from the lane</h1>
      {error && <p className="text-rose-300 mt-4">{error}</p>}
      {loading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        cats.map((cat) => (
          <div key={cat} className="mt-10">
            <h2 className="text-xs tracking-[0.2em] uppercase text-amber-200/80 mb-3">{cat}</h2>
            <div className="space-y-2">
              {faqs.filter((f) => f.category === cat).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOpen(open === f.id ? null : f.id)}
                  className="w-full text-left rounded-2xl border border-white/8 bg-[#14101c] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{f.question}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition ${open === f.id ? 'rotate-180 text-amber-300' : 'text-stone-500'}`} />
                  </div>
                  {open === f.id && <p className="mt-3 text-sm text-stone-400 leading-relaxed">{f.answer}</p>}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
