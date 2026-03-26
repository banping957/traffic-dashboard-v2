const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

const articlesDir = '/root/.openclaw/workspace/articles';

const article = {
  title: "我跟踪了50个家庭3年，发现高考填志愿踩坑的都有这3个共性",
  type: "story",
  typelabel: "人物故事",
  date: "2026-03-20",
  timeslot: "上午",
  summary: "真实跟踪调研：50个家庭3年志愿填报踩坑案例分析",
  wordcount: 1180,
  file: "2026-03-20-am-50-families-study.html"
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