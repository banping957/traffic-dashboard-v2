// API 路由：获取文章列表
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://vysmewebafmoaatsqxtc.supabase.co/rest/v1/articles?select=*&order=id.desc', {
      headers: {
        'apikey': process.env.SUPABASE_KEY || 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0',
        'Authorization': `Bearer ${process.env.SUPABASE_KEY || 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0'}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Supabase error: ' + response.status);
    }
    
    const articles = await response.json();
    res.status(200).json(articles);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
}