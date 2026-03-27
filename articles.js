/**
 * 文章管理页面脚本
 */

const ArticlesPage = {
    currentPage: 1,
    pageSize: 12,
    totalArticles: 0,
    articles: [],
    selectedIds: new Set(),
    currentView: 'card',
    filters: {
        search: '',
        type: '',
        status: '',
        date: ''
    },

    init() {
        this.loadArticles();
        this.bindEvents();
        this.initViewToggle();
        this.initFilters();
        this.initBatchOperations();
    },

    bindEvents() {
        // 新建文章
        document.getElementById('newArticleBtn')?.addEventListener('click', () => {
            ToastManager.info('新建文章功能开发中...');
        });

        // 搜索
        const searchInput = document.getElementById('articleSearch');
        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadArticles();
            }, 300);
        });

        // 清除搜索
        document.getElementById('clearSearch')?.addEventListener('click', () => {
            searchInput.value = '';
            this.filters.search = '';
            this.currentPage = 1;
            this.loadArticles();
        });
    },

    initViewToggle() {
        const viewToggle = document.getElementById('viewToggle');
        const cardView = document.getElementById('articlesContainer');
        const listView = document.getElementById('listViewContainer');

        viewToggle?.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-btn');
            if (!btn) return;

            // 更新按钮状态
            viewToggle.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 切换视图
            this.currentView = btn.dataset.view;
            if (this.currentView === 'card') {
                cardView.classList.remove('hidden');
                listView.classList.add('hidden');
            } else {
                cardView.classList.add('hidden');
                listView.classList.remove('hidden');
            }

            // 重新渲染以更新复选框状态
            this.renderArticles();
        });
    },

    initFilters() {
        const typeFilter = document.getElementById('typeFilter');
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');

        typeFilter?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.currentPage = 1;
            this.loadArticles();
        });

        statusFilter?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.currentPage = 1;
            this.loadArticles();
        });

        dateFilter?.addEventListener('change', (e) => {
            this.filters.date = e.target.value;
            this.currentPage = 1;
            this.loadArticles();
        });
    },

    initBatchOperations() {
        // 全选
        document.getElementById('selectAll')?.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.article-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                const id = cb.closest('[data-id]')?.dataset.id;
                if (id) {
                    if (e.target.checked) {
                        this.selectedIds.add(id);
                    } else {
                        this.selectedIds.delete(id);
                    }
                }
            });
            this.updateBatchToolbar();
        });

        document.getElementById('selectAllList')?.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#articlesTableBody .article-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                const id = cb.closest('tr')?.dataset.id;
                if (id) {
                    if (e.target.checked) {
                        this.selectedIds.add(id);
                    } else {
                        this.selectedIds.delete(id);
                    }
                }
            });
            this.updateBatchToolbar();
        });

        // 批量发布
        document.getElementById('batchPublish')?.addEventListener('click', () => {
            ToastManager.success(`批量发布 ${this.selectedIds.size} 篇文章`);
        });

        // 批量删除
        document.getElementById('batchDelete')?.addEventListener('click', () => {
            if (confirm(`确定要删除选中的 ${this.selectedIds.size} 篇文章吗？`)) {
                ToastManager.success(`已删除 ${this.selectedIds.size} 篇文章`);
                this.selectedIds.clear();
                this.updateBatchToolbar();
                this.loadArticles();
            }
        });
    },

    async loadArticles() {
        const grid = document.getElementById('articlesGrid');
        const tableBody = document.getElementById('articlesTableBody');

        // 显示加载状态
        if (grid) {
            grid.innerHTML = `
                <div class="loading-state" style="grid-column: 1/-1;">
                    <i data-lucide="loader-2" class="spin"></i>
                    <span>加载中...</span>
                </div>
            `;
        }

        try {
            // 使用 REST API 直接获取数据
            const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
            const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';
            
            // 构建 URL
            let url = `${SUPABASE_URL}/rest/v1/articles?select=*`;
            
            // 应用筛选
            if (this.filters.type) {
                url += `&type=eq.${encodeURIComponent(this.filters.type)}`;
            }
            if (this.filters.status) {
                url += `&status=eq.${encodeURIComponent(this.filters.status)}`;
            }
            if (this.filters.search) {
                url += `&or=(title.ilike.*${encodeURIComponent(this.filters.search)}*,summary.ilike.*${encodeURIComponent(this.filters.search)}*)`;
            }
            
            // 日期筛选
            if (this.filters.date) {
                const today = new Date().toISOString().split('T')[0];
                if (this.filters.date === 'today') {
                    url += `&date=eq.${today}`;
                } else if (this.filters.date === 'week') {
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    url += `&date=gte.${weekStart.toISOString().split('T')[0]}`;
                } else if (this.filters.date === 'month') {
                    const monthStart = new Date();
                    monthStart.setDate(1);
                    url += `&date=gte.${monthStart.toISOString().split('T')[0]}`;
                }
            }
            
            // 排序和分页
            url += `&order=date.desc`;
            const from = (this.currentPage - 1) * this.pageSize;
            url += `&offset=${from}&limit=${this.pageSize}`;
            
            const response = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 获取总数
            const countUrl = `${SUPABASE_URL}/rest/v1/articles?select=count`;
            const countResponse = await fetch(countUrl, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            const countData = await countResponse.json();
            const count = countData[0]?.count || data.length;

            this.articles = data || [];
            this.totalArticles = count || 0;

            // 更新文章计数
            document.getElementById('articleCount').textContent = this.totalArticles;
            document.getElementById('totalArticles').textContent = this.totalArticles;

            this.renderArticles();
            this.renderPagination();

        } catch (error) {
            console.error('加载文章失败:', error);
            // 显示错误信息
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; color: #ef4444;">
                    <i data-lucide="alert-circle"></i>
                    <p>加载失败: ${error.message || '未知错误'}</p>
                    <p style="font-size: 12px; color: #666;">请检查网络连接或刷新页面</p>
                </div>
            `;
            document.getElementById('articleCount').textContent = '0';
            document.getElementById('totalArticles').textContent = '0';
        }

        // 重新初始化图标
        lucide.createIcons();
    },

    renderArticles() {
        const grid = document.getElementById('articlesGrid');
        const tableBody = document.getElementById('articlesTableBody');

        if (this.currentView === 'card') {
            if (this.articles.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <i data-lucide="file-x"></i>
                        <p>暂无文章</p>
                    </div>
                `;
            } else {
                grid.innerHTML = this.articles.map(article => this.createArticleCard(article)).join('');
            }
        } else {
            if (this.articles.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            <i data-lucide="file-x"></i>
                            <p>暂无文章</p>
                        </td>
                    </tr>
                `;
            } else {
                tableBody.innerHTML = this.articles.map(article => this.createArticleRow(article)).join('');
            }
        }

        // 绑定复选框事件
        this.bindCheckboxEvents();
        lucide.createIcons();
    },

    createArticleCard(article) {
        const typeClass = article.type === 'story' ? 'story' : 'analysis';
        const typeText = article.type === 'story' ? '人物故事' : '专业解读';
        const statusClass = article.status === 'published' ? 'published' : 'draft';
        const statusText = article.status === 'published' ? '已发布' : '草稿';

        return `
            <article class="article-card" data-id="${article.id}">
                <div class="article-checkbox-wrapper">
                    <input type="checkbox" class="article-checkbox" data-id="${article.id}">
                </div>
                <div class="article-content">
                    <div class="article-header">
                        <span class="article-type ${typeClass}">${typeText}</span>
                        <button class="btn-icon btn-more" title="更多操作">
                            <i data-lucide="more-vertical"></i>
                        </button>
                    </div>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-summary">${article.summary || '暂无摘要'}</p>
                    <div class="article-meta">
                        <span class="article-date">
                            <i data-lucide="calendar"></i>
                            ${article.date}
                        </span>
                        <span class="word-count">
                            <i data-lucide="type"></i>
                            ${article.wordcount || article.word_count || 0} 字
                        </span>
                    </div>
                    <div class="article-footer">
                        <span class="article-status ${statusClass}">${statusText}</span>
                        <div class="article-actions">
                            <button class="btn-icon" title="预览" onclick="ArticlesPage.previewArticle('${article.id}')">
                                <i data-lucide="eye"></i>
                            </button>
                            <button class="btn-icon" title="复制到公众号" onclick="ArticlesPage.copyToWechat('${article.id}')">
                                <i data-lucide="copy"></i>
                            </button>
                            <button class="btn-icon" title="编辑" onclick="ArticlesPage.editArticle('${article.id}')">
                                <i data-lucide="edit-2"></i>
                            </button>
                            <button class="btn-icon" title="删除" onclick="ArticlesPage.deleteArticle('${article.id}')">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    },

    createArticleRow(article) {
        const typeClass = article.type === 'story' ? 'story' : 'analysis';
        const typeText = article.type === 'story' ? '人物故事' : '专业解读';
        const statusClass = article.status === 'published' ? 'published' : 'draft';
        const statusText = article.status === 'published' ? '已发布' : '草稿';

        return `
            <tr data-id="${article.id}">
                <td>
                    <input type="checkbox" class="article-checkbox" data-id="${article.id}">
                </td>
                <td>
                    <span class="article-type ${typeClass}">${typeText}</span>
                </td>
                <td>
                    <div class="article-title-cell">${article.title}</div>
                </td>
                <td>${article.date}</td>
                <td>
                    <span class="article-status ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="article-actions">
                        <button class="btn-icon" title="预览" onclick="ArticlesPage.previewArticle('${article.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn-icon" title="复制到公众号" onclick="ArticlesPage.copyToWechat('${article.id}')">
                            <i data-lucide="copy"></i>
                        </button>
                        <button class="btn-icon" title="编辑" onclick="ArticlesPage.editArticle('${article.id}')">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn-icon" title="删除" onclick="ArticlesPage.deleteArticle('${article.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    bindCheckboxEvents() {
        const checkboxes = document.querySelectorAll('.article-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                if (e.target.checked) {
                    this.selectedIds.add(id);
                } else {
                    this.selectedIds.delete(id);
                }
                this.updateBatchToolbar();
            });
        });
    },

    updateBatchToolbar() {
        const toolbar = document.getElementById('batchToolbar');
        const selectedCount = document.getElementById('selectedCount');

        if (this.selectedIds.size > 0) {
            toolbar?.classList.add('active');
            if (selectedCount) {
                selectedCount.textContent = `已选择 ${this.selectedIds.size} 篇`;
            }
        } else {
            toolbar?.classList.remove('active');
        }
    },

    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.totalArticles / this.pageSize);
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';

        // 上一页
        html += `
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="ArticlesPage.goToPage(${this.currentPage - 1})">
                <i data-lucide="chevron-left"></i>
            </button>
        `;

        // 页码
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            html += `<button class="page-btn" onclick="ArticlesPage.goToPage(1)">1</button>`;
            if (start > 2) {
                html += `<span class="page-ellipsis">...</span>`;
            }
        }

        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="ArticlesPage.goToPage(${i})">${i}</button>`;
        }

        if (end < totalPages) {
            if (end < totalPages - 1) {
                html += `<span class="page-ellipsis">...</span>`;
            }
            html += `<button class="page-btn" onclick="ArticlesPage.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // 下一页
        html += `
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="ArticlesPage.goToPage(${this.currentPage + 1})">
                <i data-lucide="chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = html;
        lucide.createIcons();
    },

    goToPage(page) {
        if (page < 1 || page > Math.ceil(this.totalArticles / this.pageSize)) return;
        this.currentPage = page;
        this.loadArticles();
    },

    previewArticle(id) {
        window.open(`article-detail.html?id=${id}`, '_blank');
    },

    async copyToWechat(id) {
        try {
            const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
            const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';
            
            const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}&select=content`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            
            const data = await response.json();
            
            if (data && data[0]?.content) {
                await ClipboardManager.copy(data[0].content);
            } else {
                ToastManager.warning('文章内容为空');
            }
        } catch (error) {
            console.error('复制失败:', error);
            ToastManager.error('复制失败');
        }
    },

    editArticle(id) {
        ToastManager.info('编辑功能开发中...');
    },

    async deleteArticle(id) {
        if (confirm('确定要删除这篇文章吗？')) {
            try {
                const response = await fetch(`${this.SUPABASE_URL}/rest/v1/articles?id=eq.${id}`, {
                    method: 'DELETE',
                    headers: {
                        'apikey': this.SUPABASE_KEY,
                        'Authorization': `Bearer ${this.SUPABASE_KEY}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                ToastManager.success('文章已删除');
                this.loadArticles();
            } catch (error) {
                console.error('删除文章失败:', error);
                ToastManager.error('删除失败: ' + error.message);
            }
        }
    },
    
    async batchDelete() {
        if (this.selectedIds.size === 0) {
            ToastManager.warning('请先选择要删除的文章');
            return;
        }
        
        if (confirm(`确定要删除选中的 ${this.selectedIds.size} 篇文章吗？`)) {
            try {
                const ids = Array.from(this.selectedIds).join(',');
                const response = await fetch(`${this.SUPABASE_URL}/rest/v1/articles?id=in.(${ids})`, {
                    method: 'DELETE',
                    headers: {
                        'apikey': this.SUPABASE_KEY,
                        'Authorization': `Bearer ${this.SUPABASE_KEY}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                ToastManager.success(`已删除 ${this.selectedIds.size} 篇文章`);
                this.selectedIds.clear();
                this.loadArticles();
            } catch (error) {
                console.error('批量删除失败:', error);
                ToastManager.error('批量删除失败: ' + error.message);
            }
        }
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    ArticlesPage.init();
});
