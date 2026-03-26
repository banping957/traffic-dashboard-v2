# 流量提升计划 - 内容管理后台

## 项目说明

纯前端可交互的内容管理系统，用于展示和管理：
- 已发布的文章
- 积累的素材
- 待办任务
- 流量提升计划进度

## 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **数据存储**: JSON文件 + LocalStorage（本地持久化）
- **部署**: 静态托管（Vercel/Netlify/Cloudflare Pages）

## 本地开发

```bash
# 进入项目目录
cd traffic-dashboard

# 启动本地服务器
npx serve .

# 或使用 Python
python3 -m http.server 8080
```

## 部署到 Vercel（推荐）

### 方式1：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 方式2：通过 GitHub + Vercel

1. 将代码推送到 GitHub 仓库
2. 登录 [vercel.com](https://vercel.com)
3. 点击 "Add New Project"
4. 选择你的 GitHub 仓库
5. 点击 "Deploy"

## 绑定域名 zengxiaoni.xyz

### Vercel 绑定域名步骤

1. 部署成功后，进入 Vercel Dashboard
2. 选择你的项目
3. 点击 "Settings" → "Domains"
4. 输入 `zengxiaoni.xyz`，点击 "Add"
5. 根据提示添加 DNS 记录：
   - 类型: A 记录
   - 名称: @
   - 值: 76.76.21.21（Vercel 的 IP）
   
   或 CNAME 记录：
   - 类型: CNAME
   - 名称: www
   - 值: cname.vercel-dns.com

6. 等待 DNS 生效（通常几分钟到几小时）

## 项目结构

```
traffic-dashboard/
├── index.html      # 主页面
├── app.js          # 交互逻辑
├── data.json       # 初始数据
├── package.json    # 项目配置
└── README.md       # 说明文档
```

## 功能特性

- ✅ 数据概览（文章数、阅读量、完成率、素材数）
- ✅ 文章管理（增删改查、筛选、发布）
- ✅ 素材库（分类展示）
- ✅ 发布日历（可视化展示）
- ✅ 待办事项（可交互勾选）
- ✅ 响应式设计（支持移动端）
- ✅ 数据本地持久化（LocalStorage）

## 后续升级

如需更复杂功能（用户登录、多人协作、实时数据），可：
1. 添加后端 API（Node.js/Python）
2. 使用数据库存储数据
3. 保留现有前端代码，只需替换数据获取逻辑

## 联系方式

域名: zengxiaoni.xyz