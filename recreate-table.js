const axios = require('axios');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

async function recreateTable() {
  try {
    // 1. 删除旧表
    console.log('1. 删除旧表...');
    await axios({
      method: 'POST',
      url: `${SUPABASE_URL}/rest/v1/rpc/drop_table`,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      data: { table_name: 'articles' }
    }).catch(() => {
      console.log('   旧表不存在或无法删除，继续创建新表');
    });
    
    // 2. 创建新表 - 使用 Supabase 的 REST API 创建表
    console.log('2. 创建新表...');
    
    // 先尝试直接创建（如果表不存在）
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        type VARCHAR(50) NOT NULL,
        typelabel VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        timeslot VARCHAR(10),
        status VARCHAR(20) DEFAULT 'draft',
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        wordcount INTEGER DEFAULT 0,
        summary TEXT,
        file VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await axios({
      method: 'POST',
      url: `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      data: { sql: createTableSQL }
    });
    
    console.log('✅ 新表创建成功！');
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
    console.log('\n请手动在 SQL Editor 执行:');
    console.log(`
DROP TABLE IF EXISTS articles;

CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  type VARCHAR(50) NOT NULL,
  typelabel VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  timeslot VARCHAR(10),
  status VARCHAR(20) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  wordcount INTEGER DEFAULT 0,
  summary TEXT,
  file VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);
  }
}

recreateTable();