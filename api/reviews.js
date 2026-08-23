import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const product_id = req.query?.product_id;
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (product_id) query = query.eq('product_id', Number(product_id));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: auth, error: aErr } = await supabase.auth.getUser(token);
      if (aErr || !auth?.user) return res.status(401).json({ error: 'Invalid token' });
      const user = auth.user;
      const { product_id, rating, comment } = req.body || {};
      if (!product_id || !rating) return res.status(400).json({ error: 'product_id and rating are required' });
      const stars = Math.min(5, Math.max(1, Number(rating)));
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || (user.email || 'Member').split('@')[0];
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: Number(product_id),
          user_id: user.id,
          user_name: userName,
          rating: stars,
          comment: comment || '',
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
