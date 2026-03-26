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

const articlesDir = '/root/.openclaw/workspace/articles';

// ==========================================
// 每天修改这里的文章配置即可
// ==========================================
const articles = [
  {
    title: "2026泰晤士世界大学排名发布：牛津十连冠，中国7校进前100",
    type: "analysis",        // story:人物故事, analysis:专业解读
    typelabel: "专业解读",    // 人物故事 / 专业解读
    date: "2026-03-26",      // 发布日期
    timeslot: "上午",        // 上午 / 下午
    summary: "牛津大学连续10年蝉联全球第一，中国内地7所高校进入全球前100，清华大学稳居亚洲榜首。全球高等教育格局正在悄然转移。",
    wordcount: 1100,         // 字数
    file: "2026-03-26-am-times-ranking.html"  // 文件名
  },
  {
    title: "从'解题'到'解决问题'：2026高考改革，刷题党正在被淘汰",
    type: "story",
    typelabel: "人物故事",
    date: "2026-03-26",
    timeslot: "下午",
    summary: "2026年教育部1号文件发布，高考命题从'解题'转向'解决问题'。林浩的故事告诉你，为什么刷题时代正在终结。",
    wordcount: 1150,
    file: "2026-03-26-pm-gaokao-reform.html"
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