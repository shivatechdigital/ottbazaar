export function authHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function formatINR(n: number | string) {
  const value = typeof n === 'string' ? Number(n) : n;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function durationLabel(months: number) {
  if (months === 1) return '1 Month';
  if (months === 12) return '1 Year';
  return `${months} Months`;
}

export function discountPct(price: number | string, original: number | string) {
  const p = Number(price);
  const o = Number(original);
  if (!o || o <= p) return 0;
  return Math.round(((o - p) / o) * 100);
}

export function parseFeatures(raw: string | string[] | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

export function bumpCart() {
  window.dispatchEvent(new Event('cart-updated'));
}

export function bumpWishlist() {
  window.dispatchEvent(new Event('wishlist-updated'));
}
