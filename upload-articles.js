#!/usr/bin/env node
/**
 * 通用文章上传脚本
 * 使用方法: node upload-articles.js
 * 
 * 每天只需要修改下方的 articles 数组配置即可
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

const articlesDir = '/root/.openclaw/workspace/ui/traffic-dashboard/articles';

// ==========================================
// 每天修改这里的文章配置即可
// ==========================================
const articles = [
  {
    title: "QS 2026世界大学排名出炉：MIT连续14年霸榜，斯坦福反超进前三",
    type: "analysis",
    typelabel: "专业解读",
    date: "2026-03-27",
    timeslot: "上午",
    summary: "2026年QS世界大学排名正式发布。MIT连续第14年蝉联全球第一，创历史最长连冠纪录。斯坦福从第6跃升至第3，成为Top10中最大黑马。中国高校持续崛起，5所港校进入全球前100。",
    wordcount: 1150,
    file: "2026-03-27-am-qs-ranking.html"
  },
  {
    title: "从专科到研究生：一个退伍兵的四级跳逆袭之路",
    type: "story",
    typelabel: "人物故事",
    date: "2026-03-27",
    timeslot: "下午",
    summary: "2016年，他是一名专科生；2018年，他穿上军装；2020年，他退伍复学；2022年，他专升本成功；2024年，他考取研究生。8年时间，从专科到硕士，他用四级跳完成了人生的逆袭。",
    wordcount: 1100,
    file: "2026-03-27-pm-veteran-story.html"
  }
];
// ==========================================

async function uploadArticles() {
  console.log('========================================');
  console.log('🚀 开始上传文章到 Supabase 数据库');
  console.log('========================================\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const article of articles) {
    try {
      const filePath = path.join(articlesDir, article.file);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  文件不存在: ${article.file}`);
        failCount++;
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
      console.log(`   类型: ${article.typelabel} | 时段: ${article.timeslot} | 字数: ${article.wordcount}`);
      successCount++;
    } catch (error) {
      console.error(`❌ 上传失败: ${article.title}`);
      console.error(`   错误: ${error.response?.data?.message || error.message}`);
      failCount++;
    }
  }
  
  console.log('\n========================================');
  console.log(`🎉 上传完成！成功: ${successCount} 篇, 失败: ${failCount} 篇`);
  console.log('========================================');
  console.log('\n管理后台: https://www.zengxiaoni.xyz');
}

// 执行上传
uploadArticles();