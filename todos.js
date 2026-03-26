/**
 * 待办事项页面脚本
 */

const TodosPage = {
    todos: [],

    init() {
        this.loadTodos();
        this.bindEvents();
    },

    bindEvents() {
        // 新建待办按钮
        document.getElementById('addTodoBtn')?.addEventListener('click', () => {
            this.showAddModal();
        });

        // 关闭弹窗
        document.getElementById('closeAddModal')?.addEventListener('click', () => {
            this.hideAddModal();
        });

        document.getElementById('cancelAdd')?.addEventListener('click', () => {
            this.hideAddModal();
        });

        // 确认添加
        document.getElementById('confirmAdd')?.addEventListener('click', () => {
            this.addTodo();
        });

        // 点击遮罩关闭
        document.querySelector('#addTodoModal .modal-overlay')?.addEventListener('click', () => {
            this.hideAddModal();
        });

        // 回车提交
        document.getElementById('todoContent')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    },

    async loadTodos() {
        try {
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.todos = data || [];

            if (this.todos.length === 0) {
                this.todos = this.getMockTodos();
            }

        } catch (error) {
            console.error('加载待办失败:', error);
            this.todos = this.getMockTodos();
        }

        this.renderTodos();
        this.updateStats();
    },

    renderTodos() {
        const list = document.getElementById('todosList');

        if (this.todos.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="check-circle"></i>
                    <p>暂无待办事项</p>
                    <button class="btn btn-primary mt-4" onclick="TodosPage.showAddModal()">
                        <i data-lucide="plus"></i>
                        <span>新建待办</span>
                    </button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // 排序：未完成的在前，按优先级排序
        const sortedTodos = [...this.todos].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        list.innerHTML = sortedTodos.map(todo => this.createTodoItem(todo)).join('');

        // 绑定复选框事件
        list.querySelectorAll('.todo-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.closest('.todo-item').dataset.id;
                this.toggleTodo(id, e.target.checked);
            });
        });

        // 绑定删除按钮事件
        list.querySelectorAll('.todo-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.todo-item').dataset.id;
                this.deleteTodo(id);
            });
        });

        lucide.createIcons();
    },

    createTodoItem(todo) {
        const priorityText = {
            high: '高',
            medium: '中',
            low: '低'
        };

        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <label class="todo-checkbox">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                </label>
                <span class="todo-content">${this.escapeHtml(todo.content)}</span>
                <div class="todo-meta">
                    <span class="todo-priority ${todo.priority}">${priorityText[todo.priority]}</span>
                    <span class="todo-date">${this.formatDate(todo.created_at)}</span>
                </div>
                <div class="todo-actions">
                    <button class="btn-icon todo-delete" title="删除">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    },

    async toggleTodo(id, completed) {
        try {
            const { error } = await supabase
                .from('todos')
                .update({ completed })
                .eq('id', id);

            if (error) throw error;

            const todo = this.todos.find(t => String(t.id) === String(id));
            if (todo) {
                todo.completed = completed;
            }

            this.renderTodos();
            this.updateStats();

            if (completed) {
                ToastManager.success('已完成');
            }

        } catch (error) {
            console.error('更新失败:', error);
            ToastManager.error('更新失败');
        }
    },

    async deleteTodo(id) {
        if (!confirm('确定要删除这个待办吗？')) return;

        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.todos = this.todos.filter(t => String(t.id) !== String(id));
            this.renderTodos();
            this.updateStats();

            ToastManager.success('已删除');

        } catch (error) {
            console.error('删除失败:', error);
            ToastManager.error('删除失败');
        }
    },

    showAddModal() {
        document.getElementById('addTodoModal').classList.add('active');
        document.getElementById('todoContent').focus();
    },

    hideAddModal() {
        document.getElementById('addTodoModal').classList.remove('active');
        document.getElementById('todoContent').value = '';
    },

    async addTodo() {
        const content = document.getElementById('todoContent').value.trim();
        if (!content) {
            ToastManager.warning('请输入待办内容');
            return;
        }

        const priority = document.querySelector('input[name="priority"]:checked')?.value || 'medium';

        try {
            const { data, error } = await supabase
                .from('todos')
                .insert([{
                    content,
                    priority,
                    completed: false
                }])
                .select()
                .single();

            if (error) throw error;

            this.todos.unshift(data);
            this.renderTodos();
            this.updateStats();
            this.hideAddModal();

            ToastManager.success('添加成功');

        } catch (error) {
            console.error('添加失败:', error);
            ToastManager.error('添加失败');
        }
    },

    updateStats() {
        const pending = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;

        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('completedCount').textContent = completed;
    },

    formatDate(dateString) {
        if (!dateString) return '--';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // 今天
        if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
            return '今天';
        }

        // 昨天
        if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
            return '昨天';
        }

        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getMockTodos() {
        return [
            {
                id: 1,
                content: '完成考研调剂文章撰写',
                priority: 'high',
                completed: false,
                created_at: '2026-03-26T10:00:00Z'
            },
            {
                id: 2,
                content: '整理CS排名数据',
                priority: 'high',
                completed: false,
                created_at: '2026-03-26T09:30:00Z'
            },
            {
                id: 3,
                content: '更新素材库图片',
                priority: 'medium',
                completed: true,
                created_at: '2026-03-25T14:00:00Z'
            },
            {
                id: 4,
                content: '检查文章格式规范',
                priority: 'medium',
                completed: false,
                created_at: '2026-03-25T11:00:00Z'
            },
            {
                id: 5,
                content: '备份数据库',
                priority: 'low',
                completed: true,
                created_at: '2026-03-24T16:00:00Z'
            }
        ];
    }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    TodosPage.init();
});
