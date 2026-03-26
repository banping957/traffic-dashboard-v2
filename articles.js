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
            let query = supabase
                .from('articles')
                .select('*', { count: 'exact' });

            // 应用筛选
            if (this.filters.type) {
                query = query.eq('type', this.filters.type);
            }
            if (this.filters.status) {
                query = query.eq('status', this.filters.status);
            }
            if (this.filters.search) {
                query = query.or(`title.ilike.%${this.filters.search}%,summary.ilike.%${this.filters.search}%`);
            }

            // 日期筛选
            if (this.filters.date) {
                const today = new Date().toISOString().split('T')[0];
                if (this.filters.date === 'today') {
                    query = query.eq('date', today);
                } else if (this.filters.date === 'week') {
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    query = query.gte('date', weekStart.toISOString().split('T')[0]);
                } else if (this.filters.date === 'month') {
                    const monthStart = new Date();
                    monthStart.setDate(1);
                    query = query.gte('date', monthStart.toISOString().split('T')[0]);
                }
            }

            // 分页
            const from = (this.currentPage - 1) * this.pageSize;
            const to = from + this.pageSize - 1;

            const { data, error, count } = await query
                .order('date', { ascending: false })
                .range(from, to);

            if (error) throw error;

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
                grid.innerHTML = this.articles.map(article => this.createCardHTML(article)).join('');
            }
        } else {
            if (this.articles.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-state">
                            <i data-lucide="file-x"></i>
                            <p>暂无文章</p>
                        </td>
                    </tr>
                `;
            } else {
                tableBody.innerHTML = this.articles.map(article => this.createRowHTML(article)).join('');
            }
        }

        // 绑定复选框事件
        this.bindCheckboxEvents();
        lucide.createIcons();
    },

    createCardHTML(article) {
        const typeClass = article.type === 'story' ? 'story' : 'analysis';
        const typeText = article.type === 'story' ? '人物故事' : '专业解读';
        const statusClass = article.status === 'published' ? 'published' : 'draft';
        const statusText = article.status === 'published' ? '已发布' : '草稿';
        const isSelected = this.selectedIds.has(String(article.id));

        return `
            <article class="article-card-v2 ${isSelected ? 'selected' : ''}" data-id="${article.id}">
                <div class="card-checkbox">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" class="article-checkbox" ${isSelected ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <span class="article-type ${typeClass}">${typeText}</span>
                        <div class="card-actions-menu">
                            <button class="btn-icon menu-toggle" onclick="event.stopPropagation(); ArticlesPage.showArticleMenu('${article.id}')">
                                <i data-lucide="more-vertical"></i>
                            </button>
                        </div>
                    </div>
                    <h3 class="card-title">${article.title}</h3>
                    <p class="card-summary">${article.summary || '暂无摘要'}</p>
                    <div class="card-meta">
                        <div class="meta-item">
                            <i data-lucide="calendar"></i>
                            <span>${article.date}</span>
                        </div>
                        <div class="meta-item">
                            <i data-lucide="type"></i>
                            <span>${article.word_count || 0} 字</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <span class="article-status ${statusClass}">${statusText}</span>
                    <div class="card-actions">
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
            </article>
        `;
    },

    createRowHTML(article) {
        const typeClass = article.type === 'story' ? 'story' : 'analysis';
        const typeText = article.type === 'story' ? '人物故事' : '专业解读';
        const statusClass = article.status === 'published' ? 'published' : 'draft';
        const statusText = article.status === 'published' ? '已发布' : '草稿';
        const isSelected = this.selectedIds.has(String(article.id));

        return `
            <tr data-id="${article.id}" class="${isSelected ? 'selected' : ''}">
                <td>
                    <label class="checkbox-wrapper">
                        <input type="checkbox" class="article-checkbox" ${isSelected ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                </td>
                <td>
                    <div class="table-title">
                        <span class="title-text">${article.title}</span>
                        <span class="title-summary">${article.summary || '暂无摘要'}</span>
                    </div>
                </td>
                <td><span class="article-type ${typeClass}">${typeText}</span></td>
                <td>${article.date}</td>
                <td>${article.word_count || 0}</td>
                <td><span class="article-status ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" title="预览" onclick="ArticlesPage.previewArticle('${article.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn-icon" title="复制" onclick="ArticlesPage.copyToWechat('${article.id}')">
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
        document.querySelectorAll('.article-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.closest('[data-id]')?.dataset.id;
                if (id) {
                    if (e.target.checked) {
                        this.selectedIds.add(id);
                    } else {
                        this.selectedIds.delete(id);
                    }
                    this.updateBatchToolbar();
                    this.updateCardSelection(id, e.target.checked);
                }
            });
        });
    },

    updateCardSelection(id, selected) {
        const card = document.querySelector(`.article-card-v2[data-id="${id}"]`);
        const row = document.querySelector(`tr[data-id="${id}"]`);
        
        if (card) {
            card.classList.toggle('selected', selected);
        }
        if (row) {
            row.classList.toggle('selected', selected);
        }
    },

    updateBatchToolbar() {
        const toolbar = document.getElementById('batchToolbar');
        const countEl = document.getElementById('selectedCount');

        if (this.selectedIds.size > 0) {
            toolbar.classList.add('active');
            countEl.textContent = this.selectedIds.size;
        } else {
            toolbar.classList.remove('active');
            countEl.textContent = '0';
            // 取消全选
            document.getElementById('selectAll').checked = false;
            document.getElementById('selectAllList').checked = false;
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
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="ArticlesPage.goToPage(${this.currentPage - 1})">
                <i data-lucide="chevron-left"></i>
            </button>
        `;

        // 页码
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            html += `<button class="pagination-btn" onclick="ArticlesPage.goToPage(1)">1</button>`;
            if (startPage > 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="ArticlesPage.goToPage(${i})">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
            html += `<button class="pagination-btn" onclick="ArticlesPage.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // 下一页
        html += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="ArticlesPage.goToPage(${this.currentPage + 1})">
                <i data-lucide="chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = html;
    },

    goToPage(page) {
        this.currentPage = page;
        this.loadArticles();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // 文章操作
    previewArticle(id) {
        window.open(`article-detail.html?id=${id}`, '_blank');
    },

    async copyToWechat(id) {
        try {
            const { data: article, error } = await supabase
                .from('articles')
                .select('content')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (article?.content) {
                await ClipboardManager.copy(article.content);
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
        if (!confirm('确定要删除这篇文章吗？')) return;

        try {
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            ToastManager.success('文章已删除');
            this.loadArticles();
        } catch (error) {
            console.error('删除失败:', error);
            ToastManager.error('删除失败');
        }
    },

    showArticleMenu(id) {
        // 可以在这里实现下拉菜单
        ToastManager.info('菜单功能开发中...');
    },

    getMockArticles() {
        return [
            {
                id: 1,
                title: '考研调剂系统3天后开放！2026年这5个变化直接决定你能不能上岸',
                summary: '教育部刚发布2026年考研调剂新规，这些变化你一定要知道...',
                type: 'analysis',
                date: '2026-03-26',
                word_count: 1100,
                status: 'published'
            },
            {
                id: 2,
                title: '2026全球计算机专业排名出炉：清华上交并列第一',
                summary: 'CS Rankings 2026最新发布，中国高校包揽AI方向全球前十...',
                type: 'analysis',
                date: '2026-03-26',
                word_count: 1050,
                status: 'published'
            },
            {
                id: 3,
                title: '从农村走出的AI创业者：李明的故事',
                summary: '讲述一位普通农村青年如何通过自学AI技术，最终创立自己的科技公司...',
                type: 'story',
                date: '2026-03-25',
                word_count: 2456,
                status: 'published'
            },
            {
                id: 4,
                title: '2024年AI写作工具深度评测：哪个更适合你？',
                summary: '全面对比市面上主流的AI写作工具，从功能、价格、适用场景等多个维度进行分析...',
                type: 'analysis',
                date: '2026-03-24',
                word_count: 3128,
                status: 'draft'
            },
            {
                id: 5,
                title: '退休教师的第二人生：用AI创作温暖千万人',
                summary: '68岁的王老师退休后开始学习AI写作，短短一年时间就积累了数十万粉丝...',
                type: 'story',
                date: '2026-03-23',
                word_count: 1892,
                status: 'published'
            },
            {
                id: 6,
                title: '如何写出10万+的公众号文章？这5个技巧你必须知道',
                summary: '深度分析爆款文章的共同特点，总结出5个可复制的写作技巧...',
                type: 'analysis',
                date: '2026-03-22',
                word_count: 2845,
                status: 'published'
            }
        ];
    }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    ArticlesPage.init();
});
