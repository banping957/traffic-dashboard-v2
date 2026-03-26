const axios = require('axios');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

async function deleteArticles() {
  // 要删除的文章标题（之前上传的错误版本）
  const titles = [
    "考研调剂系统3天后开放！2026年这5个变化直接决定你能不能上岸",
    "2026全球计算机专业排名出炉：清华上交并列第一，南大AI方向登顶世界"
  ];
  
  for (const title of titles) {
    try {
      // 先查询文章ID
      const response = await axios({
        method: 'GET',
        url: `${SUPABASE_URL}/rest/v1/articles?title=eq.${encodeURIComponent(title)}`,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      if (response.data && response.data.length > 0) {
        // 删除所有匹配的文章（可能有多个版本）
        for (const article of response.data) {
          await axios({
            method: 'DELETE',
            url: `${SUPABASE_URL}/rest/v1/articles?id=eq.${article.id}`,
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          });
          console.log(`✅ 已删除: ${title} (ID: ${article.id})`);
        }
      } else {
        console.log(`⚠️ 未找到: ${title}`);
      }
    } catch (error) {
      console.error(`❌ 删除失败 ${title}:`, error.message);
    }
  }
}

deleteArticles();
