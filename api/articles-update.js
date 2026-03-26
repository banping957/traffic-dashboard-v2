// API 路由：更新/删除文章
export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    if (req.method === 'PUT') {
      const response = await fetch(`https://vysmewebafmoaatsqxtc.supabase.co/rest/v1/articles?id=eq.${id}`, {
        method: 'PATCH',
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
      res.status(200).json(article);
      
    } else if (req.method === 'DELETE') {
      await fetch(`https://vysmewebafmoaatsqxtc.supabase.co/rest/v1/articles?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': process.env.SUPABASE_KEY || 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0',
          'Authorization': `Bearer ${process.env.SUPABASE_KEY || 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0'}`
        }
      });
      
      res.status(204).end();
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
}