import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../types';
import { bumpCart, bumpWishlist, discountPct, durationLabel, formatINR } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authHeaders } from '../lib/api';

export default function ProductCard({
  product,
  wished = false,
  onWishChange,
}: {
  product: Product;
  wished?: boolean;
  onWishChange?: () => void;
}) {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const off = discountPct(product.price, product.original_price);
  const isPlatformLogo = product.image_url.includes('/s2/favicons');

  const addCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      navigate('/login', { state: { from: '/shop' } });
      return;
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: authHeaders(session.access_token),
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Could not add to cart');
      }
      bumpCart();
      toast('Added to cart');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not add to cart', 'error');
    }
  };

  const toggleWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      navigate('/login', { state: { from: '/wishlist' } });
      return;
    }
    try {
      const res = await fetch('/api/wishlist', {
        method: wished ? 'DELETE' : 'POST',
        headers: authHeaders(session.access_token),
        body: JSON.stringify({ product_id: product.id }),
      });
      if (!res.ok) throw new Error('Wishlist failed');
      bumpWishlist();
      toast(wished ? 'Removed from wishlist' : 'Saved to wishlist');
      onWishChange?.();
    } catch {
      toast('Wishlist update failed', 'error');
    }
  };

  return (
    <Link
      to={`/shop/${product.id}`}
      className="group block rounded-3xl overflow-hidden bg-[#14101c] border border-white/8 hover:border-amber-400/30 transition shadow-lg shadow-black/20"
    >
      <div
        className={`relative h-44 overflow-hidden ${isPlatformLogo ? 'flex items-center justify-center' : ''}`}
        style={isPlatformLogo ? { backgroundColor: `${product.platform_color}20` } : undefined}
      >
        <img
          src={product.image_url}
          alt={product.title}
          className={isPlatformLogo
            ? 'h-24 w-24 object-contain drop-shadow-2xl group-hover:scale-105 transition duration-500'
            : 'w-full h-full object-cover group-hover:scale-105 transition duration-500'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14101c] via-transparent to-black/20" />
        <span
          className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white"
          style={{ background: product.platform_color }}
        >
          {product.platform_name}
        </span>
        {off > 0 && (
          <span className="absolute top-3 right-3 text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-400 text-[#1a1208]">
            {off}% off
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-stone-100 leading-snug line-clamp-2">{product.title}</h3>
          <p className="text-xs text-stone-500 mt-1">
            {product.plan_type} · {durationLabel(product.duration_months)} · {product.slots_available} seats left
          </p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-lg text-amber-200 font-semibold">{formatINR(product.price)}</div>
            {Number(product.original_price) > Number(product.price) && (
              <div className="text-xs text-stone-500 line-through">{formatINR(product.original_price)}</div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleWish}
              className={`p-2 rounded-full border ${
                wished ? 'border-rose-400 text-rose-400 bg-rose-500/10' : 'border-white/10 text-stone-300 hover:border-rose-400/40'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${wished ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={addCart}
              className="p-2 rounded-full bg-amber-400 text-[#1a1208] hover:bg-amber-300"
              aria-label="Add to cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
