import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Menu, Package, Search, ShoppingBag, Store, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabase';
import { authHeaders } from '../lib/api';

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/sell', label: 'Sell' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);

  const token = session?.access_token;

  const loadCounts = async () => {
    if (!token) {
      setCartCount(0);
      setWishCount(0);
      return;
    }
    try {
      const [cRes, wRes] = await Promise.all([
        fetch('/api/cart', { headers: authHeaders(token) }),
        fetch('/api/wishlist', { headers: authHeaders(token) }),
      ]);
      if (cRes.ok) {
        const data = await cRes.json();
        setCartCount(Array.isArray(data) ? data.reduce((s: number, i: { quantity?: number }) => s + (i.quantity || 1), 0) : 0);
      }
      if (wRes.ok) {
        const data = await wRes.json();
        setWishCount(Array.isArray(data) ? data.length : 0);
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadCounts();
    const onCart = () => loadCounts();
    window.addEventListener('cart-updated', onCart);
    window.addEventListener('wishlist-updated', onCart);
    return () => {
      window.removeEventListener('cart-updated', onCart);
      window.removeEventListener('wishlist-updated', onCart);
    };
  }, [token]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setMenu(false);
    navigate('/');
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0a0612]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/images/logo-mark.png" alt="OttBazaar" className="h-10 w-10 object-contain" />
          <div className="leading-none">
            <div className="font-display text-[18px] tracking-[0.14em] text-amber-200">OTTBAZAAR</div>
            <div className="text-[10px] tracking-[0.28em] text-rose-300/80 uppercase">Stream Market</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 ml-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm tracking-wide transition ${
                  isActive ? 'text-amber-200' : 'text-stone-300 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={search} className="hidden md:flex flex-1 max-w-md ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Netflix, Hotstar, Spotify..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/50"
          />
        </form>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-2">
          <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-white/5 text-stone-200">
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[10px] flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-white/5 text-stone-200">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-amber-400 text-[#1a1208] text-[10px] font-semibold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="p-2 rounded-full hover:bg-white/5 text-stone-200"
              >
                <User className="h-5 w-5" />
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#16101f] shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/8">
                    <p className="text-xs text-stone-500">Signed in as</p>
                    <p className="text-sm truncate text-amber-100">{user.email}</p>
                  </div>
                  <Link to="/orders" onClick={() => setMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5">
                    <Package className="h-4 w-4 text-amber-300" /> My Orders
                  </Link>
                  <Link to="/dashboard" onClick={() => setMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5">
                    <Store className="h-4 w-4 text-amber-300" /> Seller Desk
                  </Link>
                  <button onClick={signOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 text-rose-300">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm px-4 py-1.5 rounded-full bg-amber-400 text-[#1a1208] font-medium hover:bg-amber-300"
            >
              Sign in
            </Link>
          )}

          <button className="lg:hidden p-2 text-stone-200" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/8 bg-[#0a0612] px-4 py-4 space-y-3">
          <form onSubmit={search} className="relative md:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search platforms..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm"
            />
          </form>
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-stone-200">
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link to="/login" onClick={() => setOpen(false)} className="block py-2 text-amber-300">
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
