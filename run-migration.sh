#!/bin/bash
# 多平台数据库迁移脚本

SUPABASE_URL="https://vysmewebafmoaatsqxtc.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5c21ld2ViYWZtb2FhdHNxeHRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgxNDUxOSwiZXhwIjoyMDg5MzkwNTE5fQ.L-FcotGMspmczzNGZaXCwXfjipj-TlePDeylj2exxjU"

# 1. 创建 platforms 表
echo "Creating platforms table..."
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS platforms (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100) NOT NULL, description TEXT, icon_url VARCHAR(500), is_active BOOLEAN DEFAULT TRUE, is_configured BOOLEAN DEFAULT FALSE, priority INTEGER DEFAULT 0, capabilities JSONB NOT NULL DEFAULT '"'"'{}'"'"', constraints JSONB NOT NULL DEFAULT '"'"'{}'"'"', api_config JSONB DEFAULT '"'"'{}'"'"', publish_config JSONB DEFAULT '"'"'{}'"'"', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())"
  }'

echo ""
echo "Migration completed!"
