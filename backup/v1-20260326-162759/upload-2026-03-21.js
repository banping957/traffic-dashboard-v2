const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

const articlesDir = '/root/.openclaw/workspace/articles';

const articles = [
  {
    title: "我拿着640分去了中大，室友638分去了华工，四年后谁混得更好",
    type: "story",
    typelabel: "人物故事",
    date: "2026-03-21",
    timeslot: "上午",
    summary: "广州双雄对比：中山大学vs华南理工大学，640分vs638分的真实就业差距",
    wordcount: 1100,
    file: "2026-03-21-zhongda-huagong.html"
  },
  {
    title: "2026中国大学排名出炉：福耀科大杀进前50，西湖大学与C9并驾齐驱",
    type: "analysis",
    typelabel: "专业解读",
    date: "2026-03-21",
    timeslot: "下午",
    summary: "2026校友会排名解读：福耀科大首次参评进45名，西湖大学第12，新型大学集体爆发",
    wordcount: 1200,
    file: "2026-03-21-university-ranking.html"
  }
];

async function uploadArticles() {
  console.log('开始上传文章...\n');
  
  for (const article of articles) {
    try {
      const filePath = path.join(articlesDir, article.file);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ 文件不存在: ${article.file}`);
        continue;
      }
      
      // 读取 HTML 内容
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 上传到数据库
      const response = await axios({
        method: 'POST',
        url: `${SUPABASE_URL}/rest/v1/articles`,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        data: {
          ...article,
          content: content,
          status: 'draft',
          views: 0,
          likes: 0,
          comments: 0
        }
      });
      
      console.log(`✅ 已上传: ${article.title}`);
    } catch (error) {
      console.error(`❌ 上传失败 ${article.title}:`, error.response?.data?.message || error.message);
    }
  }
  
  console.log('\n🎉 上传完成！');
}

uploadArticles();