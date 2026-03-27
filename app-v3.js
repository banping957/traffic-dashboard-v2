/**
 * OpenClaw Dashboard v2 - 主应用脚本
 */

console.log('app.js loaded');

// Supabase 配置
const SUPABASE_URL = 'https://vysmewebafmoaatsqxtc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0';

// 初始化 Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Toast 通知管理器
 */
const ToastManager = {
    container: null,
    
    init() {
        this.container = document.getElementById('toastContainer');
    },
    
    show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-circle'
        };
        
        toast.innerHTML = `
            <i data-lucide="${iconMap[type]}" class="toast-icon"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i data-lucide="x"></i>
            </button>
        `;
        
        this.container.appendChild(toast);
        lucide.createIcons({ icons: { 'check-circle': lucide.icons['check-circle'], 'x-circle': lucide.icons['x-circle'], 'alert-circle': lucide.icons['alert-circle'], 'x': lucide.icons['x'] }, nameAttr: 'data-lucide' });
        
        setTimeout(() => {
            toast.style.animation = 'toast-out 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    success(message) {
        this.show(message, 'success');
    },
    
    error(message) {
        this.show(message, 'error');
    },
    
    warning(message) {
        this.show(message, 'warning');
    }
};

/**
 * 剪贴板管理器
 */
const ClipboardManager = {
    async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            ToastManager.success('已复制到剪贴板');
        } catch (err) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            ToastManager.success('已复制到剪贴板');
        }
    }
};

/**
 * 主题管理器
 */
const ThemeManager = {
    init() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        themeToggle?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
};

/**
 * 侧边栏管理器
 */
const SidebarManager = {
    init() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        // 桌面端折叠
        sidebarToggle?.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
        
        // 恢复折叠状态
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            sidebar?.classList.add('collapsed');
        }
        
        // 移动端菜单
        mobileMenuToggle?.addEventListener('click', () => {
            sidebar.classList.add('mobile-open');
            mobileOverlay.classList.add('active');
        });
        
        mobileOverlay?.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
        });
    }
};

/**
 * 日历管理器
 */
const CalendarManager = {
    currentDate: new Date(),
    
    init() {
        this.renderCalendar();
        
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
    },
    
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新月份显示
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        const monthEl = document.getElementById('calendarMonth');
        if (monthEl) {
            monthEl.textContent = `${year}年${monthNames[month]}`;
        }
        
        // 生成日历天数
        const daysContainer = document.getElementById('calendarDays');
        if (!daysContainer) return;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        let html = '';
        
        // 上月填充
        for (let i = 0; i < firstDay; i++) {
            html += '<span class="day other-month"></span>';
        }
        
        // 当月天数
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = year === today.getFullYear() && 
                           month === today.getMonth() && 
                           day === today.getDate();
            
            // 模拟一些有发布的日期
            const hasEvent = [5, 12, 18, 25].includes(day);
            
            let classes = 'day';
            if (isToday) classes += ' today';
            if (hasEvent) classes += ' has-event';
            
            html += `<span class="${classes}">${day}</span>`;
        }
        
        daysContainer.innerHTML = html;
    }
};

/**
 * 文章数据管理器
 */
const ArticleManager = {
    SUPABASE_URL: 'https://vysmewebafmoaatsqxtc.supabase.co',
    SUPABASE_KEY: 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0',
    
    async loadStats() {
        try {
            // 获取文章总数
            const countResponse = await fetch(`${this.SUPABASE_URL}/rest/v1/articles?select=count`, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            const countData = await countResponse.json();
            const totalCount = countData[0]?.count || 0;
            
            // 获取今日文章数
            const today = new Date().toISOString().split('T')[0];
            const todayResponse = await fetch(`${this.SUPABASE_URL}/rest/v1/articles?select=count&date=eq.${today}`, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            const todayData = await todayResponse.json();
            const todayCount = todayData[0]?.count || 0;
            
            // 获取本周文章数
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekResponse = await fetch(`${this.SUPABASE_URL}/rest/v1/articles?select=count&date=gte.${weekStart.toISOString().split('T')[0]}`, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            const weekData = await weekResponse.json();
            const weekCount = weekData[0]?.count || 0;
            
            // 更新显示
            document.getElementById('totalCount').textContent = totalCount;
            document.getElementById('todayCount').textContent = todayCount;
            document.getElementById('weekCount').textContent = weekCount;
            document.getElementById('articleCount').textContent = totalCount;
            
        } catch (error) {
            console.error('加载统计数据失败:', error);
            document.getElementById('totalCount').textContent = '0';
            document.getElementById('todayCount').textContent = '0';
            document.getElementById('weekCount').textContent = '0';
            document.getElementById('articleCount').textContent = '0';
        }
    },
    
    async loadRecentArticles() {
        const container = document.getElementById('recentArticles');
        if (!container) {
            console.log('recentArticles container not found');
            return;
        }
        
        console.log('Loading recent articles...');
        
        try {
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/articles?select=*&order=date.desc&limit=5`, {
                headers: {
                    'apikey': this.SUPABASE_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`
                }
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const articles = await response.json();
            console.log('Loaded articles:', articles.length);
            
            if (!articles || articles.length === 0) {
                container.innerHTML = '<div class="empty-state">暂无文章</div>';
                return;
            }
            
            container.innerHTML = articles.map(article => this.createArticleCard(article)).join('');
            lucide.createIcons();
            
        } catch (error) {
            console.error('加载文章失败:', error);
            container.innerHTML = `<div class="empty-state" style="color: #ef4444;">加载失败: ${error.message}</div>`;
        }
    },
    
    createArticleCard(article) {
        const typeClass = article.type === 'story' ? 'story' : 'analysis';
        const typeText = article.type === 'story' ? '人物故事' : '专业解读';
        const statusClass = article.status === 'published' ? 'published' : 'draft';
        const statusText = article.status === 'published' ? '已发布' : '草稿';
        
        return `
            <article class="article-card" data-id="${article.id}">
                <div class="article-header">
                    <span class="article-type ${typeClass}">${typeText}</span>
                    <span class="article-date">${article.date}</span>
                </div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-summary">${article.summary || '暂无摘要'}</p>
                <div class="article-footer">
                    <div class="article-meta">
                        <span class="word-count">
                            <i data-lucide="type"></i>
                            ${article.word_count || 0} 字
                        </span>
                        <span class="article-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="article-actions">
                        <button class="btn-icon" title="预览" onclick="previewArticle('${article.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn-icon" title="复制" onclick="copyArticle('${article.id}')">
                            <i data-lucide="copy"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    },
    
    getMockArticles() {
        return `
            <article class="article-card">
                <div class="article-header">
                    <span class="article-type story">人物故事</span>
                    <span class="article-date">2026-03-26</span>
                </div>
                <h3 class="article-title">考研调剂系统3天后开放！2026年这5个变化直接决定你能不能上岸</h3>
                <p class="article-summary">教育部刚发布2026年考研调剂新规，这些变化你一定要知道...</p>
                <div class="article-footer">
                    <div class="article-meta">
                        <span class="word-count">
                            <i data-lucide="type"></i>
                            1,100 字
                        </span>
                        <span class="article-status published">已发布</span>
                    </div>
                    <div class="article-actions">
                        <button class="btn-icon" title="预览"><i data-lucide="eye"></i></button>
                        <button class="btn-icon" title="复制"><i data-lucide="copy"></i></button>
                    </div>
                </div>
            </article>
            <article class="article-card">
                <div class="article-header">
                    <span class="article-type analysis">专业解读</span>
                    <span class="article-date">2026-03-26</span>
                </div>
                <h3 class="article-title">2026全球计算机专业排名出炉：清华上交并列第一</h3>
                <p class="article-summary">CS Rankings 2026最新发布，中国高校包揽AI方向全球前十...</p>
                <div class="article-footer">
                    <div class="article-meta">
                        <span class="word-count">
                            <i data-lucide="type"></i>
                            1,050 字
                        </span>
                        <span class="article-status published">已发布</span>
                    </div>
                    <div class="article-actions">
                        <button class="btn-icon" title="预览"><i data-lucide="eye"></i></button>
                        <button class="btn-icon" title="复制"><i data-lucide="copy"></i></button>
                    </div>
                </div>
            </article>
        `;
    }
};

/**
 * 初始化应用
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded triggered');
    // 初始化图标
    lucide.createIcons();
    
    // 初始化各模块
    ToastManager.init();
    ThemeManager.init();
    SidebarManager.init();
    CalendarManager.init();
    
    // 加载数据
    console.log('Loading data...');
    ArticleManager.loadStats();
    ArticleManager.loadRecentArticles();
    console.log('Data loading triggered');
    
    // 新建文章按钮
    document.getElementById('newArticleBtn')?.addEventListener('click', () => {
        window.location.href = 'articles.html';
    });
});

// 全局函数
window.previewArticle = (id) => {
    window.location.href = `article-detail.html?id=${id}`;
};

window.copyArticle = async (id) => {
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
};
