const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

const articlesDir = '/root/.openclaw/workspace/articles';

const article = {
  title: "我研究了3000份招聘JD，发现这5个专业正在被AI\"活埋\"",
  type: "analysis",
  typelabel: "专业解读",
  date: "2026-03-20",
  timeslot: "上午",
  summary: "2026年就业预警，揭秘5个正在被AI取代的天坑专业",
  wordcount: 1180,
  file: "2026-03-20-am-5-worst-majors.html"
};

async function uploadArticle() {
  console.log('开始上传文章...\n');
  
  try {
    const filePath = path.join(articlesDir, article.file);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ 文件不存在: ${article.file}`);
      return;
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
    console.error(`❌ 上传失败:`, error.response?.data?.message || error.message);
  }
  
  console.log('\n🎉 完成！');
}

uploadArticle();