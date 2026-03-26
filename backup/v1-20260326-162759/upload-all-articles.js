const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

const articlesDir = '/root/.openclaw/workspace/articles';

const articles = [
  {
    title: "我和闺蜜同分不同命：她去了武大，我去了华科",
    type: "story",
    typelabel: "人物故事",
    date: "2026-03-19",
    timeslot: "上午",
    summary: "同分不同命的真实故事，武大vs华科就业数据对比",
    wordcount: 1150,
    file: "2026-03-19-am-wuda-vs-huake.html"
  },
  {
    title: "2026年就业率最高的5个专业，第1个岗位需求暴涨215%",
    type: "analysis",
    typelabel: "专业解读",
    date: "2026-03-19",
    timeslot: "下午",
    summary: "AI时代新工科风口，具身智能年薪33万+",
    wordcount: 1180,
    file: "2026-03-19-pm-top5-majors.html"
  },
  {
    title: "杜伦超越牛剑！2026英国大学排名32年来最大变局",
    type: "analysis",
    typelabel: "专业解读",
    date: "2026-03-16",
    timeslot: "上午",
    summary: "TIMES 2026排名解读，杜伦首次进前三",
    wordcount: 1100,
    file: "2026-03-16-durham-ranking.html"
  },
  {
    title: "2026中国大学排名出炉：北航第9、南开进前7，最大黑马是它",
    type: "analysis",
    typelabel: "专业解读",
    date: "2026-03-16",
    timeslot: "下午",
    summary: "ABC 2026排名，福耀科大首次入榜即进50强",
    wordcount: 1050,
    file: "2026-03-16-china-ranking.html"
  },
  {
    title: "我研究了3000份招聘JD，发现这5个专业正在被AI\"活埋\"",
    type: "analysis",
    typelabel: "专业解读",
    date: "2026-03-18",
    timeslot: "上午",
    summary: "2026年就业预警，这些专业需谨慎选择",
    wordcount: 1180,
    file: "2026-03-18-am-5-worst-majors-fixed.html"
  },
  {
    title: "采访了100个年薪50万+的985生，他们大学都偷偷做了一件事",
    type: "story",
    typelabel: "人物故事",
    date: "2026-03-18",
    timeslot: "下午",
    summary: "高薪毕业生的共同特征调研",
    wordcount: 1150,
    file: "2026-03-18-pm-985-graduates-research.html"
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