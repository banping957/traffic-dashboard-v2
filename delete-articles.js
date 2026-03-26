const axios = require('axios');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

async function deleteArticles() {
  const titles = [
    "U.S.News 2026出炉：芝大杀回前6，宾大跻进前7，最大黑马却是它",
    "我拿着660分去了南大，室友658分去了东南，四年后谁更稳"
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
        const id = response.data[0].id;
        
        // 删除文章
        await axios({
          method: 'DELETE',
          url: `${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`,
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        
        console.log(`✅ 已删除: ${title}`);
      } else {
        console.log(`⚠️ 未找到: ${title}`);
      }
    } catch (error) {
      console.error(`❌ 删除失败 ${title}:`, error.message);
    }
  }
}

deleteArticles();
