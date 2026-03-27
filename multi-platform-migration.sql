-- OpenClaw 多平台扩展 - 数据库迁移脚本
-- 执行此脚本以支持多平台内容发布功能

-- ============================================
-- 1. 新增平台配置表
-- ============================================
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_platforms_active ON platforms(is_active);
CREATE INDEX IF NOT EXISTS idx_platforms_priority ON platforms(priority);

-- ============================================
-- 2. 新增平台内容表（存储转换后的各平台内容）
-- ============================================
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_platform_contents_content_id ON platform_contents(content_id);
CREATE INDEX IF NOT EXISTS idx_platform_contents_platform_id ON platform_contents(platform_id);
CREATE INDEX IF NOT EXISTS idx_platform_contents_status ON platform_contents(transform_status);

-- ============================================
-- 3. 新增发布记录表
-- ============================================
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_publish_records_content_id ON publish_records(content_id);
CREATE INDEX IF NOT EXISTS idx_publish_records_platform_id ON publish_records(platform_id);
CREATE INDEX IF NOT EXISTS idx_publish_records_status ON publish_records(status);
CREATE INDEX IF NOT EXISTS idx_publish_records_published_at ON publish_records(published_at);

-- ============================================
-- 4. 初始化平台配置数据
-- ============================================
INSERT INTO platforms (id, name, description, is_active, is_configured, priority, capabilities, constraints, publish_config) VALUES
-- 公众号（已配置）
(
  'wechat_mp',
  '微信公众号',
  '长图文内容，HTML格式',
  TRUE,
  TRUE,
  1,
  '{"supports_images": true, "supports_video": true, "supports_audio": false, "supports_markdown": false, "supports_html": true, "supports_emoji": true, "supports_tags": false, "supports_links": false, "max_title_length": 64, "max_content_length": null, "max_image_count": null, "max_video_length": null}',
  '{"title_length": {"min": 1, "max": 64}, "content_length": {"min": 1, "max": null}, "image_count": {"min": 0, "max": null}, "image_size": {"width": null, "height": null, "max_size_mb": 10}, "video_length": {"min": 1, "max": null}, "tag_count": {"min": 0, "max": 0}, "tag_length": {"min": 0, "max": 0}, "forbidden_words": []}',
  '{"auto_publish": false, "review_required": true, "publish_time": "09:30"}'
),
-- 小红书（待配置）
(
  'xiaohongshu',
  '小红书',
  '短图文内容，9图+文字，emoji风格',
  FALSE,
  FALSE,
  2,
  '{"supports_images": true, "supports_video": true, "supports_audio": false, "supports_markdown": false, "supports_html": false, "supports_emoji": true, "supports_tags": true, "supports_links": false, "max_title_length": 20, "max_content_length": 1000, "max_image_count": 9, "max_video_length": 900}',
  '{"title_length": {"min": 1, "max": 20}, "content_length": {"min": 1, "max": 1000}, "image_count": {"min": 1, "max": 9}, "image_size": {"width": 1080, "height": 1440, "max_size_mb": 20}, "video_length": {"min": 1, "max": 900}, "tag_count": {"min": 0, "max": 10}, "tag_length": {"min": 1, "max": 20}, "forbidden_words": ["微信", "公众号", "二维码", "加我", "私聊", "私信"]}',
  '{"default_tags": ["生活记录", "分享"], "auto_publish": false, "review_required": true}'
),
-- 抖音（待配置）
(
  'douyin',
  '抖音',
  '短视频脚本，口播文案',
  FALSE,
  FALSE,
  3,
  '{"supports_images": true, "supports_video": true, "supports_audio": true, "supports_markdown": false, "supports_html": false, "supports_emoji": true, "supports_tags": true, "supports_links": false, "max_title_length": 55, "max_content_length": 500, "max_image_count": 35, "max_video_length": 900}',
  '{"title_length": {"min": 1, "max": 55}, "content_length": {"min": 1, "max": 500}, "image_count": {"min": 1, "max": 35}, "image_size": {"width": 1080, "height": 1920, "max_size_mb": 50}, "video_length": {"min": 1, "max": 900}, "tag_count": {"min": 0, "max": 5}, "tag_length": {"min": 1, "max": 20}, "forbidden_words": ["微信", "公众号", "二维码", "加我", "私聊", "私信", "赚钱", "暴富"]}',
  '{"default_tags": ["干货分享", "知识分享"], "auto_publish": false, "review_required": true}'
),
-- B站（待配置）
(
  'bilibili',
  '哔哩哔哩',
  '中长视频脚本，知识分享',
  FALSE,
  FALSE,
  4,
  '{"supports_images": true, "supports_video": true, "supports_audio": false, "supports_markdown": false, "supports_html": false, "supports_emoji": true, "supports_tags": true, "supports_links": true, "max_title_length": 80, "max_content_length": 2000, "max_image_count": null, "max_video_length": null}',
  '{"title_length": {"min": 1, "max": 80}, "content_length": {"min": 1, "max": 2000}, "image_count": {"min": 0, "max": null}, "image_size": {"width": 1920, "height": 1080, "max_size_mb": 20}, "video_length": {"min": 1, "max": null}, "tag_count": {"min": 1, "max": 10}, "tag_length": {"min": 1, "max": 20}, "forbidden_words": ["微信", "公众号", "二维码", "加我"]}',
  '{"default_tags": ["知识", "科技", "学习"], "auto_publish": false, "review_required": true}'
),
-- 知乎（待配置）
(
  'zhihu',
  '知乎',
  '问答/文章，专业深度',
  FALSE,
  FALSE,
  5,
  '{"supports_images": true, "supports_video": true, "supports_audio": false, "supports_markdown": true, "supports_html": false, "supports_emoji": true, "supports_tags": true, "supports_links": true, "max_title_length": null, "max_content_length": null, "max_image_count": null, "max_video_length": null}',
  '{"title_length": {"min": 0, "max": null}, "content_length": {"min": 1, "max": null}, "image_count": {"min": 0, "max": null}, "video_length": {"min": 1, "max": null}, "tag_count": {"min": 0, "max": 5}, "tag_length": {"min": 1, "max": 20}, "forbidden_words": ["微信", "公众号", "加我", "私聊"]}',
  '{"default_tags": ["科技", "知识"], "auto_publish": false, "review_required": true}'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. 为现有文章创建公众号平台内容记录
-- ============================================
INSERT INTO platform_contents (content_id, platform_id, title, body, formatted_body, tags, transform_status, created_at, updated_at)
SELECT 
  a.id,
  'wechat_mp',
  a.title,
  a.summary,
  a.content,
  ARRAY[a.type],
  'success',
  a.created_at,
  a.updated_at
FROM articles a
LEFT JOIN platform_contents pc ON a.id = pc.content_id AND pc.platform_id = 'wechat_mp'
WHERE pc.id IS NULL;

-- 完成
SELECT '多平台扩展数据库迁移完成！' AS message;
