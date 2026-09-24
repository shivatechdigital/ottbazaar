import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sellerId = process.env.SEED_SELLER_ID;

if (!supabaseUrl || !serviceRoleKey || !sellerId) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SEED_SELLER_ID are required.',
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const platformImages = {
  Spotify: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=256',
  SonyLIV: 'https://www.google.com/s2/favicons?domain=sonyliv.com&sz=256',
  JioHotstar: 'https://www.google.com/s2/favicons?domain=hotstar.com&sz=256',
  ZEE5: 'https://www.google.com/s2/favicons?domain=zee5.com&sz=256',
  'IPTV 4K': '/images/mobile-stream.jpg',
  'IPTV Filex': '/images/watch-night.jpg',
  'IPTV Boss': '/images/hero-bazaar.jpg',
  Netflix: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=256',
  'Prime Video': 'https://www.google.com/s2/favicons?domain=primevideo.com&sz=256',
  Crunchyroll: 'https://www.google.com/s2/favicons?domain=crunchyroll.com&sz=256',
  'YouTube Premium': 'https://www.google.com/s2/favicons?domain=youtube.com&sz=256',
};

const catalog = [
  { platform: 'Spotify', color: '#1DB954', category: 'Music', months: 2, price: 79 },
  { platform: 'SonyLIV', color: '#5736A3', category: 'Streaming', months: 1, price: 89 },
  { platform: 'SonyLIV', color: '#5736A3', category: 'Streaming', months: 12, price: 499 },
  { platform: 'JioHotstar', color: '#0B57D0', category: 'Streaming', months: 1, price: 79 },
  { platform: 'JioHotstar', color: '#0B57D0', category: 'Streaming', months: 12, price: 449 },
  { platform: 'ZEE5', color: '#E91E63', category: 'Streaming', months: 1, price: 49 },
  { platform: 'ZEE5', color: '#E91E63', category: 'Streaming', months: 12, price: 399 },
  { platform: 'IPTV 4K', color: '#16A085', category: 'IPTV', months: 1, price: 299 },
  { platform: 'IPTV Filex', color: '#D35400', category: 'IPTV', months: 1, price: 299 },
  { platform: 'IPTV Boss', color: '#C0392B', category: 'IPTV', months: 1, price: 299 },
  { platform: 'Netflix', color: '#E50914', category: 'Streaming', months: 1, price: 99 },
  { platform: 'Netflix', color: '#E50914', category: 'Streaming', months: 3, price: 299 },
  { platform: 'Prime Video', color: '#00A8E1', category: 'Streaming', months: 1, price: 59 },
  { platform: 'Prime Video', color: '#00A8E1', category: 'Streaming', months: 6, price: 299 },
  { platform: 'Crunchyroll', color: '#F47521', category: 'Anime', months: 1, price: 79 },
  { platform: 'Crunchyroll', color: '#F47521', category: 'Anime', months: 3, price: 159 },
  { platform: 'YouTube Premium', color: '#FF0000', category: 'Video', months: 1, price: 39 },
  { platform: 'YouTube Premium', color: '#FF0000', category: 'Video', months: 6, price: 349 },
];

const { data: sellerData, error: sellerError } = await supabase.auth.admin.getUserById(sellerId);
if (sellerError || !sellerData.user) {
  throw new Error(`SEED_SELLER_ID is not a valid Auth user: ${sellerError?.message || sellerId}`);
}

const sellerName = sellerData.user.user_metadata?.full_name
  || sellerData.user.user_metadata?.name
  || sellerData.user.email?.split('@')[0]
  || 'OTT Bazaar';

const platformIds = new Map();
for (const item of catalog) {
  if (platformIds.has(item.platform)) continue;

  let { data: platform, error } = await supabase
    .from('platforms')
    .select('*')
    .eq('name', item.platform)
    .maybeSingle();
  if (error) throw error;

  if (!platform) {
    ({ data: platform, error } = await supabase
      .from('platforms')
      .insert({
        name: item.platform,
        color: item.color,
        tagline: `Affordable ${item.platform} plans`,
        category: item.category,
      })
      .select()
      .single());
    if (error) throw error;
  }

  platformIds.set(item.platform, platform.id);
}

for (const item of catalog) {
  const productName = item.platform.endsWith('Premium') ? item.platform : `${item.platform} Premium`;
  const title = `${productName} - ${item.months} ${item.months === 1 ? 'Month' : 'Months'}`;
  const product = {
    seller_id: sellerId,
    seller_name: sellerName,
    platform_id: platformIds.get(item.platform),
    platform_name: item.platform,
    platform_color: item.color,
    title,
    plan_type: 'Premium',
    duration_months: item.months,
    price: item.price,
    original_price: item.price,
    slots_available: 100,
    slots_total: 100,
    description: `${item.platform} Premium access for ${item.months} ${item.months === 1 ? 'month' : 'months'}.`,
    features: JSON.stringify(['Premium access', 'Quick activation']),
    image_url: platformImages[item.platform],
    is_active: true,
  };

  const { data: existing, error: findError } = await supabase
    .from('products')
    .select('id')
    .eq('seller_id', sellerId)
    .eq('platform_name', item.platform)
    .eq('duration_months', item.months)
    .maybeSingle();
  if (findError) throw findError;

  const query = existing
    ? supabase.from('products').update(product).eq('id', existing.id)
    : supabase.from('products').insert(product);
  const { error } = await query;
  if (error) throw error;

  console.log(`${existing ? 'Updated' : 'Created'}: ${title} - Rs ${item.price}`);
}

console.log(`Catalog seed complete: ${catalog.length} products.`);