const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5c21ld2ViYWZtb2FhdHNxeHRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgxNDUxOSwiZXhwIjoyMDg5MzkwNTE5fQ.L-FcotGMspmczzNGZaXCwXfjipj-TlePDeylj2exxjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  console.log('Starting multi-platform migration...\n');

  // 1. 创建 platforms 表
  console.log('1. Creating platforms table...');
  const { error: error1 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS platforms (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        is_configured BOOLEAN DEFAULT FALSE,
        priority INTEGER DEFAULT 0,
        capabilities JSONB NOT NULL DEFAULT '{}',
        constraints JSONB NOT NULL DEFAULT '{}',
        api_config JSONB DEFAULT '{}',
        publish_config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
  });
  
  if (error1) {
    console.error('Error creating platforms table:', error1);
    // 尝试直接插入，表可能已存在
  } else {
    console.log('✓ platforms table created');
  }

  // 2. 创建 platform_contents 表
  console.log('2. Creating platform_contents table...');
  const { error: error2 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS platform_contents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        platform_id VARCHAR(50) NOT NULL REFERENCES platforms(id),
        title VARCHAR(500),
        body TEXT,
        formatted_body TEXT,
        tags TEXT[],
        media_assets JSONB DEFAULT '[]',
        extras JSONB DEFAULT '{}',
        transform_status VARCHAR(50) DEFAULT 'pending',
        transform_warnings TEXT[],
        transform_error TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(content_id, platform_id)
      )
    `
  });
  
  if (error2) {
    console.error('Error creating platform_contents table:', error2);
  } else {
    console.log('✓ platform_contents table created');
  }

  // 3. 创建 publish_records 表
  console.log('3. Creating publish_records table...');
  const { error: error3 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS publish_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_id INTEGER NOT NULL REFERENCES articles(id),
        platform_id VARCHAR(50) NOT NULL REFERENCES platforms(id),
        platform_content_id UUID REFERENCES platform_contents(id),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        platform_post_id VARCHAR(255),
        platform_post_url VARCHAR(500),
        publish_data JSONB DEFAULT '{}',
        response_data JSONB DEFAULT '{}',
        error_message TEXT,
        error_code VARCHAR(100),
        scheduled_at TIMESTAMP,
        published_at TIMESTAMP,
        stats JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
  });
  
  if (error3) {
    console.error('Error creating publish_records table:', error3);
  } else {
    console.log('✓ publish_records table created');
  }

  // 4. 初始化平台数据
  console.log('4. Initializing platform data...');
  const platforms = [
    {
      id: 'wechat_mp',
      name: '微信公众号',
      description: '长图文内容，HTML格式',
      is_active: true,
      is_configured: true,
      priority: 1,
      capabilities: {
        supports_images: true,
        supports_video: true,
        supports_audio: false,
        supports_markdown: false,
        supports_html: true,
        supports_emoji: true,
        supports_tags: false,
        supports_links: false,
        max_title_length: 64,
        max_content_length: null,
        max_image_count: null,
        max_video_length: null
      },
      constraints: {
        title_length: { min: 1, max: 64 },
        content_length: { min: 1, max: null },
        image_count: { min: 0, max: null },
        image_size: { width: null, height: null, max_size_mb: 10 },
        video_length: { min: 1, max: null },
        tag_count: { min: 0, max: 0 },
        tag_length: { min: 0, max: 0 },
        forbidden_words: []
      },
      publish_config: {
        auto_publish: false,
        review_required: true,
        publish_time: '09:30'
      }
    },
    {
      id: 'xiaohongshu',
      name: '小红书',
      description: '短图文内容，9图+文字，emoji风格',
      is_active: false,
      is_configured: false,
      priority: 2,
      capabilities: {
        supports_images: true,
        supports_video: true,
        supports_audio: false,
        supports_markdown: false,
        supports_html: false,
        supports_emoji: true,
        supports_tags: true,
        supports_links: false,
        max_title_length: 20,
        max_content_length: 1000,
        max_image_count: 9,
        max_video_length: 900
      },
      constraints: {
        title_length: { min: 1, max: 20 },
        content_length: { min: 1, max: 1000 },
        image_count: { min: 1, max: 9 },
        image_size: { width: 1080, height: 1440, max_size_mb: 20 },
        video_length: { min: 1, max: 900 },
        tag_count: { min: 0, max: 10 },
        tag_length: { min: 1, max: 20 },
        forbidden_words: ['微信', '公众号', '二维码', '加我', '私聊', '私信']
      },
      publish_config: {
        default_tags: ['生活记录', '分享'],
        auto_publish: false,
        review_required: true
      }
    },
    {
      id: 'douyin',
      name: '抖音',
      description: '短视频脚本，口播文案',
      is_active: false,
      is_configured: false,
      priority: 3,
      capabilities: {
        supports_images: true,
        supports_video: true,
        supports_audio: true,
        supports_markdown: false,
        supports_html: false,
        supports_emoji: true,
        supports_tags: true,
        supports_links: false,
        max_title_length: 55,
        max_content_length: 500,
        max_image_count: 35,
        max_video_length: 900
      },
      constraints: {
        title_length: { min: 1, max: 55 },
        content_length: { min: 1, max: 500 },
        image_count: { min: 1, max: 35 },
        image_size: { width: 1080, height: 1920, max_size_mb: 50 },
        video_length: { min: 1, max: 900 },
        tag_count: { min: 0, max: 5 },
        tag_length: { min: 1, max: 20 },
        forbidden_words: ['微信', '公众号', '二维码', '加我', '私聊', '私信', '赚钱', '暴富']
      },
      publish_config: {
        default_tags: ['干货分享', '知识分享'],
        auto_publish: false,
        review_required: true
      }
    },
    {
      id: 'bilibili',
      name: '哔哩哔哩',
      description: '中长视频脚本，知识分享',
      is_active: false,
      is_configured: false,
      priority: 4,
      capabilities: {
        supports_images: true,
        supports_video: true,
        supports_audio: false,
        supports_markdown: false,
        supports_html: false,
        supports_emoji: true,
        supports_tags: true,
        supports_links: true,
        max_title_length: 80,
        max_content_length: 2000,
        max_image_count: null,
        max_video_length: null
      },
      constraints: {
        title_length: { min: 1, max: 80 },
        content_length: { min: 1, max: 2000 },
        image_count: { min: 0, max: null },
        image_size: { width: 1920, height: 1080, max_size_mb: 20 },
        video_length: { min: 1, max: null },
        tag_count: { min: 1, max: 10 },
        tag_length: { min: 1, max: 20 },
        forbidden_words: ['微信', '公众号', '二维码', '加我']
      },
      publish_config: {
        default_tags: ['知识', '科技', '学习'],
        auto_publish: false,
        review_required: true
      }
    },
    {
      id: 'zhihu',
      name: '知乎',
      description: '问答/文章，专业深度',
      is_active: false,
      is_configured: false,
      priority: 5,
      capabilities: {
        supports_images: true,
        supports_video: true,
        supports_audio: false,
        supports_markdown: true,
        supports_html: false,
        supports_emoji: true,
        supports_tags: true,
        supports_links: true,
        max_title_length: null,
        max_content_length: null,
        max_image_count: null,
        max_video_length: null
      },
      constraints: {
        title_length: { min: 0, max: null },
        content_length: { min: 1, max: null },
        image_count: { min: 0, max: null },
        video_length: { min: 1, max: null },
        tag_count: { min: 0, max: 5 },
        tag_length: { min: 1, max: 20 },
        forbidden_words: ['微信', '公众号', '加我', '私聊']
      },
      publish_config: {
        default_tags: ['科技', '知识'],
        auto_publish: false,
        review_required: true
      }
    }
  ];

  for (const platform of platforms) {
    const { error } = await supabase
      .from('platforms')
      .upsert(platform, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error inserting platform ${platform.id}:`, error);
    } else {
      console.log(`✓ Platform ${platform.id} initialized`);
    }
  }

  // 5. 为现有文章创建公众号平台内容记录
  console.log('5. Migrating existing articles to platform_contents...');
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, title, content, summary, type, created_at, updated_at');

  if (articlesError) {
    console.error('Error fetching articles:', articlesError);
  } else if (articles) {
    for (const article of articles) {
      const { error: pcError } = await supabase
        .from('platform_contents')
        .upsert({
          content_id: article.id,
          platform_id: 'wechat_mp',
          title: article.title,
          body: article.summary,
          formatted_body: article.content,
          tags: [article.type],
          transform_status: 'success',
          created_at: article.created_at,
          updated_at: article.updated_at
        }, { onConflict: 'content_id,platform_id' });
      
      if (pcError) {
        console.error(`Error creating platform_content for article ${article.id}:`, pcError);
      }
    }
    console.log(`✓ Migrated ${articles.length} articles to platform_contents`);
  }

  console.log('\n✅ Migration completed!');
}

runMigration().catch(console.error);
