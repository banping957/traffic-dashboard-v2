/**
 * 素材库页面脚本
 */

const MaterialsPage = {
    materials: [],
    currentPreview: null,

    init() {
        this.loadMaterials();
        this.bindEvents();
    },

    bindEvents() {
        // 上传按钮
        document.getElementById('uploadBtn')?.addEventListener('click', () => {
            ToastManager.info('上传功能开发中...');
        });

        // 关闭预览
        document.getElementById('closePreview')?.addEventListener('click', () => {
            this.closePreview();
        });

        // 复制图片链接
        document.getElementById('copyImageUrl')?.addEventListener('click', () => {
            this.copyImageUrl();
        });

        // 下载图片
        document.getElementById('downloadImage')?.addEventListener('click', () => {
            this.downloadImage();
        });

        // 点击遮罩关闭
        document.querySelector('#imagePreviewModal .modal-overlay')?.addEventListener('click', () => {
            this.closePreview();
        });

        // ESC键关闭预览
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePreview();
            }
        });
    },

    async loadMaterials() {
        const grid = document.getElementById('materialsGrid');

        try {
            // 尝试从Supabase加载
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.materials = data || [];

            if (this.materials.length === 0) {
                // 使用模拟数据
                this.materials = this.getMockMaterials();
            }

        } catch (error) {
            console.error('加载素材失败:', error);
            this.materials = this.getMockMaterials();
        }

        this.renderMaterials();
        this.updateStats();
    },

    renderMaterials() {
        const grid = document.getElementById('materialsGrid');

        if (this.materials.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="image"></i>
                    <p>暂无素材</p>
                    <button class="btn btn-primary mt-4" onclick="MaterialsPage.triggerUpload()">
                        <i data-lucide="upload"></i>
                        <span>上传素材</span>
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.materials.map(material => this.createMaterialCard(material)).join('');

        // 绑定卡片点击事件
        grid.querySelectorAll('.material-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.material-actions')) {
                    const id = card.dataset.id;
                    this.openPreview(id);
                }
            });
        });

        lucide.createIcons();
    },

    createMaterialCard(material) {
        const size = this.formatFileSize(material.size || 0);
        const date = this.formatDate(material.created_at);

        return `
            <div class="material-card" data-id="${material.id}">
                <div class="material-image">
                    <img src="${material.url}" alt="${material.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
                </div>
                <div class="material-info">
                    <div class="material-name" title="${material.name}">${material.name}</div>
                    <div class="material-meta">
                        <span>${size}</span>
                        <span>${date}</span>
                    </div>
                </div>
                <div class="material-actions">
                    <button class="btn-icon" title="复制链接" onclick="event.stopPropagation(); MaterialsPage.copyMaterialUrl('${material.id}')">
                        <i data-lucide="link"></i>
                    </button>
                    <button class="btn-icon" title="删除" onclick="event.stopPropagation(); MaterialsPage.deleteMaterial('${material.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    },

    updateStats() {
        const totalMaterials = this.materials.length;
        const totalSize = this.materials.reduce((sum, m) => sum + (m.size || 0), 0);

        document.getElementById('totalMaterials').textContent = totalMaterials;
        document.getElementById('totalSize').textContent = this.formatFileSize(totalSize);
    },

    openPreview(id) {
        const material = this.materials.find(m => String(m.id) === String(id));
        if (!material) return;

        this.currentPreview = material;

        const modal = document.getElementById('imagePreviewModal');
        const img = document.getElementById('previewImage');

        img.src = material.url;
        img.alt = material.name;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closePreview() {
        const modal = document.getElementById('imagePreviewModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentPreview = null;
    },

    async copyImageUrl() {
        if (!this.currentPreview) return;

        try {
            await ClipboardManager.copy(this.currentPreview.url);
        } catch (error) {
            ToastManager.error('复制失败');
        }
    },

    downloadImage() {
        if (!this.currentPreview) return;

        const a = document.createElement('a');
        a.href = this.currentPreview.url;
        a.download = this.currentPreview.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        ToastManager.success('开始下载');
    },

    async copyMaterialUrl(id) {
        const material = this.materials.find(m => String(m.id) === String(id));
        if (!material) return;

        try {
            await ClipboardManager.copy(material.url);
        } catch (error) {
            ToastManager.error('复制失败');
        }
    },

    async deleteMaterial(id) {
        if (!confirm('确定要删除这个素材吗？')) return;

        try {
            const { error } = await supabase
                .from('materials')
                .delete()
                .eq('id', id);

            if (error) throw error;

            ToastManager.success('素材已删除');
            this.loadMaterials();

        } catch (error) {
            console.error('删除失败:', error);
            ToastManager.error('删除失败');
        }
    },

    triggerUpload() {
        ToastManager.info('上传功能开发中...');
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    formatDate(dateString) {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
        });
    },

    getMockMaterials() {
        return [
            {
                id: 1,
                name: '封面图-考研调剂.png',
                url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400',
                size: 245760,
                created_at: '2026-03-26T10:00:00Z'
            },
            {
                id: 2,
                name: '封面图-CS排名.png',
                url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
                size: 189440,
                created_at: '2026-03-26T09:30:00Z'
            },
            {
                id: 3,
                name: '人物故事配图.jpg',
                url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                size: 312000,
                created_at: '2026-03-25T14:20:00Z'
            },
            {
                id: 4,
                name: '数据图表-薪资对比.png',
                url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
                size: 156000,
                created_at: '2026-03-25T11:00:00Z'
            },
            {
                id: 5,
                name: '校园风景-清华.jpg',
                url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400',
                size: 420000,
                created_at: '2026-03-24T16:45:00Z'
            },
            {
                id: 6,
                name: 'AI工具截图.png',
                url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
                size: 89000,
                created_at: '2026-03-24T10:30:00Z'
            }
        ];
    }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    MaterialsPage.init();
});
