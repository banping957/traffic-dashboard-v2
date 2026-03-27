/**
 * OpenClaw 多平台发布管理模块
 * 
 * 集成到现有 traffic-dashboard 系统
 */

// ============================================
// 平台管理模块
// ============================================
const PlatformManager = {
  SUPABASE_URL: 'https://vysmewebafmoaatsqxtc.supabase.co',
  SUPABASE_KEY: 'sb_publishable_iiTKpO8PmynFxiV74Oq-KA_FBugqEo0',

  // 获取所有平台配置
  async getPlatforms() {
    try {
      const response = await fetch(`${this.SUPABASE_URL}/rest/v1/platforms?select=*&order=priority.asc`, {
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('获取平台配置失败:', error);
      return [];
    }
  },

  // 获取文章的平台适配内容
  async getPlatformContents(articleId) {
    try {
      const response = await fetch(
        `${this.SUPABASE_URL}/rest/v1/platform_contents?select=*,platforms(*)&content_id=eq.${articleId}`,
        {
          headers: {
            'apikey': this.SUPABASE_KEY,
            'Authorization': `Bearer ${this.SUPABASE_KEY}`
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('获取平台内容失败:', error);
      return [];
    }
  },

  // 获取发布记录
  async getPublishRecords(articleId) {
    try {
      const response = await fetch(
        `${this.SUPABASE_URL}/rest/v1/publish_records?select=*,platforms(name)&content_id=eq.${articleId}&order=created_at.desc`,
        {
          headers: {
            'apikey': this.SUPABASE_KEY,
            'Authorization': `Bearer ${this.SUPABASE_KEY}`
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('获取发布记录失败:', error);
      return [];
    }
  }
};

// ============================================
// 内容转换模块（简化版）
// ============================================
const ContentTransformer = {
  // 转换内容到指定平台格式
  transform(content, platformId) {
    const transformers = {
      'wechat_mp': this.transformToWechatMP.bind(this),
      'xiaohongshu': this.transformToXiaohongshu.bind(this),
      'douyin': this.transformToDouyin.bind(this),
      'bilibili': this.transformToBilibili.bind(this),
      'zhihu': this.transformToZhihu.bind(this),
    };

    const transformer = transformers[platformId];
    return transformer ? transformer(content) : null;
  },

  // 转换为公众号格式（已有，直接返回）
  transformToWechatMP(content) {
    return {
      title: content.title,
      body: content.content,
      formatted_body: content.content,
      tags: [content.type],
      extras: {
        author: 'OpenClaw',
        digest: content.summary,
        show_cover_pic: true,
        need_open_comment: true
      }
    };
  },

  // 转换为小红书格式
  transformToXiaohongshu(content) {
    // 提取纯文本（去除HTML标签）
    const plainText = content.content.replace(/<[^>]*>/g, '');
    
    // 生成小红书风格内容
    const body = `📖 ${content.summary}\n\n${plainText.slice(0, 800)}\n\n💡 关注我，了解更多教育资讯！`;
    
    return {
      title: content.title.slice(0, 20),
      body: body,
      formatted_body: body,
      tags: ['教育', '高考', '大学', '干货分享'],
      extras: {
        topic_tags: ['#教育', '#高考', '#大学'],
        location: ''
      }
    };
  },

  // 转换为抖音格式（视频脚本）
  transformToDouyin(content) {
    const plainText = content.content.replace(/<[^>]*>/g, '');
    
    // 生成口播脚本
    const videoScript = `🔥 ${content.title}\n\n开头钩子（3秒）：${content.summary.slice(0, 50)}\n\n正文（60秒）：${plainText.slice(0, 300)}\n\n结尾（5秒）：关注我，下期更精彩！`;
    
    return {
      title: content.title.slice(0, 55),
      body: videoScript,
      formatted_body: videoScript,
      tags: ['教育', '知识分享', '高考'],
      extras: {
        video_script: videoScript,
        bgm: '推荐：轻快节奏背景音乐'
      }
    };
  },

  // 转换为B站格式
  transformToBilibili(content) {
    const plainText = content.content.replace(/<[^>]*>/g, '');
    
    return {
      title: `【干货】${content.title}`.slice(0, 80),
      body: `${content.summary}\n\n${plainText.slice(0, 1500)}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📺 视频制作：OpenClaw\n📝 参考资料：${content.file || '网络'}\n\n🏷️ 如果觉得有用，请一键三连支持！`,
      formatted_body: content.content,
      tags: ['知识', '教育', '学习'],
      extras: {
        video_description: plainText.slice(0, 500),
        copyright: '原创'
      }
    };
  },

  // 转换为知乎格式
  transformToZhihu(content) {
    const plainText = content.content.replace(/<[^>]*>/g, '');
    
    return {
      title: content.title,
      body: `## ${content.title}\n\n${plainText}\n\n---\n\n**相关话题：** #教育 #高考 #大学`,
      formatted_body: content.content,
      tags: ['教育', '高考', '大学'],
      extras: {
        format: 'markdown'
      }
    };
  }
};

// ============================================
// 多平台发布UI组件
// ============================================
const MultiPlatformUI = {
  // 渲染平台选择器
  renderPlatformSelector(articleId, platforms) {
    return `
      <div class="platform-selector">
        <h3>📱 多平台发布</h3>
        <div class="platform-list">
          ${platforms.map(p => `
            <div class="platform-item ${p.is_active ? 'active' : 'disabled'}" data-platform="${p.id}">
              <div class="platform-icon">${this.getPlatformIcon(p.id)}</div>
              <div class="platform-info">
                <span class="platform-name">${p.name}</span>
                <span class="platform-status">${p.is_configured ? '已配置' : '未配置'}</span>
              </div>
              <input type="checkbox" ${p.is_active && p.is_configured ? '' : 'disabled'} 
                     data-platform="${p.id}" class="platform-checkbox">
            </div>
          `).join('')}
        </div>
        <div class="platform-actions">
          <button class="btn btn-primary" onclick="MultiPlatformUI.previewTransform(${articleId})">
            <i data-lucide="eye"></i> 预览转换
          </button>
          <button class="btn btn-success" onclick="MultiPlatformUI.publishToPlatforms(${articleId})">
            <i data-lucide="send"></i> 一键发布
          </button>
        </div>
      </div>
    `;
  },

  // 获取平台图标
  getPlatformIcon(platformId) {
    const icons = {
      'wechat_mp': '💬',
      'xiaohongshu': '📕',
      'douyin': '🎵',
      'bilibili': '📺',
      'zhihu': '❓',
      'weibo': '🌐'
    };
    return icons[platformId] || '📱';
  },

  // 预览转换结果
  async previewTransform(articleId) {
    const article = await ArticleManager.getArticle(articleId);
    const selectedPlatforms = Array.from(document.querySelectorAll('.platform-checkbox:checked'))
      .map(cb => cb.dataset.platform);
    
    if (selectedPlatforms.length === 0) {
      ToastManager.warning('请至少选择一个平台');
      return;
    }

    // 生成预览
    const previews = selectedPlatforms.map(platformId => {
      const transformed = ContentTransformer.transform(article, platformId);
      return { platformId, ...transformed };
    });

    // 显示预览弹窗
    this.showPreviewModal(previews);
  },

  // 显示预览弹窗
  showPreviewModal(previews) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content platform-preview-modal">
        <div class="modal-header">
          <h3>📱 平台内容预览</h3>
          <button class="btn-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="platform-tabs">
            ${previews.map((p, i) => `
              <button class="tab-btn ${i === 0 ? 'active' : ''}" data-tab="${p.platformId}">
                ${this.getPlatformIcon(p.platformId)} ${p.platformId}
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

  // 发布到选中的平台
  async publishToPlatforms(articleId) {
    const selectedPlatforms = Array.from(document.querySelectorAll('.platform-checkbox:checked'))
      .map(cb => cb.dataset.platform);
    
    if (selectedPlatforms.length === 0) {
      ToastManager.warning('请至少选择一个平台');
      return;
    }

    ToastManager.success(`开始发布到 ${selectedPlatforms.length} 个平台...`);
    
    // 这里调用后端API进行实际发布
    // 目前先显示预览
    this.previewTransform(articleId);
  }
};

// ============================================
// 集成到现有文章详情弹窗
// ============================================

// 扩展原有的 ArticleManager
ArticleManager.getArticle = async function(id) {
  try {
    const response = await fetch(
      `${this.SUPABASE_URL}/rest/v1/articles?select=*&id=eq.${id}`,
      {
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`
        }
      }
    );
    const articles = await response.json();
    return articles[0];
  } catch (error) {
    console.error('获取文章失败:', error);
    return null;
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlatformManager, ContentTransformer, MultiPlatformUI };
}
