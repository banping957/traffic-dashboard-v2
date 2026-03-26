// API 路由：添加文章
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://vysmewebafmoaatsqxtc.supabase.co/rest/v1/articles', {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_KEY || 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0',
        'Authorization': `Bearer ${process.env.SUPABASE_KEY || 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0'}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error('Supabase error: ' + response.status);
    }
    
    const article = await response.json();
    res.status(201).json(article);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
}