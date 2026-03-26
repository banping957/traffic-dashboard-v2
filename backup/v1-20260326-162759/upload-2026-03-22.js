const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

const articlesDir = '/root/.openclaw/workspace/articles';

const articles = [
  {
    title: "U.S.News 2026出炉：芝大杀回前6，宾大跻进前7，最大黑马却是它",
    type: "analysis",
    typelabel: "专业解读",
    date: "2026-03-22",
    timeslot: "上午",
    summary: "芝大跃升至第6，宾大跻进前7，东北大学成最大黑马",
    wordcount: 1150,
    file: "2026-03-22-usnews-ranking.html"
  },
  {
    title: "我拿着660分去了南大，室友658分去了东南，四年后谁更稳",
    type: "story",
    typelabel: "人物故事",
    date: "2026-03-22",
    timeslot: "下午",
    summary: "南京双雄对比，南大文理vs东南工科的真实故事",
    wordcount: 1180,
    file: "2026-03-22-nanjing-duo.html"
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