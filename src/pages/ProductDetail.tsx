import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import type { Product, Review } from '../types';
import { authHeaders, bumpCart, bumpWishlist, discountPct, durationLabel, formatINR, parseFeatures } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wished, setWished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [pRes, rRes] = await Promise.all([
        fetch(`/api/products?id=${id}`),
        fetch(`/api/reviews?product_id=${id}`),
      ]);
      if (!pRes.ok) throw new Error('Listing not found');
      const p: Product = await pRes.json();
      setProduct(p);
      const revs = rRes.ok ? await rRes.json() : [];
      setReviews(Array.isArray(revs) ? revs : []);
      const all = await fetch('/api/products');
      if (all.ok) {
        const list: Product[] = await all.json();
        setRelated(list.filter((x) => x.platform_name === p.platform_name && x.id !== p.id).slice(0, 4));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const check = async () => {
      if (!session || !product) {
        setWished(false);
        return;
      }
      const res = await fetch('/api/wishlist', { headers: authHeaders(session.access_token) });
      if (res.ok) {
        const data = await res.json();
        setWished((data || []).some((w: { product_id: number }) => w.product_id === product.id));
      }
    };
    check();
  }, [session, product]);

  const addCart = async () => {
    if (!session) return navigate('/login', { state: { from: `/shop/${id}` } });
    if (!product) return;
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ product_id: product.id, quantity: 1 }),
    });
    if (res.ok) {
      bumpCart();
      toast('Added to cart');
    } else toast('Could not add to cart', 'error');
  };

  const buyNow = async () => {
    await addCart();
    if (session) navigate('/checkout');
  };

  const toggleWish = async () => {
    if (!session) return navigate('/login');
    if (!product) return;
    const res = await fetch('/api/wishlist', {
      method: wished ? 'DELETE' : 'POST',
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ product_id: product.id }),
    });
    if (res.ok) {
      setWished(!wished);
      bumpWishlist();
      toast(wished ? 'Removed from wishlist' : 'Saved to wishlist');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return navigate('/login');
    setSending(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: authHeaders(session.access_token),
        body: JSON.stringify({ product_id: Number(id), rating, comment }),
      });
      if (!res.ok) throw new Error('Could not post review');
      setComment('');
      toast('Review published');
      const rRes = await fetch(`/api/reviews?product_id=${id}`);
      if (rRes.ok) setReviews(await rRes.json());
    } catch {
      toast('Review failed', 'error');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-rose-300">{error || 'Not found'}</p>
        <Link to="/shop" className="inline-block mt-4 text-amber-300">Back to shop</Link>
      </div>
    );
  }

  const off = discountPct(product.price, product.original_price);
  const features = parseFeatures(product.features);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-sm text-stone-500 mb-6">
        <Link to="/shop" className="hover:text-amber-200">Shop</Link> / {product.platform_name}
      </p>
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="relative rounded-[2rem] overflow-hidden h-[280px] sm:h-[420px]">
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div>
          <span className="text-xs px-3 py-1 rounded-full text-white" style={{ background: product.platform_color }}>
            {product.platform_name}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl mt-4">{product.title}</h1>
          <p className="text-stone-400 mt-2">
            Hosted by {product.seller_name} · {product.plan_type} · {durationLabel(product.duration_months)}
          </p>
          <div className="flex items-center gap-2 mt-3 text-amber-300 text-sm">
            <Star className="h-4 w-4 fill-current" /> {avg ? avg.toFixed(1) : 'New'} · {reviews.length} reviews
          </div>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-3xl sm:text-4xl text-amber-200 font-semibold">{formatINR(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-stone-500 line-through">{formatINR(product.original_price)}</span>
                <span className="text-xs bg-amber-400 text-[#1a1208] px-2 py-1 rounded-full">{off}% off</span>
              </>
            )}
          </div>
          <p className="mt-5 text-stone-300 leading-relaxed">{product.description}</p>
          {features.length > 0 && (
            <ul className="mt-5 grid sm:grid-cols-2 gap-2 text-sm text-stone-300">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> {f}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-5 text-sm text-stone-400">{product.slots_available} of {product.slots_total} seats remaining</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={addCart} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 text-[#1a1208] font-semibold">
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
            <button onClick={buyNow} className="px-6 py-3 rounded-full border border-white/20 hover:border-amber-300/50">
              Buy now
            </button>
            <button onClick={toggleWish} className={`p-3 rounded-full border ${wished ? 'border-rose-400 text-rose-400' : 'border-white/15'}`}>
              <Heart className={`h-5 w-5 ${wished ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl mb-6">Reviews</h2>
        <form onSubmit={submitReview} className="rounded-3xl border border-white/8 bg-[#14101c] p-6 mb-6">
          <p className="text-sm text-stone-400 mb-3">Share how the invite went</p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} className={n <= rating ? 'text-amber-300' : 'text-stone-600'}>
                <Star className="h-5 w-5 fill-current" />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={3}
            placeholder="Was the profile shared quickly?"
            className="w-full bg-black/30 border border-white/10 rounded-2xl p-3 text-sm"
          />
          <button disabled={sending} className="mt-3 px-5 py-2 rounded-full bg-rose-500 text-sm disabled:opacity-50">
            {sending ? 'Posting…' : 'Post review'}
          </button>
        </form>
        <div className="space-y-4">
          {reviews.length === 0 && <p className="text-stone-500">No reviews yet. Be the first lantern.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/8 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-200">{r.user_name}</span>
                <span className="text-amber-300">{'★'.repeat(r.rating)}</span>
              </div>
              <p className="text-stone-400 mt-2 text-sm">{r.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl mb-6">More from {product.platform_name}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
