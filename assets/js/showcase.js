/* Showcase-only interactions. The reusable library lives in qoder-ui.js. */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const qicon = (name, cls) => (window.QIcon ? window.QIcon(name, cls) : '');

  const THEME_CARDS = [
    ['light', 'Light 亮色', 'light'],
    ['forest-light', 'Forest 森林', 'forest-light'],
    ['forest-dark', 'Forest Dark 森林', 'forest-dark'],
    ['bee-light', 'Bee 蜜色', 'bee-light'],
    ['bee-dark', 'Bee Dark 蜜色', 'bee-dark'],
    ['mint-light', 'Mint 薄荷', 'mint-light'],
    ['mint-dark', 'Mint Dark 薄荷', 'mint-dark'],
    ['light-parchment', 'Parchment 羊皮纸', 'light-parchment'],
    ['parchment-dark', 'Parchment Dark 羊皮纸', 'parchment-dark']
  ];

  const ICONS = $$('#q-icon-sprite symbol[id^="q-i-"]')
    .map((symbol) => symbol.id.slice(4));

  const ACCENT_LABELS = {
    default: '默认',
    forest: '森林',
    bee: '蜜色',
    mint: '薄荷',
    parchment: '羊皮纸'
  };

  function currentAccent() {
    return (window.QTheme && window.QTheme.info().accent) || 'default';
  }

  function syncThemePicker() {
    const wrapper = $('[data-q-theme-accent]');
    if (!wrapper) return;
    const accent = currentAccent();
    wrapper.dataset.value = accent;
    const label = $('[data-q-select-label]', wrapper);
    if (label) label.textContent = ACCENT_LABELS[accent] || accent;
    $$('.q-select__option', wrapper).forEach((option) => {
      option.setAttribute('aria-selected', String(option.getAttribute('data-value') === accent));
    });
  }

  function syncThemeUrl() {
    const theme = window.QTheme?.get();
    if (!theme) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('theme') === theme) return;
    url.searchParams.set('theme', theme);
    try {
      window.history.replaceState(window.history.state, '', url);
    } catch (error) { /* The selected theme still persists when URL updates are unavailable. */ }
  }

  function syncThemeCards() {
    const current = window.QTheme ? QTheme.get() : 'light';
    const represented = current === 'dark' ? 'forest-dark' : current;
    $$('[data-theme-card]').forEach((card) => {
      const active = card.getAttribute('data-theme-card') === represented;
      card.classList.toggle('is-current', active);
      card.setAttribute('aria-pressed', String(active));
    });
  }

  function renderThemeCards() {
    const host = $('[data-theme-cards]');
    if (!host) return;
    host.innerHTML = THEME_CARDS.map(([id, name]) => `
      <button type="button" class="dk-theme-card" data-theme-card="${id}" data-theme="${id}">
        <span class="q-sr-only">应用主题：</span>
        <span class="dk-theme-card__preview" aria-hidden="true">
          <span class="dk-theme-card__bar"><i></i><i></i><i></i></span>
          <span class="dk-theme-card__body">
            <span class="dk-theme-card__side"></span>
            <span class="dk-theme-card__pane">
              <span class="dk-theme-card__line"></span>
              <span class="dk-theme-card__line dk-theme-card__line--short"></span>
              <span class="dk-theme-card__pill"></span>
            </span>
          </span>
        </span>
        <span class="dk-theme-card__label">
          <i class="dk-theme-card__dot" aria-hidden="true"></i>
          <span class="dk-theme-card__name">${name}</span>
        </span>
        <span class="dk-theme-card__id">${id}</span>
        <span class="dk-theme-card__check" aria-hidden="true">${qicon('check')}</span>
      </button>
    `).join('');
    $$('[data-theme-card]', host).forEach((card) => {
      card.addEventListener('click', () => {
        window.QTheme?.set(card.getAttribute('data-theme-card'));
      });
    });
    syncThemeCards();
  }

  function renderIcons() {
    const host = $('[data-icon-grid]');
    if (!host) return;
    const aliases = {
      arrow: '箭头', up: '上 向上', down: '下 向下', left: '左 向左', right: '右 向右',
      chevron: '展开 折叠 箭头', folder: '文件夹 目录', file: '文件 文档', open: '打开 展开',
      text: '文本 文字', code: '代码 编程', search: '搜索 查找 放大镜', settings: '设置 齿轮 偏好',
      adjustments: '调节 调整 筛选', palette: '调色板 颜色 配色', sun: '太阳 亮色 日间', moon: '月亮 暗色 夜间',
      plus: '添加 新建 加号', minus: '减号 移除', x: '关闭 取消 错误', check: '勾选 对勾 确认 完成 成功',
      checklist: '清单 任务 列表', alert: '警告 提醒', triangle: '三角形', circle: '圆形 圆',
      square: '方形 方块', info: '信息 提示', help: '帮助 问题', question: '问号 帮助 问题',
      copy: '复制 剪贴板', download: '下载 导出', upload: '上传 导入', link: '链接 连接', external: '外部 跳转',
      edit: '编辑 修改', pencil: '铅笔 编辑', trash: '删除 垃圾桶 回收站', archive: '归档 存档',
      bookmark: '书签 收藏', star: '星星 收藏 评分', heart: '爱心 喜欢 心形', bell: '铃铛 通知',
      bolt: '闪电 快速 能量', sparkles: '闪耀 智能 魔法 星光', wand: '魔法 魔棒',
      terminal: '终端 命令行 控制台', command: '命令 快捷键', keyboard: '键盘 快捷键',
      git: '版本 分支', branch: '分支', database: '数据库 数据', cpu: '芯片 处理器', brain: '大脑 智能 思考',
      cloud: '云 同步', world: '世界 全球 网络', browser: '浏览器 网页', device: '设备', desktop: '桌面 电脑 显示器',
      layout: '布局', sidebar: '侧栏', expand: '展开', collapse: '折叠 收起', grid: '网格',
      dashboard: '仪表盘 面板', window: '窗口', minimize: '最小化', maximize: '最大化',
      dots: '更多 点', grip: '拖动 手柄', vertical: '垂直 竖向', layers: '图层 层级', intersect: '交集 叠层',
      box: '盒子 组件', puzzle: '拼图 插件 扩展', category: '分类', list: '列表',
      player: '播放 媒体', play: '播放 开始', stop: '停止 暂停', volume: '音量 声音',
      microphone: '麦克风 语音 录音', photo: '图片 照片 图像', paperclip: '附件 回形针', send: '发送',
      message: '消息 聊天 对话', user: '用户 账户 人', users: '用户 团队 成员', mood: '表情', smile: '微笑 笑脸',
      lock: '锁定 隐私', shield: '安全 保护', pin: '固定 图钉 置顶', eye: '可见 查看 眼睛',
      clock: '时钟 时间', history: '历史 记录', calendar: '日历 日期', refresh: '刷新 重试',
      repeat: '循环 重复', rotate: '旋转', loader: '加载 等待', rocket: '火箭 启动', target: '目标',
      compass: '指南针 导航', bulb: '灯泡 灵感', tool: '工具', ruler: '尺子 尺寸', measure: '测量',
      scissors: '剪刀 剪切', typography: '字体 排版', book: '书籍 文档 阅读', chart: '图表 数据',
      bar: '柱状 条形', calculator: '计算器', contrast: '对比度', shadow: '阴影', rainbow: '彩虹', letter: '字母'
    };
    host.innerHTML = ICONS.map((name) => {
      const filled = name.endsWith('-filled');
      const keywords = name.split('-').map((part) => aliases[part] || '').join(' ');
      const search = `${name} ${keywords} ${filled ? '实心 填充 filled solid' : '线框 描边 outline stroke'}`;
      return `<button type="button" class="dk-icon-tile" data-icon-name="${name}" data-icon-search="${search}" aria-label="查看图标 ${name}" aria-haspopup="dialog" aria-controls="icon-dialog">
        ${qicon(name, filled ? 'q-icon--filled' : '')}
        <span>${name}</span>
      </button>`;
    }).join('');
  }

  async function copyText(text) {
    const value = String(text);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch (error) { /* Local file previews may need the selection fallback. */ }
    }
    fallbackCopy(value);
  }

  function fallbackCopy(value) {
    const textarea = document.createElement('textarea');
    const previousFocus = document.activeElement;
    textarea.value = value;
    textarea.readOnly = true;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    const host = previousFocus?.closest('dialog[open]') || document.querySelector('dialog[open]:modal') || document.body;
    host.appendChild(textarea);
    textarea.focus({ preventScroll: true });
    textarea.select();
    try {
      if (!document.execCommand('copy')) throw new Error('Clipboard write failed');
    } finally {
      textarea.remove();
      previousFocus?.focus({ preventScroll: true });
    }
  }

  async function copyWithFeedback(value, options) {
    const { title, description, button } = options;
    if (button?.disabled) return;
    const previousFocus = document.activeElement;
    if (button) {
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    }
    try {
      await copyText(value);
      window.QToast?.show({ title, description, type: 'success', duration: 2200 });
    } catch (error) {
      window.QToast?.show({ title: '复制失败', description: '浏览器未允许写入剪贴板，可手动选择文本复制。', type: 'error', duration: 3200 });
    } finally {
      if (button) {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        if (previousFocus === button && (document.activeElement === document.body || document.activeElement?.tagName === 'DIALOG')) {
          button.focus({ preventScroll: true });
        }
      }
    }
  }

  function initCopy() {
    $$('[data-copy-code]').forEach((btn) => {
      if (btn.dataset.copyReady) return;
      btn.dataset.copyReady = 'true';
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.dk-code-wrap');
        const code = wrap?.querySelector('.dk-code');
        if (!code?.textContent) return;
        copyWithFeedback(code.textContent, { title: '示例代码已复制', button: btn });
      });
    });
    $$('[data-token]').forEach((token) => {
      if (token.dataset.copyReady) return;
      token.dataset.copyReady = 'true';
      token.addEventListener('click', () => {
        const name = token.getAttribute('data-token');
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        copyWithFeedback(`${name}: ${value};`, { title: `已复制 ${name}`, description: value, button: token });
      });
    });
    $$('[data-dk-component-link]').forEach((button) => {
      button.addEventListener('click', () => {
        const card = button.closest('.dk-comp');
        if (!card?.id) return;
        const url = new URL(window.location.href);
        url.searchParams.delete('q');
        url.searchParams.delete('category');
        url.searchParams.set('theme', window.QTheme?.get() || 'light');
        url.hash = card.id;
        copyWithFeedback(url.href, { title: '组件链接已复制', description: '保留当前主题，并直接定位到这组组件。', button });
      });
    });
  }

  function downloadText(value, filename, type) {
    const url = URL.createObjectURL(new Blob([value], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    (document.querySelector('dialog[open]:modal') || document.body).append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function initIconInspector() {
    const dialog = $('#icon-dialog');
    const host = $('[data-icon-grid]');
    if (!dialog || !host) return;
    const title = $('#icon-dialog-title');
    const preview = $('[data-icon-preview]', dialog);
    const code = $('[data-icon-svg-code]', dialog);
    const style = $('[data-icon-style-label]', dialog);
    let current = null;
    let lastTrigger = null;
    host.addEventListener('click', (event) => {
      const tile = event.target.closest('[data-icon-name]');
      const name = tile?.dataset.iconName;
      const symbol = name && document.getElementById(`q-i-${name}`);
      if (!symbol) return;
      const filled = name.endsWith('-filled');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const attributes = {
        xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24',
        viewBox: symbol.getAttribute('viewBox') || '0 0 24 24', fill: filled ? 'currentColor' : 'none',
        'aria-hidden': 'true', focusable: 'false'
      };
      if (!filled) Object.assign(attributes, { stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      Object.entries(attributes).forEach(([key, value]) => svg.setAttribute(key, value));
      svg.innerHTML = symbol.innerHTML;
      current = {
        name,
        svg: new XMLSerializer().serializeToString(svg),
        html: `<svg class="q-icon${filled ? ' q-icon--filled' : ''}" aria-hidden="true" focusable="false"><use href="#q-i-${name}"></use></svg>`
      };
      title.textContent = name;
      preview.replaceChildren(svg);
      code.textContent = current.svg;
      style.textContent = filled ? '实心 · currentColor' : '线框 · 2px 描边';
      lastTrigger = tile;
      if (!dialog.open) dialog.showModal();
      dialog.setAttribute('data-state', 'open');
    });
    const bindings = [
      ['[data-icon-copy-name]', 'name', '图标名称已复制'],
      ['[data-icon-copy-svg]', 'svg', '独立 SVG 已复制'],
      ['[data-icon-copy-html]', 'html', '图标 HTML 已复制']
    ];
    bindings.forEach(([selector, key, label]) => {
      const button = $(selector, dialog);
      button?.addEventListener('click', () => {
        if (current) copyWithFeedback(current[key], { title: label, description: current.name, button });
      });
    });
    $('[data-icon-download]', dialog)?.addEventListener('click', () => {
      if (current) downloadText(`<!-- Tabler Icons, MIT license: https://tabler.io/icons -->\n${current.svg}\n`, `${current.name}.svg`, 'image/svg+xml;charset=utf-8');
    });
    dialog.addEventListener('close', () => {
      if (lastTrigger?.isConnected && !lastTrigger.hidden) lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    });
  }

  function initNavSpy() {
    const links = $$('[data-nav-link]');
    if (!links.length) return;
    const ids = [...new Set(links.map((link) => link.getAttribute('href')?.slice(1)).filter(Boolean))];
    const sections = ids.map((id) => ({ id, el: document.getElementById(id) })).filter((entry) => entry.el);
    if (!sections.length) return;
    const crumb = $('[data-dk-crumb]');
    let frame = null;
    const update = () => {
      frame = null;
      const marker = window.scrollY + Math.min(window.innerHeight * 0.3, 280);
      let current = sections[0].id;
      sections.forEach((entry) => {
        if (entry.el.getBoundingClientRect().top + window.scrollY <= marker) current = entry.id;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) current = sections[sections.length - 1].id;
      links.forEach((link) => {
        const active = link.getAttribute('href') === `#${current}`;
        link.classList.toggle('is-active', active);
        if (active) {
          link.setAttribute('aria-current', 'location');
          if (crumb && link.closest('.dk-sidebar')) crumb.textContent = $('span', link)?.textContent || '';
        } else link.removeAttribute('aria-current');
      });
    };
    const requestUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    if (typeof ResizeObserver === 'function') {
      const main = $('.dk-main');
      if (main) new ResizeObserver(requestUpdate).observe(main);
    }
    update();
  }

  function initPageChrome() {
    const root = document.documentElement;
    const progress = $('[data-dk-progress]');
    const toTop = $('[data-dk-to-top]');
    const header = $('[data-dk-header]');
    let frame = null;
    let maxScroll = 0;
    const measure = () => {
      maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
    };
    const updateScroll = () => {
      frame = null;
      const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
      if (progress) progress.style.transform = `scaleX(${pct / 100})`;
      const showToTop = window.scrollY > 620;
      toTop?.classList.toggle('is-visible', showToTop);
      if (showToTop) toTop.style.setProperty('--dk-scroll', String(pct));
      header?.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    const requestScrollUpdate = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(updateScroll);
    };
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', () => {
      measure();
      requestScrollUpdate();
    });
    if (typeof ResizeObserver === 'function') {
      const main = $('.dk-main');
      if (main) new ResizeObserver(() => {
        measure();
        requestScrollUpdate();
      }).observe(main);
    }
    toTop?.addEventListener('click', () => {
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
    measure();
    updateScroll();

    const themeMeta = document.querySelector('[data-q-theme-color]');
    const syncThemeMeta = () => {
      if (!themeMeta) return;
      const color = getComputedStyle(root).getPropertyValue('--q-fill-tertiary').trim();
      if (color) themeMeta.setAttribute('content', color);
    };
    syncThemeMeta();
    document.addEventListener('q:themechange', syncThemeMeta);

    const sheet = document.getElementById('dk-nav-sheet');
    if (sheet) {
      const openSheet = () => {
        if (!sheet.open && typeof sheet.showModal === 'function') sheet.showModal();
        else sheet.setAttribute('open', '');
        sheet.setAttribute('data-state', 'open');
        $$('[data-dk-menu-open]').forEach((btn) => btn.setAttribute('aria-expanded', 'true'));
      };
      $$('[data-dk-menu-open]').forEach((btn) => {
        if (btn.dataset.dkMenuReady) return;
        btn.dataset.dkMenuReady = 'true';
        btn.addEventListener('click', openSheet);
      });
      $$('[data-dk-menu-close]', sheet).forEach((btn) => btn.addEventListener('click', () => sheet.close()));
      $$('[data-dk-sheet-search]', sheet).forEach((btn) => btn.addEventListener('click', () => {
        sheet.close();
        const searchTrigger = $('.dk-search-trigger');
        searchTrigger?.focus({ preventScroll: true });
        searchTrigger?.click();
      }));
      $$('a[href^="#"]', sheet).forEach((link) => link.addEventListener('click', () => sheet.close()));
      sheet.addEventListener('close', () => {
        sheet.removeAttribute('data-state');
        $$('[data-dk-menu-open]').forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
      });
      const accentButtons = $$('[data-dk-accent]', sheet);
      const syncAccents = () => {
        if (!window.QTheme || !accentButtons.length) return;
        const accent = QTheme.info().accent;
        accentButtons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.getAttribute('data-dk-accent') === accent)));
      };
      accentButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          window.QTheme?.apply(btn.getAttribute('data-dk-accent'), QTheme.info().mode);
          syncAccents();
        });
      });
      syncAccents();
      document.addEventListener('q:themechange', syncAccents);
    }

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealItems = $$('.dk-flow, .dk-section-head, .dk-closing');
    if (typeof IntersectionObserver === 'function' && revealItems.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          if (motion.matches || root.dataset.visualEffects === 'off') return;
          entry.target.classList.add('dk-reveal');
        });
      }, { rootMargin: '0px 0px -12px 0px', threshold: 0 });
      revealItems.forEach((el) => observer.observe(el));
    }
  }

  function scrollDemoToBottom(app) {
    const scroller = app?.querySelector('[data-demo-scroll]');
    if (!scroller) return;
    requestAnimationFrame(() => {
      scroller.scrollTop = scroller.scrollHeight;
    });
  }

  function makeUserMessage(text) {
    const message = document.createElement('div');
    message.className = 'q-message q-message--user';
    const stack = document.createElement('div');
    stack.className = 'q-message-stack';
    const bubble = document.createElement('div');
    bubble.className = 'q-user-bubble';
    bubble.textContent = text;
    const meta = document.createElement('div');
    meta.className = 'q-message-meta';
    meta.innerHTML = '<span>刚刚</span>';
    stack.append(bubble, meta);
    message.append(stack);
    return message;
  }

  function makePendingMessage() {
    const message = document.createElement('div');
    message.className = 'q-message q-message--assistant';
    message.setAttribute('data-demo-pending', 'true');
    message.innerHTML = `
      <div class="q-assistant-avatar">${qicon('sparkles')}</div>
      <div class="q-assistant-body">
        <div class="q-activity">
          <div class="q-activity__row">
            <span class="q-thinking" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
            <span class="q-activity__label">正在执行中</span>
            <span class="q-activity__time">思考中</span>
          </div>
          <div class="q-activity__detail">
            ${qicon('sparkles')}
            <span class="q-activity__detail-text q-activity__shimmer">正在组织回复并检查组件规范…</span>
          </div>
        </div>
      </div>
    `;
    return message;
  }

  function makeDemoReply(text) {
    const message = document.createElement('div');
    message.className = 'q-message q-message--assistant';
    message.innerHTML = `
      <div class="q-assistant-avatar">${qicon('sparkles')}</div>
      <div class="q-assistant-body">
        <div class="q-activity">
          <div class="q-activity__row q-activity__row--done">
            ${qicon('circle-check')}
            <span class="q-activity__label">已完成</span>
            <span class="q-activity__time">1.2s</span>
          </div>
        </div>
        <div class="q-prose">
          <p>收到：“<span data-demo-echo></span>”</p>
          <p>这是可交互的示例回复。在真实产品中，这里会接入 Agent 后端、流式输出与工具调用；本示例用于展示 <strong>14px / 24px 正文、12px 用户气泡、20px Composer 圆角</strong> 等排版规格。</p>
          <ul>
            <li>主题由 <code>data-theme</code> 驱动，可实时切换 9 套配色；</li>
            <li>菜单、弹窗、Select、Tabs、Switch 与 Toast 均为无依赖实现；</li>
            <li>所有界面值都来自 Qoder CN 0.4.8 的编译产物。</li>
          </ul>
        </div>
        <div class="q-assistant-actions">
          <button type="button" class="q-icon-btn q-icon-btn--ghost q-icon-btn--sm" title="复制">${qicon('copy')}</button>
          <button type="button" class="q-icon-btn q-icon-btn--ghost q-icon-btn--sm" title="重新生成">${qicon('refresh')}</button>
          <button type="button" class="q-icon-btn q-icon-btn--ghost q-icon-btn--sm" title="更多">${qicon('dots')}</button>
        </div>
      </div>
    `;
    const echo = message.querySelector('[data-demo-echo]');
    if (echo) echo.textContent = text;
    return message;
  }

  function initDemo() {
    const app = $('[data-demo-app]');
    if (!app) return;
    const composer = app.querySelector('[data-chat-composer]');
    const timeline = app.querySelector('[data-demo-timeline]');
    const windowEl = app.closest('.q-window') || app;
    const chatWidthSwitch = document.querySelector('[data-demo-chat-width]');
    const fontInputs = $$('[data-demo-fontsize] input[type="radio"]');
    let running = false;
    let pending = null;
    let replyTimer = null;
    let generation = 0;

    function setFontSize(size) {
      app.dataset.fontSize = size;
      fontInputs.forEach((input) => { input.checked = input.value === size; });
    }

    fontInputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.checked) setFontSize(input.value);
      });
    });

    chatWidthSwitch?.addEventListener('q:switch', (event) => {
      app.dataset.chatWidth = event.detail.checked ? 'wide' : 'default';
    });

    function finishReply(text, token) {
      if (token !== generation) return;
      replyTimer = null;
      pending?.remove();
      pending = null;
      timeline?.appendChild(makeDemoReply(text));
      running = false;
      window.QComposer?.setRunning(composer, false);
      scrollDemoToBottom(app);
    }

    composer?.addEventListener('q:composer-submit', (event) => {
      if (running) {
        event.preventDefault();
        return;
      }
      const text = event.detail.value;
      if (!text) return;
      timeline?.appendChild(makeUserMessage(text));
      scrollDemoToBottom(app);
      pending = makePendingMessage();
      timeline?.appendChild(pending);
      running = true;
      window.QComposer?.setRunning(composer, true);
      scrollDemoToBottom(app);
      const token = ++generation;
      replyTimer = window.setTimeout(() => finishReply(text, token), 1200);
    });

    composer?.addEventListener('q:composer-stop', () => {
      if (!running) return;
      generation += 1;
      if (replyTimer) { window.clearTimeout(replyTimer); replyTimer = null; }
      running = false;
      pending?.remove();
      pending = null;
      window.QComposer?.setRunning(composer, false);
      window.QToast?.show({ title: '已停止生成', description: '示例任务已取消。', type: 'warning', duration: 2400 });
    });

    app.addEventListener('q:menu-select', (event) => {
      const { item, menu, value } = event.detail;
      if (menu?.id === 'permissions-menu') {
        const label = item.querySelector('[data-option-label]')?.textContent?.trim() || item.textContent.trim();
        const target = app.querySelector('[data-permission-label]');
        if (target) target.textContent = label;
        $$('.q-menu__item', menu).forEach((el) => el.classList.toggle('q-menu__item--checked', el === item));
        window.QToast?.show({ title: '权限模式已更新', description: label, type: 'info', duration: 2400 });
        return;
      }
      if (value === 'about') {
        window.QToast?.show({ title: 'Qoder Design Kit', description: '源码级还原的 Qoder UI 设计系统 · 非官方项目。', type: 'info', duration: 3600 });
      }
      if (value === 'docs') {
        document.getElementById('usage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (value === 'wide-chat') {
        const next = !chatWidthSwitch ? true : chatWidthSwitch.getAttribute('aria-checked') !== 'true';
        if (chatWidthSwitch) {
          chatWidthSwitch.setAttribute('aria-checked', String(next));
          app.dataset.chatWidth = next ? 'wide' : 'default';
        }
      }
      if (value === 'toggle-sidebar') {
        app.querySelector('[data-q-sidebar-toggle]')?.click();
      }
      if (value === 'toggle-artifacts') {
        app.querySelector('[data-q-artifacts-toggle]')?.click();
      }
      if (value === 'reset-layout') resetLayout();
    });

    function resetLayout() {
      windowEl.classList.remove('is-sidebar-collapsed', 'is-artifacts-hidden');
      const sidebar = windowEl.querySelector('.q-sidebar');
      if (sidebar) sidebar.style.width = '';
      windowEl.style.removeProperty('--q-sidebar-width');
      app.dataset.chatWidth = 'wide';
      if (chatWidthSwitch) chatWidthSwitch.setAttribute('aria-checked', 'true');
      setFontSize('medium');
      const monitor = windowEl.querySelector('[data-q-artifacts-toggle]');
      monitor?.setAttribute('aria-pressed', 'true');
      window.QToast?.show({ title: '布局已重置', type: 'success', duration: 2000 });
    }

    $('[data-demo-reset]')?.addEventListener('click', resetLayout);
    setFontSize(app.dataset.fontSize || 'medium');
  }

  function initIndeterminate() {
    $$('[data-indeterminate]').forEach((input) => {
      input.indeterminate = true;
    });
  }

  function initSettingsDemo() {
    const previews = $$('[data-theme-preview]');
    const themeMode = $('[data-settings-theme-mode]');
    const formatMode = (mode) => (mode === 'dark' ? '深色' : '浅色');
    const syncThemeMode = () => {
      if (!themeMode) return;
      const mode = window.QTheme?.info().mode || 'light';
      const label = themeMode.querySelector('[data-q-select-label]');
      const option = themeMode.querySelector(`.q-select__option[data-value="${mode}"]`);
      if (label) label.textContent = formatMode(mode);
      $$('.q-select__option', themeMode).forEach((item) => {
        item.setAttribute('aria-selected', String(item === option));
      });
    };
    const syncPreviews = () => {
      if (!previews.length || !window.QTheme) return;
      const current = QTheme.get();
      const represented = current === 'dark' ? 'forest-dark' : current;
      previews.forEach((preview) => {
        preview.setAttribute('aria-pressed', String(preview.getAttribute('data-theme-preview') === represented));
      });
    };
    previews.forEach((preview) => {
      preview.addEventListener('click', () => {
        const theme = preview.getAttribute('data-theme-preview');
        if (theme) window.QTheme?.set(theme);
      });
    });
    themeMode?.addEventListener('q:select', (event) => {
      const value = event.detail.value;
      const mode = value === 'system'
        ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : value;
      window.QTheme?.apply(window.QTheme.info().accent, mode);
    });
    $$('[data-settings-chat-width]').forEach((input) => {
      input.addEventListener('change', () => {
        const app = $('[data-demo-app]');
        if (!app) return;
        app.dataset.chatWidth = input.value === 'wide' ? 'wide' : 'default';
        const sw = $('[data-demo-chat-width]');
        sw?.setAttribute('aria-checked', String(input.value === 'wide'));
      });
    });
    syncPreviews();
    syncThemeMode();
    document.addEventListener('q:themechange', () => {
      syncPreviews();
      syncThemeMode();
    });
  }

  /* Generate content synchronously so the library can initialize it. */
  renderThemeCards();
  renderIcons();

  function completePage(title, markup) {
    const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
    const theme = window.QTheme?.get() || 'light';
    return `<!doctype html>
<html lang="zh-CN" data-theme="${theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${escape(title)} · Qoder Design Kit</title>
  <!-- Place this file in the design kit root, or adjust the assets/ paths. -->
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <style>
    body { margin: 0; background: var(--q-bg-layout); color: var(--q-text); font-family: var(--q-font-ui); }
    main { max-width: 880px; margin: 0 auto; padding: 24px; }
    h1 { margin: 0 0 24px; font-size: 20px; font-weight: 500; }
    .example { display: grid; gap: 16px; min-width: 0; }
    .example > * { min-width: 0; }
  </style>
</head>
<body>
  <main>
    <h1>${escape(title)}</h1>
    <div class="example" data-q-tab-group>
${markup.split('\n').map((line) => `      ${line}`).join('\n')}
    </div>
  </main>
  <script src="assets/js/qoder-icons.js"></script>
  <script src="assets/js/qoder-ui.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => QTheme.set('${theme}', { persist: false, animate: false }));
  </script>
</body>
</html>`;
  }

  function initCodeExpand() {
    const dialog = document.getElementById('code-dialog');
    const dialogCode = dialog ? $('[data-code-dialog-code]', dialog) : null;
    const dialogTitle = dialog ? $('#code-dialog-title') : null;
    const dialogLang = dialog ? $('[data-code-dialog-lang]', dialog) : null;
    const dialogCopy = dialog ? $('[data-code-dialog-copy]', dialog) : null;
    const dialogPage = dialog ? $('[data-code-dialog-page]', dialog) : null;
    const modes = dialog ? $('[data-code-modes]', dialog) : null;
    const footer = dialog ? $('[data-code-footer]', dialog) : null;
    const note = dialog ? $('[data-code-note]', dialog) : null;
    const snippetTab = $('#code-snippet-tab');
    const pageTab = $('#code-page-tab');
    let current = null;
    let lastTrigger = null;

    const syncMode = () => {
      const pageSelected = pageTab?.getAttribute('aria-selected') === 'true';
      const label = dialogCopy?.querySelector('[data-code-copy-label]');
      if (label) label.textContent = pageSelected ? '复制页面' : '复制代码';
      if (note) note.textContent = pageSelected
        ? '完整页面已包含依赖引用。请放在套件根目录，或调整 assets/ 路径。'
        : '组件片段需配合 tokens.css、components.css 和组件脚本使用。';
    };

    const openDialog = ({ title, lang, text, trigger, componentId }) => {
      if (!dialog || !dialogCode) return;
      if (dialogTitle) dialogTitle.textContent = title;
      if (dialogLang) dialogLang.textContent = lang;
      dialogCode.textContent = text;
      current = componentId ? { title, markup: text, filename: `qdk-${componentId.slice('component-'.length)}.html` } : null;
      if (modes) modes.hidden = !current;
      if (footer) footer.hidden = !current;
      if (dialogPage) dialogPage.textContent = current ? completePage(title, text) : '';
      snippetTab?.click();
      const snippetPanel = $('#code-snippet-panel');
      snippetPanel?.setAttribute('role', current ? 'tabpanel' : 'region');
      snippetPanel?.setAttribute('aria-labelledby', current ? 'code-snippet-tab' : 'code-dialog-title');
      syncMode();
      lastTrigger = trigger || null;
      if (!dialog.open) dialog.showModal();
      dialog.setAttribute('data-state', 'open');
    };

    if (dialog && dialogCode) {
      dialogCopy?.addEventListener('click', () => {
        const pageSelected = pageTab?.getAttribute('aria-selected') === 'true';
        const text = pageSelected ? dialogPage?.textContent : dialogCode.textContent;
        if (text) copyWithFeedback(text, { title: pageSelected ? '完整页面已复制' : '示例代码已复制', button: dialogCopy });
      });
      modes?.addEventListener('q:tab-change', syncMode);
      $('[data-code-download]', dialog)?.addEventListener('click', () => {
        if (current && dialogPage?.textContent) downloadText(dialogPage.textContent, current.filename, 'text/html;charset=utf-8');
      });
      document.addEventListener('q:themechange', () => {
        if (current && dialogPage) dialogPage.textContent = completePage(current.title, current.markup);
      });
      dialog.addEventListener('close', () => {
        if (lastTrigger) lastTrigger.focus({ preventScroll: true });
        lastTrigger = null;
      });
    }

    $$('[data-code-collapse]').forEach((wrap) => {
      const code = $('.dk-code', wrap);
      const toggle = $('[data-code-toggle]', wrap);
      if (!code || !toggle) return;
      const card = wrap.closest('.dk-code-card');
      const title = $('.dk-code-card__title', card)?.textContent?.trim() || '示例代码';
      toggle.setAttribute('aria-label', `展开示例：${title}`);
      const syncOverflow = () => {
        const overflows = code.scrollHeight > code.clientHeight + 1;
        wrap.classList.toggle('has-overflow', overflows);
        toggle.hidden = !overflows;
      };
      syncOverflow();
      if (document.fonts?.ready) document.fonts.ready.then(syncOverflow).catch(() => {});
      toggle.addEventListener('click', () => {
        const lang = $('.dk-source-tag', card)?.textContent?.trim() || '';
        openDialog({
          title,
          lang,
          text: code.textContent || '',
          trigger: toggle
        });
      });
    });

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest?.('[data-dk-code-open]');
      if (!trigger) return;
      const code = trigger.parentElement?.querySelector('.dk-code');
      if (!code) return;
      event.preventDefault();
      const card = trigger.closest('.dk-comp');
      openDialog({
        title: card?.querySelector('.dk-card__title')?.textContent?.trim() || '示例代码',
        lang: 'HTML',
        text: code.textContent,
        trigger,
        componentId: card?.id
      });
    });
  }

  function initMotionDemo() {
    const demo = $('.dk-motion');
    if (!demo) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const canPlay = () => !reduce?.matches && document.documentElement.dataset.visualEffects !== 'off';
    let demoTimer = null;
    let pauseTimer = null;
    let visible = false;
    const clearTimers = () => {
      window.clearTimeout(demoTimer);
      window.clearTimeout(pauseTimer);
      demoTimer = null;
      pauseTimer = null;
      demo.classList.remove('is-demo');
    };
    const stop = () => {
      visible = false;
      clearTimers();
    };
    const cycle = () => {
      demoTimer = null;
      if (!visible || !canPlay()) return;
      demo.classList.add('is-demo');
      demoTimer = window.setTimeout(() => {
        demo.classList.remove('is-demo');
        pauseTimer = window.setTimeout(cycle, 500);
      }, 850);
    };
    const start = () => {
      if (demoTimer || pauseTimer) return;
      cycle();
    };
    if (typeof IntersectionObserver !== 'function') {
      visible = true;
      cycle();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          stop();
          return;
        }
        visible = true;
        start();
      });
    }, { threshold: 0.55 });
    observer.observe(demo);
  }

  function init() {
    syncThemePicker();
    syncThemeCards();
    initCopy();
    initIconInspector();
    initCodeExpand();
    initMotionDemo();
    initNavSpy();
    initPageChrome();
    initDemo();
    initIndeterminate();
    initSettingsDemo();
    document.addEventListener('q:themechange', () => {
      syncThemePicker();
      syncThemeCards();
      syncThemeUrl();
    });
    document.addEventListener('q:select', (event) => {
      const target = event.target.closest?.('[data-q-theme-accent]');
      if (!target) return;
      const mode = window.QTheme?.info().mode || 'light';
      window.QTheme?.apply(event.detail.value, mode);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
