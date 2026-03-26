#!/bin/bash

# Vercel 部署脚本
# 请设置环境变量 VERCEL_TOKEN

PROJECT_NAME="traffic-dashboard"

echo "🚀 开始部署到 Vercel..."

# 检查 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查 Token
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ 请设置 VERCEL_TOKEN 环境变量"
    exit 1
fi

# 部署
echo "📤 上传文件..."
vercel --token "$VERCEL_TOKEN" --yes --prod

echo "✅ 部署完成！"