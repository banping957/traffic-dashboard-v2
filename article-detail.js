/**
 * 文章详情页脚本
 */

const ArticleDetailPage = {
    articleId: null,
    article: null,

    init() {
        // 获取文章ID
        const urlParams = new URLSearchParams(window.location.search);
        this.articleId = urlParams.get('id');

        if (!this.articleId) {
            ToastManager.error('文章ID不存在');
            setTimeout(() => {
                window.location.href = 'articles.html';
            }, 2000);
            return;
        }

        this.loadArticle();
        this.bindEvents();
    },

    bindEvents() {
        // 编辑按钮
        document.getElementById('editBtn')?.addEventListener('click', () => {
            ToastManager.info('编辑功能开发中...');
        });

        // 复制到公众号
        document.getElementById('copyBtn')?.addEventListener('click', () => {
            this.copyToWechat();
        });

        // 下载HTML
        document.getElementById('downloadBtn')?.addEventListener('click', () => {
            this.downloadHTML();
        });

        // 分享链接
        document.getElementById('shareBtn')?.addEventListener('click', () => {
            this.shareArticle();
        });

        // 删除文章
        document.getElementById('deleteBtn')?.addEventListener('click', () => {
            this.showDeleteModal();
        });

        // 预览标签切换
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchPreviewTab(tabName);
            });
        });

        // 删除弹窗
        document.getElementById('closeDeleteModal')?.addEventListener('click', () => {
            this.hideDeleteModal();
        });

        document.getElementById('cancelDelete')?.addEventListener('click', () => {
            this.hideDeleteModal();
        });

        document.getElementById('confirmDelete')?.addEventListener('click', () => {
            this.confirmDelete();
        });

        document.querySelector('#deleteModal .modal-overlay')?.addEventListener('click', () => {
            this.hideDeleteModal();
        });

        // 多平台发布
        document.getElementById('previewTransformBtn')?.addEventListener('click', () => {
            this.previewPlatformTransform();
        });

        document.getElementById('publishMultiBtn')?.addEventListener('click', () => {
            this.publishToPlatforms();
        });
    },

    async loadArticle() {
        try {
            // 使用 REST API 直接获取数据
            const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
            const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';
            
            const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${this.articleId}&select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data || data.length === 0) {
                ToastManager.error('文章不存在');
                setTimeout(() => {
                    window.location.href = 'articles.html';
                }, 2000);
                return;
            }

            this.article = data[0];
            this.renderArticle();

        } catch (error) {
            console.error('加载文章失败:', error);
            // 显示错误信息
            document.getElementById('articleContent').innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <p>加载文章失败: ${error.message || '未知错误'}</p>
                    <p style="font-size: 14px; color: #666;">请检查网络连接或刷新页面</p>
                </div>
            `;
        }
    },

    renderArticle() {
        if (!this.article) return;

        const article = this.article;

        // 更新页面标题
        document.title = `${article.title} - OpenClaw`;

        // 更新预览标题
        document.getElementById('previewTitle').textContent = article.title;

        // 更新文章信息
        const statusText = article.status === 'published' ? '已发布' : '草稿';
        const statusEl = document.getElementById('articleStatus');
        statusEl.textContent = statusText;
        statusEl.className = `info-value article-status ${article.status}`;

        const typeText = article.type === 'story' ? '人物故事' : '专业解读';
        document.getElementById('articleType').textContent = typeText;

        document.getElementById('articleDate').textContent = article.date || '--';
        document.getElementById('articleWords').textContent = `${article.word_count || 0} 字`;
        document.getElementById('articleCreated').textContent = this.formatDate(article.created_at);

        // 更新时间线
        document.getElementById('createdTime').textContent = this.formatDateTime(article.created_at);
        document.getElementById('updatedTime').textContent = this.formatDateTime(article.updated_at || article.created_at);

        // 加载平台列表
        this.loadPlatforms();

        // 更新预览内容
        const content = article.content || article.html || '<p>暂无内容</p>';
        document.getElementById('articleContent').innerHTML = content;
        document.getElementById('rawCode').textContent = this.escapeHtml(content);
    },

    switchPreviewTab(tabName) {
        // 更新标签状态
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // 切换内容显示
        document.getElementById('wechatPreview').classList.toggle('active', tabName === 'wechat');
        document.getElementById('rawPreview').classList.toggle('active', tabName === 'raw');
    },

    async copyToWechat() {
        if (!this.article?.content) {
            ToastManager.warning('文章内容为空');
            return;
        }

        try {
            await ClipboardManager.copy(this.article.content);
        } catch (error) {
            ToastManager.error('复制失败');
        }
    },

    downloadHTML() {
        if (!this.article?.content) {
            ToastManager.warning('文章内容为空');
            return;
        }

        const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.article.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; }
    </style>
</head>
<body>
${this.article.content}
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.article.title}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        ToastManager.success('下载成功');
    },

    async shareArticle() {
        const shareUrl = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: this.article?.title || '文章分享',
                    text: this.article?.summary || '',
                    url: shareUrl
                });
            } catch (err) {
                // 用户取消分享
            }
        } else {
            await ClipboardManager.copy(shareUrl);
        }
    },

    showDeleteModal() {
        document.getElementById('deleteModal').classList.add('active');
    },

    hideDeleteModal() {
        document.getElementById('deleteModal').classList.remove('active');
    },

    async confirmDelete() {
        try {
            const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
            const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';
            
            const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${this.articleId}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            ToastManager.success('文章已删除');
            setTimeout(() => {
                window.location.href = 'articles.html';
            }, 1500);

        } catch (error) {
            console.error('删除失败:', error);
            ToastManager.error('删除失败: ' + error.message);
            this.hideDeleteModal();
        }
    },

    formatDate(dateString) {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    },

    formatDateTime(dateString) {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    escapeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    // ========================================
    // 多平台发布功能
    // ========================================

    platforms: [],
    selectedPlatforms: [],

    async loadPlatforms() {
        try {
            const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
            const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';
            
            const response = await fetch(`${SUPABASE_URL}/rest/v1/platforms?select=*&order=priority.asc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to load platforms');
            
            this.platforms = await response.json();
            this.renderPlatformList();
        } catch (error) {
            console.error('加载平台失败:', error);
            document.getElementById('platformList').innerHTML = `
                <div class="empty-state">加载平台失败</div>
            `;
        }
    },

    renderPlatformList() {
        const container = document.getElementById('platformList');
        if (!container) return;

        if (this.platforms.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无平台配置</div>';
            return;
        }

        const platformIcons = {
            'wechat_mp': '💬',
            'xiaohongshu': '📕',
            'douyin': '🎵',
            'bilibili': '📺',
            'zhihu': '❓',
            'weibo': '🌐'
        };

        container.innerHTML = this.platforms.map(platform => {
            const isDisabled = !platform.is_active || !platform.is_configured;
            const statusText = platform.is_configured 
                ? (platform.is_active ? '已启用' : '已禁用')
                : '未配置';
            
            return `
                <div class="platform-item ${isDisabled ? 'disabled' : ''}" data-platform="${platform.id}">
                    <div class="platform-icon">${platformIcons[platform.id] || '📱'}</div>
                    <div class="platform-info">
                        <span class="platform-name">${platform.name}</span>
                        <span class="platform-status">${statusText}</span>
                    </div>
                    <input type="checkbox" 
                           class="platform-checkbox" 
                           data-platform="${platform.id}"
                           ${isDisabled ? 'disabled' : ''}
                           ${platform.id === 'wechat_mp' ? 'checked' : ''}>
                </div>
            `;
        }).join('');

        // 绑定复选框事件
        container.querySelectorAll('.platform-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const platformId = e.target.dataset.platform;
                if (e.target.checked) {
                    this.selectedPlatforms.push(platformId);
                } else {
                    this.selectedPlatforms = this.selectedPlatforms.filter(id => id !== platformId);
                }
            });
        });

        // 默认选中公众号
        this.selectedPlatforms = ['wechat_mp'];
    },

    // 内容转换器
    transformContent(content, platformId) {
        const transformers = {
            'wechat_mp': (c) => ({
                title: c.title,
                body: c.summary,
                formatted_body: c.content,
                tags: [c.type],
                extras: { author: 'OpenClaw', digest: c.summary }
            }),
            'xiaohongshu': (c) => {
                const plainText = c.content?.replace(/<[^>]*>/g, '') || c.summary;
                return {
                    title: c.title?.slice(0, 20),
                    body: `📖 ${c.summary}\n\n${plainText.slice(0, 800)}\n\n💡 关注我，了解更多教育资讯！`,
                    formatted_body: plainText,
                    tags: ['教育', '高考', '大学'],
                    extras: { topic_tags: ['#教育', '#高考'] }
                };
            },
            'douyin': (c) => {
                const plainText = c.content?.replace(/<[^>]*>/g, '') || c.summary;
                const script = `🔥 ${c.title}\n\n开头钩子（3秒）：${c.summary?.slice(0, 50)}\n\n正文（60秒）：${plainText.slice(0, 300)}\n\n结尾（5秒）：关注我，下期更精彩！`;
                return {
                    title: c.title?.slice(0, 55),
                    body: script,
                    formatted_body: script,
                    tags: ['教育', '知识分享'],
                    extras: { video_script: script }
                };
            },
            'bilibili': (c) => {
                const plainText = c.content?.replace(/<[^>]*>/g, '') || c.summary;
                return {
                    title: `【干货】${c.title}`.slice(0, 80),
                    body: `${c.summary}\n\n${plainText.slice(0, 1500)}\n\n🏷️ 如果觉得有用，请一键三连支持！`,
                    formatted_body: c.content,
                    tags: ['知识', '教育'],
                    extras: { copyright: '原创' }
                };
            },
            'zhihu': (c) => {
                const plainText = c.content?.replace(/<[^>]*>/g, '') || c.summary;
                return {
                    title: c.title,
                    body: `## ${c.title}\n\n${plainText}\n\n---\n\n**相关话题：** #教育 #高考`,
                    formatted_body: c.content,
                    tags: ['教育', '高考'],
                    extras: { format: 'markdown' }
                };
            }
        };

        const transformer = transformers[platformId];
        return transformer ? transformer(content) : null;
    },

    previewPlatformTransform() {
        if (!this.article) {
            ToastManager.warning('文章尚未加载');
            return;
        }

        const checkboxes = document.querySelectorAll('.platform-checkbox:checked');
        if (checkboxes.length === 0) {
            ToastManager.warning('请至少选择一个平台');
            return;
        }

        const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.platform);
        const previews = selectedIds.map(id => {
            const platform = this.platforms.find(p => p.id === id);
            const transformed = this.transformContent(this.article, id);
            return { platformId: id, platformName: platform?.name, ...transformed };
        }).filter(p => p !== null);

        this.showPreviewModal(previews);
    },

    showPreviewModal(previews) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content platform-preview-modal">
                <div class="modal-header">
                    <h3>📱 平台内容预览</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="platform-tabs">
                        ${previews.map((p, i) => `
                            <button class="tab-btn ${i === 0 ? 'active' : ''}" data-tab="${p.platformId}"
                                    onclick="this.closest('.modal').querySelectorAll('.tab-btn').forEach(t=>t.classList.remove('active'));this.classList.add('active');this.closest('.modal').querySelectorAll('.platform-content').forEach(c=>c.classList.remove('active'));this.closest('.modal').querySelector('[data-content=\'${p.platformId}\']').classList.add('active');">
                                ${p.platformName}
                            </button>
                        `).join('')}
                    </div>
                    <div class="platform-contents">
                        ${previews.map((p, i) => `
                            <div class="platform-content ${i === 0 ? 'active' : ''}" data-content="${p.platformId}">
                                <div class="preview-section">
                                    <label>标题</label>
                                    <div class="preview-title">${p.title}</div>
                                </div>
                                <div class="preview-section">
                                    <label>内容</label>
                                    <pre class="preview-body">${p.body}</pre>
                                </div>
                                <div class="preview-section">
                                    <label>标签</label>
                                    <div class="preview-tags">${p.tags?.join(', ') || '无'}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        lucide.createIcons();
    },

    async publishToPlatforms() {
        if (!this.article) {
            ToastManager.warning('文章尚未加载');
            return;
        }

        const checkboxes = document.querySelectorAll('.platform-checkbox:checked');
        if (checkboxes.length === 0) {
            ToastManager.warning('请至少选择一个平台');
            return;
        }

        const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.platform);
        
        // 保存转换后的内容到数据库
        const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

        ToastManager.success(`正在准备发布到 ${selectedIds.length} 个平台...`);

        for (const platformId of selectedIds) {
            const transformed = this.transformContent(this.article, platformId);
            if (!transformed) continue;

            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/platform_contents`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({
                        content_id: parseInt(this.articleId),
                        platform_id: platformId,
                        title: transformed.title,
                        body: transformed.body,
                        formatted_body: transformed.formatted_body,
                        tags: transformed.tags,
                        extras: transformed.extras,
                        transform_status: 'success'
                    })
                });

                if (!response.ok) throw new Error(`Failed to save ${platformId}`);
            } catch (error) {
                console.error(`保存 ${platformId} 失败:`, error);
            }
        }

        ToastManager.success('内容已转换并保存，请手动发布到各平台');
        this.previewPlatformTransform();
    }

    getMockArticle() {
        return {
            id: this.articleId,
            title: '考研调剂系统3天后开放！2026年这5个变化直接决定你能不能上岸',
            summary: '教育部刚发布2026年考研调剂新规，这些变化你一定要知道...',
            content: `
                <div style="max-width: 680px; margin: 0 auto; background-color: #fff; padding: 40px 30px;">
                    <h1 style="font-size: 26px; font-weight: bold; text-align: center; margin-bottom: 30px;">
                        考研调剂系统3天后开放！2026年这5个变化直接决定你能不能上岸
                    </h1>
                    <section style="background-color: rgb(0, 102, 204); padding: 20px; margin-bottom: 30px;">
                        <span style="color: white; font-size: 16px;">
                            2026年考研调剂新规发布，36小时志愿锁定、50%初试权重、取消笔试...这些变化将直接影响你的上岸机会。
                        </span>
                    </section>
                    <p style="font-size: 16px; line-height: 2; letter-spacing: 1px; text-indent: 2em; margin-bottom: 20px;">
                        3月17日，教育部发布《2026年全国硕士研究生招生调剂工作规定》，相比往年，今年的调剂政策出现了5个重大变化。
                    </p>
                </div>
            `,
            type: 'analysis',
            date: '2026-03-26',
            word_count: 1100,
            status: 'published',
            created_at: '2026-03-26T09:30:00Z',
            updated_at: '2026-03-26T10:15:00Z'
        };
    }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    ArticleDetailPage.init();
});
