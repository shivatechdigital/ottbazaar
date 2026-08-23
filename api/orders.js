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
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const ids = (orders || []).map((o) => o.id);
      let items = [];
      if (ids.length) {
        const { data: rows, error: iErr } = await supabase.from('order_items').select('*').in('order_id', ids);
        if (iErr) throw iErr;
        items = rows || [];
      }
      const grouped = {};
      for (const row of items) {
        if (!grouped[row.order_id]) grouped[row.order_id] = [];
        grouped[row.order_id].push(row);
      }
      return res.status(200).json((orders || []).map((o) => ({ ...o, items: grouped[o.id] || [] })));
    }

    if (req.method === 'POST') {
      const { customer_name, customer_email, customer_phone, payment_method } = req.body || {};
      if (!customer_name || !customer_email || !customer_phone || !payment_method) {
        return res.status(400).json({ error: 'Name, email, phone and payment method are required' });
      }

      const { data: cart, error: cErr } = await supabase.from('cart_items').select('*').eq('user_id', user.id);
      if (cErr) throw cErr;
      if (!cart || !cart.length) return res.status(400).json({ error: 'Cart is empty' });

      const pids = cart.map((c) => c.product_id);
      const { data: products, error: pErr } = await supabase.from('products').select('*').in('id', pids);
      if (pErr) throw pErr;
      const pmap = Object.fromEntries((products || []).map((p) => [p.id, p]));

      let total = 0;
      for (const line of cart) {
        const p = pmap[line.product_id];
        if (!p || !p.is_active) return res.status(400).json({ error: 'A listing in your cart is no longer available' });
        if (p.slots_available < line.quantity) {
          return res.status(400).json({ error: `Only ${p.slots_available} slot(s) left for ${p.title}` });
        }
        total += Number(p.price) * line.quantity;
      }

      const { data: order, error: oErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          status: 'confirmed',
          customer_name,
          customer_email,
          customer_phone,
          payment_method,
        })
        .select()
        .single();
      if (oErr) throw oErr;

      const orderItems = cart.map((line) => {
        const p = pmap[line.product_id];
        return {
          order_id: order.id,
          product_id: p.id,
          title: p.title,
          price: p.price,
          quantity: line.quantity,
          platform_name: p.platform_name,
          plan_type: p.plan_type,
          duration_months: p.duration_months,
        };
      });
      const { error: oiErr } = await supabase.from('order_items').insert(orderItems);
      if (oiErr) throw oiErr;

      for (const line of cart) {
        const p = pmap[line.product_id];
        const left = p.slots_available - line.quantity;
        const { error: uErr } = await supabase
          .from('products')
          .update({ slots_available: left, is_active: left > 0 ? p.is_active : false })
          .eq('id', p.id);
        if (uErr) throw uErr;
      }

      const { error: dErr } = await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (dErr) throw dErr;

      return res.status(201).json({ ...order, items: orderItems });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
