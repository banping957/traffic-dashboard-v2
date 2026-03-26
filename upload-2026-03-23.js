const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

const articlesDir = '/root/.openclaw/workspace/articles';

const articles = [
  {
    title: "2026年人才缺口50万，这3个专业毕业生被企业疯抢",
    type: "analysis",
    typelabel: "专业解读",
    date: "2026-03-23",
    timeslot: "上午",
    summary: "氢能产业人才缺口超50万，3个王牌专业薪资翻倍",
    wordcount: 1180,
    file: "2026-03-23-hydrogen-talent.html"
  },
  {
    title: "硕士毕业月薪6千vs3万：2026年读研选错专业等于白读",
    type: "analysis",
    typelabel: "专业解读",
    date: "2026-03-23",
    timeslot: "下午",
    summary: "硕士就业分化严重，工科年薪20-35万vs文科月薪6-9k",
    wordcount: 1150,
    file: "2026-03-23-master-salary-gap.html"
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