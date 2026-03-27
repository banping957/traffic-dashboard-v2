import psycopg2
import json

# Supabase connection details
DB_HOST = "db.vysmewebafmoaatsqxtc.supabase.co"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "YOUR_DB_PASSWORD"  # 需要数据库密码
DB_PORT = "5432"

# SQL statements
SQL_STATEMENTS = """
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
"""

def run_migration():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        cursor = conn.cursor()
        
        print("Running migration...")
        cursor.execute(SQL_STATEMENTS)
        conn.commit()
        
        print("Migration completed successfully!")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_migration()
