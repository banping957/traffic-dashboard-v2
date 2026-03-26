const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

const articlesDir = '/root/.openclaw/workspace/articles';

const articles = [
  {
    title: "高考同分，闺蜜去武大我去华科，四年后工资条让我沉默了",
    type: "story",
    typelabel: "人物故事",
    date: "2026-03-20",
    timeslot: "上午",
    summary: "同分645的真实故事，武大vs华科就业数据对比",
    wordcount: 1150,
    file: "2026-03-20-am-wuda-huake-story.html"
  },
  {
    title: "2026泰晤士排名出炉：5所中国高校冲进全球40强，哈工大飙升21位",
    type: "analysis",
    typelabel: "专业解读",
    date: "2026-03-20",
    timeslot: "下午",
    summary: "THE 2026排名解读，5所高校进前40，哈工大飙升21位",
    wordcount: 1100,
    file: "2026-03-20-pm-the-ranking.html"
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