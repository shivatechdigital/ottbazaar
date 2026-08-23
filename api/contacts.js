import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { name, email, subject, message } = req.body || {};
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email and message are required' });
      }
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          name,
          email,
          subject: subject || 'General',
          message,
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
