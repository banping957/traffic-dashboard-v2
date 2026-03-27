-- OpenClaw Multi-Platform Migration Script
-- Run this in Supabase SQL Editor

-- Step 1: Create platforms table
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
);

CREATE INDEX IF NOT EXISTS idx_platforms_active ON platforms(is_active);
CREATE INDEX IF NOT EXISTS idx_platforms_priority ON platforms(priority);

-- Step 2: Create platform_contents table
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
);

CREATE INDEX IF NOT EXISTS idx_pc_content_id ON platform_contents(content_id);
CREATE INDEX IF NOT EXISTS idx_pc_platform_id ON platform_contents(platform_id);
CREATE INDEX IF NOT EXISTS idx_pc_status ON platform_contents(transform_status);

-- Step 3: Create publish_records table
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
);

CREATE INDEX IF NOT EXISTS idx_pr_content_id ON publish_records(content_id);
CREATE INDEX IF NOT EXISTS idx_pr_platform_id ON publish_records(platform_id);
CREATE INDEX IF NOT EXISTS idx_pr_status ON publish_records(status);

-- Step 4: Insert platform configs
INSERT INTO platforms (id, name, description, is_active, is_configured, priority, capabilities, constraints, publish_config) 
VALUES 
('wechat_mp', '微信公众号', '长图文内容，HTML格式', TRUE, TRUE, 1, '{"supports_images": true, "supports_video": true, "supports_html": true, "supports_emoji": true, "max_title_length": 64}', '{"title_length": {"min": 1, "max": 64}}', '{"auto_publish": false}'),
('xiaohongshu', '小红书', '短图文内容，9图+文字', FALSE, FALSE, 2, '{"supports_images": true, "supports_video": true, "supports_emoji": true, "max_title_length": 20, "max_content_length": 1000, "max_image_count": 9}', '{"title_length": {"min": 1, "max": 20}}', '{"auto_publish": false}'),
('douyin', '抖音', '短视频脚本，口播文案', FALSE, FALSE, 3, '{"supports_video": true, "supports_audio": true, "max_title_length": 55, "max_content_length": 500}', '{"title_length": {"min": 1, "max": 55}}', '{"auto_publish": false}'),
('bilibili', '哔哩哔哩', '中长视频脚本，知识分享', FALSE, FALSE, 4, '{"supports_video": true, "supports_tags": true, "max_title_length": 80}', '{"title_length": {"min": 1, "max": 80}}', '{"auto_publish": false}'),
('zhihu', '知乎', '问答/文章，专业深度', FALSE, FALSE, 5, '{"supports_markdown": true, "supports_tags": true}', '{}', '{"auto_publish": false}')
ON CONFLICT (id) DO NOTHING;

-- Step 5: Migrate existing articles
INSERT INTO platform_contents (content_id, platform_id, title, body, formatted_body, tags, transform_status, created_at)
SELECT a.id, 'wechat_mp', a.title, a.summary, a.content, ARRAY[a.type], 'success', a.created_at
FROM articles a
LEFT JOIN platform_contents pc ON a.id = pc.content_id AND pc.platform_id = 'wechat_mp'
WHERE pc.id IS NULL;

-- Done
SELECT 'Migration completed successfully!' AS result;
