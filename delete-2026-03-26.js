const axios = require('axios');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

async function deleteArticles() {
  console.log('========================================');
  console.log('🗑️  删除2026-03-26的文章');
  console.log('========================================\n');
  
  const titles = [
    "2026泰晤士世界大学排名发布：牛津十连冠，中国7校进前100",
    "从'解题'到'解决问题'：2026高考改革，刷题党正在被淘汰"
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
      
      if (response.data.length === 0) {
        console.log(`⚠️  未找到: ${title}`);
        continue;
      }
      
      const articleId = response.data[0].id;
      
      // 删除文章
      await axios({
        method: 'DELETE',
        url: `${SUPABASE_URL}/rest/v1/articles?id=eq.${articleId}`,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      console.log(`✅ 已删除: ${title}`);
    } catch (error) {
      console.error(`❌ 删除失败: ${title}`);
      console.error(`   错误: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('\n========================================');
  console.log('🎉 删除完成');
  console.log('========================================');
}

deleteArticles();