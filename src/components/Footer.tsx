import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/8 bg-[#07040d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/images/logo-mark.png" alt="" className="h-9 w-9" />
            <span className="font-display tracking-[0.16em] text-amber-200">OTTBAZAAR</span>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed">
            India&apos;s neighbourhood bazaar for shared OTT seats. Buy unused slots, sell leftover months, stream more for less.
          </p>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-amber-200/80 mb-4">Explore</h4>
          <div className="flex flex-col gap-2 text-sm text-stone-400">
            <Link to="/shop" className="hover:text-white">Shop plans</Link>
            <Link to="/sell" className="hover:text-white">Sell a seat</Link>
            <Link to="/about" className="hover:text-white">Our story</Link>
            <Link to="/faq" className="hover:text-white">FAQ</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-amber-200/80 mb-4">Account</h4>
          <div className="flex flex-col gap-2 text-sm text-stone-400">
            <Link to="/orders" className="hover:text-white">Orders</Link>
            <Link to="/wishlist" className="hover:text-white">Wishlist</Link>
            <Link to="/cart" className="hover:text-white">Cart</Link>
            <Link to="/dashboard" className="hover:text-white">Seller desk</Link>
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-amber-200/80 mb-4">Kiosk</h4>
          <div className="space-y-3 text-sm text-stone-400">
            <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-amber-300" /> Bandra West, Mumbai 400050</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-amber-300" /> +91 98765 43210</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-amber-300" /> hello@ottbazaar.in</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 py-5 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} OttBazaar · Shared seats, honest prices · Made in India
      </div>
    </footer>
  );
}
