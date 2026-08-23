import supabase from './db-client.js';

async function getUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, platform, search, duration, minPrice, maxPrice, seller_id, mine } = req.query || {};

      if (id) {
        const { data, error } = await supabase.from('products').select('*').eq('id', Number(id)).single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (mine === '1') {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }

      let query = supabase.from('products').select('*').eq('is_active', true);
      if (platform) query = query.eq('platform_name', platform);
      if (seller_id) query = query.eq('seller_id', seller_id);
      if (duration) query = query.eq('duration_months', Number(duration));
      if (minPrice) query = query.gte('price', Number(minPrice));
      if (maxPrice) query = query.lte('price', Number(maxPrice));
      if (search) query = query.or(`title.ilike.%${search}%,platform_name.ilike.%${search}%,plan_type.ilike.%${search}%`);
      const { data, error } = await query.order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const {
        platform_id, platform_name, platform_color, title, plan_type,
        duration_months, price, original_price, slots_total, description, features, image_url,
      } = req.body || {};
      if (!title || !platform_name || !price || !duration_months) {
        return res.status(400).json({ error: 'Title, platform, price and duration are required' });
      }
      const slots = Math.max(1, Number(slots_total) || 1);
      const sellerName = user.user_metadata?.full_name || user.user_metadata?.name || (user.email || 'Seller').split('@')[0];
      const { data, error } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          seller_name: sellerName,
          platform_id: Number(platform_id) || 0,
          platform_name,
          platform_color: platform_color || '#e8b86d',
          title,
          plan_type: plan_type || 'Standard',
          duration_months: Number(duration_months),
          price: Number(price),
          original_price: Number(original_price) || Number(price),
          slots_available: slots,
          slots_total: slots,
          description: description || '',
          features: features || '[]',
          image_url: image_url || '/images/hero-cinema.jpg',
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { id, ...fields } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data: existing, error: findErr } = await supabase.from('products').select('*').eq('id', id).single();
      if (findErr) throw findErr;
      if (existing.seller_id !== user.id) return res.status(403).json({ error: 'Not your listing' });
      const allowed = [
        'title', 'plan_type', 'duration_months', 'price', 'original_price',
        'slots_available', 'slots_total', 'description', 'features', 'image_url',
        'is_active', 'platform_id', 'platform_name', 'platform_color',
      ];
      const update = {};
      for (const key of allowed) {
        if (fields[key] !== undefined) update[key] = fields[key];
      }
      const { data, error } = await supabase.from('products').update(update).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data: existing, error: findErr } = await supabase.from('products').select('*').eq('id', id).single();
      if (findErr) throw findErr;
      if (existing.seller_id !== user.id) return res.status(403).json({ error: 'Not your listing' });
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
