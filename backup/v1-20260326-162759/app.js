/**
 * 流量提升计划 - 内容管理后台
 * 纯前端可交互版本
 */

// 全局数据存储
let appData = {
    stats: {},
    articles: [],
    todos: [],
    materials: [],
    calendar: {}
};

// 当前状态
let currentFilter = 'all';
let currentMonth = new Date();

// 初始化
async function init() {
    await loadData();
    renderDashboard();
    renderArticles();
    renderMaterials();
    renderCalendar();
    renderTodos();
    setupEventListeners();
}

// 加载数据
async function loadData() {
    try {
        console.log('Loading data...');
        const response = await fetch('data.json?v=' + Date.now()); // 加时间戳防止缓存
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }
        appData = await response.json();
        console.log('Data loaded:', appData.articles.length, 'articles');
    } catch (error) {
        console.error('加载数据失败:', error);
        showToast('数据加载失败: ' + error.message, 'error');
        // 使用默认数据
        appData = {
            stats: { monthlyArticles: 6, monthlyArticlesChange: 6, totalViews: "156.3K", totalViewsChange: 35, completionRate: "72%", completionRateChange: 8, materialCount: 168, materialChange: 24 },
            articles: [],
            todos: [],
            materials: [],
            calendar: { currentMonth: "2026-03", publishedDates: ["16", "18", "19"] },
            planProgress: { totalDays: 30, completedDays: 19, totalArticles: 6, targetArticles: 60, currentPhase: "第一阶段", phaseProgress: 70 }
        };
    }
}

// 保存数据到localStorage（模拟持久化）
function saveData() {
    localStorage.setItem('trafficDashboardData', JSON.stringify(appData));
}

// 渲染仪表盘
function renderDashboard() {
    const stats = appData.stats;
    
    document.getElementById('stat-monthly').textContent = stats.monthlyArticles;
    document.getElementById('stat-monthly-change').textContent = stats.monthlyArticlesChange;
    document.getElementById('stat-views').textContent = stats.totalViews;
    document.getElementById('stat-views-change').textContent = stats.totalViewsChange;
    document.getElementById('stat-completion').textContent = stats.completionRate;
    document.getElementById('stat-completion-change').textContent = stats.completionRateChange;
    document.getElementById('stat-materials').textContent = stats.materialCount;
    document.getElementById('stat-materials-change').textContent = stats.materialChange;
    
    // 渲染最近文章（前4篇）
    const recentArticles = appData.articles.slice(0, 4);
    const container = document.getElementById('recent-articles');
    container.innerHTML = recentArticles.map(article => createArticleHTML(article)).join('');
}

// 创建文章HTML
function createArticleHTML(article) {
    const statusClass = article.status;
    const tagClass = article.type;
    
    return `
        <div class="article-item">
            <div class="article-status ${statusClass}"></div>
            <div class="article-info" onclick="showArticleDetail(${article.id})">
                <div class="article-title">${article.title}</div>
                <div class="article-meta">
                    <span class="article-tag ${tagClass}">${article.typeLabel}</span>
                    <span>${article.date}</span>
                    <span>${article.timeSlot}发布</span>
                </div>
            </div>
            <div class="article-stats">
                ${article.status === 'published' ? `
                    <div class="article-stat">👁 ${formatNumber(article.views)}</div>
                    <div class="article-stat">❤️ ${article.likes}</div>
                    <div class="article-stat">💬 ${article.comments}</div>
                ` : '<div class="article-stat">📝 待发布</div>'}
            </div>
            <div class="article-actions">
                <button class="action-btn" onclick="editArticle(${article.id})" title="编辑">✏️</button>
                ${article.status === 'draft' ? `
                    <button class="action-btn" onclick="publishArticle(${article.id})" title="发布">🚀</button>
                ` : ''}
            </div>
        </div>
    `;
}

// 渲染文章列表页
function renderArticles() {
    console.log('Rendering articles, filter:', currentFilter);
    let filtered = appData.articles || [];
    
    if (currentFilter !== 'all') {
        if (currentFilter === 'published' || currentFilter === 'draft') {
            filtered = filtered.filter(a => a.status === currentFilter);
        } else {
            filtered = filtered.filter(a => a.type === currentFilter);
        }
    }
    
    const container = document.getElementById('all-articles');
    if (!container) {
        console.error('Container not found: all-articles');
        return;
    }
    
    console.log('Filtered articles:', filtered.length);
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-text">暂无文章</div>
            </div>
        `;
    } else {
        container.innerHTML = filtered.map(article => createArticleHTML(article)).join('');
    }
}

// 渲染素材库
function renderMaterials() {
    const materials = appData.materials;
    
    // 仪表盘小素材库
    const gridContainer = document.getElementById('material-grid');
    gridContainer.innerHTML = materials.slice(0, 3).map(m => `
        <div class="material-item" onclick="showMaterialDetail(${m.id})">
            <div>${m.icon}</div>
            <div class="material-name">${m.name}</div>
            <div class="material-count">${m.count}</div>
        </div>
    `).join('') + `
        <div class="material-item add" onclick="addMaterial()">
            <div>+</div>
        </div>
    `;
    
    // 素材库页面
    const allContainer = document.getElementById('all-materials');
    if (allContainer) {
        allContainer.innerHTML = materials.map(m => `
            <div class="material-item" onclick="showMaterialDetail(${m.id})" style="aspect-ratio: 1;">
                <div style="font-size: 48px;">${m.icon}</div>
                <div class="material-name">${m.name}</div>
                <div class="material-count">${m.count}</div>
            </div>
        `).join('') + `
            <div class="material-item add" onclick="addMaterial()" style="aspect-ratio: 1;">
                <div style="font-size: 48px;">+</div>
            </div>
        `;
    }
}

// 渲染日历
function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    document.getElementById('calendar-month').textContent = `${year}年${month + 1}月`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = document.getElementById('calendar-grid');
    let html = '';
    
    // 星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });
    
    // 空白格子
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day"></div>';
    }
    
    // 日期格子
    const today = new Date();
    const publishedDates = appData.calendar.publishedDates || [];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = year === today.getFullYear() && 
                       month === today.getMonth() && 
                       day === today.getDate();
        
        const hasContent = publishedDates.includes(String(day));
        const dayClass = [
            'calendar-day',
            isToday ? 'today' : '',
            hasContent ? 'has-content both' : ''
        ].filter(Boolean).join(' ');
        
        html += `<div class="${dayClass}" onclick="selectDate(${day})">${day}</div>`;
    }
    
    grid.innerHTML = html;
}

// 渲染待办事项
function renderTodos() {
    const todos = appData.todos;
    const container = document.getElementById('todo-list');
    
    const completed = todos.filter(t => t.completed).length;
    document.getElementById('todo-progress').textContent = `${completed}/${todos.length}`;
    
    container.innerHTML = todos.map(todo => `
        <div class="progress-item">
            <div class="progress-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})">
                ${todo.completed ? '✓' : ''}
            </div>
            <div class="progress-text ${todo.completed ? 'completed' : ''}" onclick="toggleTodo(${todo.id})">
                ${todo.text}
            </div>
            <div class="progress-delete" onclick="deleteTodo(${todo.id})" title="删除">×</div>
        </div>
    `).join('');
}

// 切换页面
function showPage(pageName) {
    console.log('切换到页面:', pageName);
    
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('页面已显示:', pageName);
    } else {
        console.error('页面不存在:', pageName);
        showToast('页面加载失败', 'error');
        return;
    }
    
    // 更新导航状态
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.page === pageName) {
            tab.classList.add('active');
        }
    });
    
    // 重新渲染
    if (pageName === 'articles') renderArticles();
    if (pageName === 'materials') renderMaterials();
}

// 打开文章详情
function showArticleDetail(id) {
    const article = appData.articles.find(a => a.id === id);
    if (!article) return;
    
    document.getElementById('modal-title').textContent = '文章详情';
    document.getElementById('modal-body').innerHTML = `
        <div class="article-detail">
            <div class="detail-header">
                <h2 class="detail-title">${article.title}</h2>
                <div class="detail-meta">
                    <span class="article-tag ${article.type}">${article.typeLabel}</span>
                    <span>📅 ${article.date} ${article.timeSlot}</span>
                    <span>📝 ${article.wordCount}字</span>
                    ${article.status === 'published' ? `
                        <span>👁 ${formatNumber(article.views)}阅读</span>
                        <span>❤️ ${article.likes}赞</span>
                        <span>💬 ${article.comments}评论</span>
                    ` : '<span>⏳ 草稿</span>'}
                </div>
            </div>
            <div class="detail-content">
                <p><strong>摘要：</strong>${article.summary}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p>正文内容可在编辑页面查看和修改...</p>
            </div>
        </div>
    `;
    
    document.getElementById('modal-action-btn').textContent = '编辑';
    document.getElementById('modal-action-btn').onclick = () => editArticle(id);
    
    document.getElementById('article-modal').classList.add('active');
}

// 关闭模态框
function closeModal(event) {
    if (!event || event.target.id === 'article-modal') {
        document.getElementById('article-modal').classList.remove('active');
    }
}

// 编辑文章
function editArticle(id) {
    showToast('编辑功能开发中...', 'success');
    closeModal();
}

// 发布文章
function publishArticle(id) {
    const article = appData.articles.find(a => a.id === id);
    if (article) {
        article.status = 'published';
        article.views = 0;
        article.likes = 0;
        article.comments = 0;
        saveData();
        renderDashboard();
        renderArticles();
        showToast('文章已发布！', 'success');
    }
}

// 打开新建文章模态框
function openArticleModal() {
    document.getElementById('modal-title').textContent = '新建文章';
    document.getElementById('modal-body').innerHTML = `
        <div class="form-group">
            <label class="form-label">文章标题</label>
            <input type="text" class="form-input" id="new-article-title" placeholder="输入文章标题">
        </div>
        <div class="form-group">
            <label class="form-label">文章类型</label>
            <select class="form-select" id="new-article-type">
                <option value="story">人物故事</option>
                <option value="analysis">专业解读</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">发布时段</label>
            <select class="form-select" id="new-article-time">
                <option value="上午">上午</option>
                <option value="下午">下午</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">文章摘要</label>
            <textarea class="form-textarea" id="new-article-summary" placeholder="输入文章摘要..."></textarea>
        </div>
    `;
    
    document.getElementById('modal-action-btn').textContent = '创建';
    document.getElementById('modal-action-btn').onclick = createArticle;
    
    document.getElementById('article-modal').classList.add('active');
}

// 创建文章
function createArticle() {
    const title = document.getElementById('new-article-title').value;
    const type = document.getElementById('new-article-type').value;
    const timeSlot = document.getElementById('new-article-time').value;
    const summary = document.getElementById('new-article-summary').value;
    
    if (!title) {
        showToast('请输入文章标题', 'error');
        return;
    }
    
    const newArticle = {
        id: Date.now(),
        title,
        type,
        typeLabel: type === 'story' ? '人物故事' : '专业解读',
        date: new Date().toISOString().split('T')[0],
        timeSlot,
        status: 'draft',
        views: 0,
        likes: 0,
        comments: 0,
        wordCount: 0,
        summary: summary || '暂无摘要'
    };
    
    appData.articles.unshift(newArticle);
    saveData();
    renderDashboard();
    renderArticles();
    closeModal();
    showToast('文章创建成功！', 'success');
}

// 切换待办状态
function toggleTodo(id) {
    const todo = appData.todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveData();
        renderTodos();
    }
}

// 添加待办
function addTodo() {
    const input = document.getElementById('new-todo-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    appData.todos.push({
        id: Date.now(),
        text,
        completed: false,
        date: new Date().toISOString().split('T')[0]
    });
    
    saveData();
    renderTodos();
    input.value = '';
    showToast('任务已添加', 'success');
}

// 删除待办
function deleteTodo(id) {
    appData.todos = appData.todos.filter(t => t.id !== id);
    saveData();
    renderTodos();
    showToast('任务已删除', 'success');
}

// 处理回车键
function handleTodoKeypress(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
}

// 切换月份
function changeMonth(delta) {
    currentMonth.setMonth(currentMonth.getMonth() + delta);
    renderCalendar();
}

// 选择日期
function selectDate(day) {
    showToast(`${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月${day}日`, 'success');
}

// 显示素材详情
function showMaterialDetail(id) {
    const material = appData.materials.find(m => m.id === id);
    if (material) {
        showToast(`${material.name} - ${material.count}个文件`, 'success');
    }
}

// 添加素材
function addMaterial() {
    showToast('素材上传功能开发中...', 'success');
}

// 设置事件监听
function setupEventListeners() {
    console.log('设置事件监听...');
    
    // 导航切换
    const navTabs = document.querySelectorAll('.nav-tab');
    console.log('找到导航按钮:', navTabs.length);
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            console.log('点击导航:', e.target.dataset.page);
            showPage(e.target.dataset.page);
        });
    });
    
    // 筛选按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderArticles();
        });
    });
}

// 格式化数字
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// 显示Toast提示
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 初始化应用...');
    init().catch(err => {
        console.error('初始化失败:', err);
        showToast('应用加载失败，请刷新页面', 'error');
    });
});

// 全局错误处理
window.onerror = (msg, url, line) => {
    console.error(`错误: ${msg} 在 ${url}:${line}`);
    return false;
};