const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';
const articlesDir = '/root/.openclaw/workspace/ui/traffic-dashboard/articles';

async function exportArticles() {
  console.log('========================================');
  console.log('🚀 从 Supabase 导出文章到本地');
  console.log('========================================\n');

  try {
    // 获取所有文章
    const response = await axios({
      method: 'GET',
      url: `${SUPABASE_URL}/rest/v1/articles?select=title,date,timeslot,type,typelabel,wordcount,content`,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const articles = response.data;
    console.log(`数据库中共有 ${articles.length} 篇文章`);

    // 去重（按标题）
    const seen = new Set();
    const uniqueArticles = articles.filter(a => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    });

    console.log(`去重后: ${uniqueArticles.length} 篇\n`);
    console.log('开始导出 HTML 文件...');
    console.log('=' .repeat(60));

    let successCount = 0;
    let skipCount = 0;

    for (const article of uniqueArticles) {
      const date = article.date;
      const timeslot = article.timeslot === '上午' ? 'am' : 'pm';
      
      // 生成文件名
      const titleSlug = article.title
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 30);
      const filename = `${date}-${timeslot}-${titleSlug}.html`;
      const filepath = path.join(articlesDir, filename);

      // 检查文件是否已存在
      if (fs.existsSync(filepath)) {
        console.log(`⏭️  已存在: ${filename}`);
        skipCount++;
        continue;
      }

      const content = article.content || '';
      if (content.length > 100) {
        fs.writeFileSync(filepath, content, 'utf-8');
        console.log(`✅ 已导出: ${filename} (${content.length} 字符)`);
        successCount++;
      } else {
        console.log(`⚠️  跳过: ${filename} (内容太短)`);
      }
    }

    console.log('=' .repeat(60));
    console.log(`\n🎉 导出完成！`);
    console.log(`   新导出: ${successCount} 篇`);
    console.log(`   已存在: ${skipCount} 篇`);
    console.log(`   总计: ${uniqueArticles.length} 篇`);

  } catch (error) {
    console.error('❌ 导出失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
  }
}

exportArticles();