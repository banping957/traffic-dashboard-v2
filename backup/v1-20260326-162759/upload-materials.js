const axios = require('axios');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

const materials = [
  {
    name: "文章发布 SOP",
    type: "sop",
    icon: "📋",
    content: "每日文章生成后自动上传到数据库并发布到网页的完整流程",
    file: "/root/.openclaw/workspace/sop/article-publishing-sop.md",
    tags: ["SOP", "发布", "数据库"]
  },
  {
    name: "文章发布 Skill",
    type: "skill",
    icon: "🔧",
    content: "自动将生成的公众号文章上传到Supabase数据库的Skill",
    file: "/root/.openclaw/workspace/skills/article-publisher/SKILL.md",
    tags: ["Skill", "自动化", "Supabase"]
  },
  {
    name: "图片获取优先级规则",
    type: "rule",
    icon: "🖼️",
    content: "2-1-3规则：1.原文图片 2.新闻/教育站 3.备选方案",
    file: "MEMORY.md",
    tags: ["图片", "规则", "优先级"]
  },
  {
    name: "爆款标题公式",
    type: "template",
    icon: "✨",
    content: "身份+争议、悬念式、反常识三种标题公式",
    file: "MEMORY.md",
    tags: ["标题", "公式", "爆款"]
  },
  {
    name: "公众号文章格式规范",
    type: "standard",
    icon: "📐",
    content: "导语区、小节标题、配图位置、样式规范",
    file: "MEMORY.md",
    tags: ["格式", "规范", "公众号"]
  },
  {
    name: "流量提升计划",
    type: "project",
    icon: "🚀",
    content: "2026年3月启动的公众号流量提升项目",
    file: "MEMORY.md",
    tags: ["项目", "流量", "公众号"]
  },
  {
    name: "数据库表结构",
    type: "reference",
    icon: "🗄️",
    content: "Supabase articles 表结构定义",
    file: "/root/.openclaw/workspace/skills/article-publisher/references/database-schema.md",
    tags: ["数据库", "表结构", "Supabase"]
  },
  {
    name: "文章格式检查清单",
    type: "checklist",
    icon: "✅",
    content: "交付前必须完成的8项检查",
    file: "MEMORY.md",
    tags: ["检查清单", "交付", "质量"]
  },
  {
    name: "关键错误教训",
    type: "lesson",
    icon: "⚠️",
    content: "CSS class未转inline style、图片URL失效等教训",
    file: "MEMORY.md",
    tags: ["教训", "错误", "改进"]
  },
  {
    name: "用户偏好",
    type: "preference",
    icon: "👤",
    content: "字数900-1200、配图3张、标题要吸睛",
    file: "MEMORY.md",
    tags: ["偏好", "用户", "规范"]
  }
];

async function uploadMaterials() {
  console.log('开始上传素材...\n');
  
  for (const material of materials) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${SUPABASE_URL}/rest/v1/materials`,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        data: material
      });
      
      console.log(`✅ 已上传: ${material.name}`);
    } catch (error) {
      console.error(`❌ 上传失败 ${material.name}:`, error.response?.data?.message || error.message);
    }
  }
  
  console.log('\n🎉 素材上传完成！');
}

uploadMaterials();