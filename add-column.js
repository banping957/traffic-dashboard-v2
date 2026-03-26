const axios = require('axios');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

async function addContentColumn() {
  try {
    // 使用 Supabase SQL API 执行 ALTER TABLE
    const response = await axios({
      method: 'POST',
      url: `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        sql: 'ALTER TABLE articles ADD COLUMN IF NOT EXISTS content TEXT;'
      }
    });
    
    console.log('✅ 字段添加成功');
  } catch (error) {
    console.error('❌ 失败:', error.response?.data || error.message);
    console.log('\n请手动在 SQL Editor 执行:');
    console.log('ALTER TABLE articles ADD COLUMN IF NOT EXISTS content TEXT;');
  }
}

addContentColumn();