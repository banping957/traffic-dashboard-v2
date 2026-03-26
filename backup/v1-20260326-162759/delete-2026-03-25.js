const axios = require('axios');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

async function deleteArticles() {
  try {
    // 查询今天的文章
    const response = await axios({
      method: 'GET',
      url: `${SUPABASE_URL}/rest/v1/articles?date=eq.2026-03-25`,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    const articles = response.data;
    console.log(`找到 ${articles.length} 篇2026-03-25的文章`);
    
    for (const article of articles) {
      await axios({
        method: 'DELETE',
        url: `${SUPABASE_URL}/rest/v1/articles?id=eq.${article.id}`,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      console.log(`✅ 已删除: ${article.title} (ID: ${article.id})`);
    }
    
    console.log('\n删除完成！');
  } catch (error) {
    console.error('删除失败:', error.message);
  }
}

deleteArticles();
