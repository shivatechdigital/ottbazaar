import supabase from './db-client.js';

async function requireUser(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
  return data.user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const { data: items, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: true });
      if (error) throw error;
      const ids = [...new Set((items || []).map((i) => i.product_id))];
      let products = [];
      if (ids.length) {
        const { data: prods, error: pErr } = await supabase.from('products').select('*').in('id', ids);
        if (pErr) throw pErr;
        products = prods || [];
      }
      const map = Object.fromEntries(products.map((p) => [p.id, p]));
      const merged = (items || []).map((item) => ({ ...item, product: map[item.product_id] || null }));
      return res.status(200).json(merged);
    }

    if (req.method === 'POST') {
      const { product_id, quantity } = req.body || {};
      if (!product_id) return res.status(400).json({ error: 'product_id is required' });
      const qty = Math.max(1, Number(quantity) || 1);
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product_id)
        .maybeSingle();
      if (existing) {
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + qty })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id, quantity: qty })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, quantity } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const qty = Math.max(1, Number(quantity) || 1);
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: qty })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id, clear } = req.body || {};
      if (clear) {
        const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('cart_items').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
