/**
 * 发布日历页面脚本
 */

const CalendarPage = {
    currentDate: new Date(),
    articles: [],
    selectedDate: null,

    init() {
        this.loadArticles();
        this.bindEvents();
        this.renderCalendar();
    },

    bindEvents() {
        // 上月
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        // 下月
        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // 关闭详情弹窗
        document.getElementById('closeDetailModal')?.addEventListener('click', () => {
            this.hideDetailModal();
        });

        document.querySelector('#dateDetailModal .modal-overlay')?.addEventListener('click', () => {
            this.hideDetailModal();
        });

        // 添加文章到日期
        document.getElementById('addArticleToDate')?.addEventListener('click', () => {
            ToastManager.info('添加文章功能开发中...');
        });
    },

    async loadArticles() {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('id, title, type, date, time_slot')
                .order('date', { ascending: true });

            if (error) throw error;

            this.articles = data || [];

            if (this.articles.length === 0) {
                this.articles = this.getMockArticles();
            }

        } catch (error) {
            console.error('加载文章失败:', error);
            this.articles = this.getMockArticles();
        }

        this.renderCalendar();
    },

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // 更新标题
        document.getElementById('calendarTitle').textContent = `${year}年${month + 1}月`;

        // 获取当月第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay(); // 0 = 周日

        // 获取上月最后几天
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        const grid = document.getElementById('calendarGrid');
        let html = '';

        // 上月日期
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            html += this.createDayCell(day, true);
        }

        // 当月日期
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = today.getFullYear() === year && 
                          today.getMonth() === month && 
                          today.getDate() === day;
            html += this.createDayCell(day, false, isToday, year, month);
        }

        // 下月日期
        const remainingCells = 42 - (startDayOfWeek + daysInMonth); // 6行 x 7列 = 42
        for (let day = 1; day <= remainingCells; day++) {
            html += this.createDayCell(day, true);
        }

        grid.innerHTML = html;

        // 绑定日期点击事件
        grid.querySelectorAll('.calendar-day:not(.other-month)').forEach(dayCell => {
            dayCell.addEventListener('click', () => {
                const date = dayCell.dataset.date;
                this.showDateDetail(date);
            });
        });
    },

    createDayCell(day, isOtherMonth, isToday = false, year = null, month = null) {
        const dateStr = year !== null 
            ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : '';

        let dayArticles = [];
        if (!isOtherMonth && dateStr) {
            dayArticles = this.articles.filter(a => a.date === dateStr);
        }

        const classNames = ['calendar-day'];
        if (isOtherMonth) classNames.push('other-month');
        if (isToday) classNames.push('today');

        let articlesHtml = '';
        if (dayArticles.length > 0) {
            const dots = dayArticles.slice(0, 3).map(a => 
                `<div class="day-article-dot ${a.type}"></div>`
            ).join('');
            const countText = dayArticles.length > 3 ? `+${dayArticles.length - 3}` : '';
            
            articlesHtml = `
                <div class="day-articles">${dots}</div>
                ${countText ? `<div class="day-article-count">${countText}</div>` : ''}
            `;
        }

        return `
            <div class="${classNames.join(' ')}" data-date="${dateStr}">
                <div class="day-number">${day}</div>
                ${articlesHtml}
            </div>
        `;
    },

    showDateDetail(dateStr) {
        this.selectedDate = dateStr;
        const date = new Date(dateStr);
        
        // 更新标题
        document.getElementById('detailDate').textContent = 
            `${date.getMonth() + 1}月${date.getDate()}日`;

        // 获取当天文章
        const dayArticles = this.articles.filter(a => a.date === dateStr);

        const container = document.getElementById('dateArticles');
        if (dayArticles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="calendar-x"></i>
                    <p>当天暂无发布计划</p>
                </div>
            `;
        } else {
            container.innerHTML = dayArticles.map(article => `
                <div class="date-article-item">
                    <span class="date-article-type ${article.type}"></span>
                    <span class="date-article-title">${article.title}</span>
                    <span class="date-article-time">${article.time_slot || '上午'}</span>
                </div>
            `).join('');
        }

        document.getElementById('dateDetailModal').classList.add('active');
        lucide.createIcons();
    },

    hideDetailModal() {
        document.getElementById('dateDetailModal').classList.remove('active');
        this.selectedDate = null;
    },

    getMockArticles() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const yesterday = String(today.getDate() - 1).padStart(2, '0');
        const tomorrow = String(today.getDate() + 1).padStart(2, '0');

        return [
            {
                id: 1,
                title: '考研调剂系统3天后开放！2026年这5个变化...',
                type: 'analysis',
                date: `${year}-${month}-${day}`,
                time_slot: '上午'
            },
            {
                id: 2,
                title: '2026全球计算机专业排名出炉：清华上交并列第一...',
                type: 'analysis',
                date: `${year}-${month}-${day}`,
                time_slot: '下午'
            },
            {
                id: 3,
                title: '从农村走出的AI创业者：李明的故事',
                type: 'story',
                date: `${year}-${month}-${yesterday}`,
                time_slot: '上午'
            },
            {
                id: 4,
                title: '2024年AI写作工具深度评测',
                type: 'analysis',
                date: `${year}-${month}-${tomorrow}`,
                time_slot: '上午'
            },
            {
                id: 5,
                title: '退休教师的第二人生：用AI创作温暖千万人',
                type: 'story',
                date: `${year}-${month}-${tomorrow}`,
                time_slot: '下午'
            }
        ];
    }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    CalendarPage.init();
});
