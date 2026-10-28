/* Showcase catalog. Uses the existing samples as the source of copyable HTML.
   Load after qoder-icons.js and before qoder-ui.js; no runtime dependencies. */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const icon = (name) => window.QIcon ? window.QIcon(name) : '';
  const entries = [
    ['Buttons', 'buttons', 'actions', '按钮 button primary outline ghost text 操作', '.q-btn', 3],
    ['Icon buttons', 'icon-buttons', 'actions', '图标按钮 icon button toolbar 工具栏', '.q-icon-btn', 3],
    ['Inputs & fields', 'inputs', 'forms', '输入框 表单 文本 搜索 input field textarea search', '.q-field', 1],
    ['Menus & select', 'menus', 'navigation', '菜单 下拉 选择器 menu select dropdown', '.q-select', 1],
    ['Dialog', 'dialog', 'feedback', '弹窗 对话框 确认 dialog modal', '[data-q-dialog-open]', 1],
    ['Tabs', 'tabs', 'navigation', '标签页 分段 tab segmented pill 切换', '[data-q-tabs]', 1],
    ['Checkbox', 'checkbox', 'forms', '复选框 勾选 半选 checkbox check indeterminate disabled', '.q-checkbox', 4],
    ['Switch / 开关', 'switch', 'forms', '开关 切换 双层 滑块 吸附 switch toggle md sm hover disabled source', '.dk-switch-matrix .q-switch', 8],
    ['Alerts', 'alerts', 'feedback', '警告 提示 成功 错误 alert success error warning', '.q-alert', 2],
    ['Badges & bits', 'badges', 'content', '徽标 徽章 状态标签 键帽 badge avatar kbd pill', '.q-badge, .q-kbd', 4],
    ['Tooltip & toast', 'tooltip-toast', 'feedback', '提示 气泡 通知 tooltip toast notification', '[data-q-toast]', 2],
    ['Loading / 加载动画', 'loading', 'feedback', '加载 动画 启动 loading loader spinner dots boot splash', '.q-loader', 3],
    ['Agent activity', 'agent-activity', 'feedback', '智能体 活动 进度 推理 agent activity thinking task 工具调用', '.q-tool, .q-todo, .q-file-changes', 3],
    ['Composer context', 'composer', 'forms', '输入区 上下文 附件 聊天 composer context attachment chat', '.q-composer', 1],
    ['Command palette', 'command-palette', 'navigation', '命令面板 快捷 搜索 command palette keyboard', '[data-q-command-open]', 1],
    ['Hover card & context menu', 'hover-context', 'navigation', '浮卡 悬停 右键 上下文 菜单 hover card context menu', '.q-hover-card-wrap, [data-q-context-menu]', 2],
    ['File tree', 'file-tree', 'navigation', '文件树 文件夹 折叠 tree file folder explorer', '.q-file-tree', 1],
    ['Radio & slider', 'radio-slider', 'forms', '单选 滑块 选择 范围 radio slider range segmented', '.q-radio-group, .q-slider', 2],
    ['Terminal', 'terminal', 'content', '终端 命令行 控制台 terminal console shell', '.q-terminal', 1],
    ['Chart', 'chart', 'content', '图表 数据 折线 可视化 chart graph plot', '.q-chart', 1],
    ['Empty state / 空状态', 'empty-state', 'feedback', '空状态 无数据 empty state stacked', '.q-empty', 1],
    ['Markdown & code', 'markdown', 'content', '正文 代码 排版 prose markdown code typography', '.q-prose', 1],
    ['四条设计原则', 'principles', 'content', '原则 设计 principles design language', null, 0]
  ];
  const pages = [
    ['overview', '概览', '首页 概览 overview introduction', 'layout-grid'],
    ['foundations', '基础设计', '基础 颜色 字体 圆角 令牌 foundations color typography tokens', 'palette'],
    ['components', '组件目录', '组件 全部 components catalog', 'box'],
    ['app', '应用示例', '应用 工作台 聊天 application workbench chat demo', 'layout-dashboard'],
    ['surfaces', '页面示例', '欢迎 登录 页面 welcome login auth surfaces', 'browser'],
    ['usage', '集成指南', '使用 集成 开始 文档 接入 integration usage getting started docs', 'code']
  ];
  const cards = [];
  const normalize = (value) => String(value || '').normalize('NFKC').toLowerCase().trim();

  function saveSearchState(values) {
    const url = new URL(window.location.href);
    Object.entries(values).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    });
    if (url.href === window.location.href) return;
    try { history.replaceState(history.state, '', url); } catch (error) { /* Filtering also works in file previews. */ }
  }

  function sampleMarkup(card, entry) {
    if (!entry[4]) return '';
    const originals = $$(entry[4], card).slice(0, entry[5]);
    if (!originals.length) return '';
    const samples = [...originals];
    if (entry[1] === 'command-palette') {
      const palette = document.getElementById('command-palette')?.cloneNode(true);
      if (palette) {
        const results = palette.querySelector('.q-command__body');
        const themeCommand = palette.querySelector('[data-command="toggle-theme"]')?.cloneNode(true);
        const empty = palette.querySelector('.q-command__empty')?.cloneNode(true);
        if (results && themeCommand) {
          results.replaceChildren(themeCommand);
          if (empty) results.append(empty);
        }
        samples.push(palette);
      }
    }
    const addReference = (id) => {
      const target = document.getElementById(id);
      if (target && !samples.some((sample) => sample === target || sample.contains(target))) samples.push(target);
    };
    originals.forEach((sample) => {
      [sample, ...$$('[data-q-dialog-open], [data-q-context-menu], [aria-controls], [aria-labelledby], [aria-describedby], [for]', sample)].forEach((node) => {
        ['data-q-dialog-open', 'data-q-context-menu', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'for'].forEach((name) => {
          const refs = node.getAttribute(name);
          if (refs) refs.split(/\s+/).forEach(addReference);
        });
      });
      if (sample.hasAttribute('data-q-tabs')) {
        const group = sample.closest('[data-q-tab-group]');
        $$('[data-q-tab]', sample).forEach((tab) => {
          const value = tab.getAttribute('data-q-tab');
          const panel = group?.querySelector(`[data-q-panel="${CSS.escape(value || '')}"]`);
          if (panel && !samples.includes(panel)) samples.push(panel);
        });
      }
    });
    const markup = samples.map((sample) => {
      const clone = sample.cloneNode(true);
      [clone, ...$$('*', clone)].forEach((node) => {
        const sourceClasses = Array.from(node.classList).filter((name) => !name.startsWith('dk-'));
        if (sourceClasses.length) node.setAttribute('class', sourceClasses.join(' '));
        else node.removeAttribute('class');
        Array.from(node.attributes).forEach((attribute) => {
          if (attribute.name.startsWith('data-dk-') || attribute.name.startsWith('data-demo-')) node.removeAttribute(attribute.name);
        });
      });
      const lines = clone.outerHTML.split('\n');
      const indents = lines.slice(1).filter((line) => line.trim()).map((line) => line.match(/^\s*/)[0].length);
      const common = indents.length ? Math.min(...indents) : 0;
      return lines.map((line, index) => index ? line.slice(Math.min(common, line.match(/^\s*/)[0].length)) : line).join('\n');
    }).join('\n\n');
    return markup;
  }

  function renderCatalog() {
    const byTitle = new Map(entries.map((entry) => [entry[0], entry]));
    $$('.dk-comp-grid > .dk-comp').forEach((card) => {
      const title = $('.dk-card__title', card)?.textContent.trim();
      const entry = byTitle.get(title);
      if (!entry) return;
      card.id = `component-${entry[1]}`;
      card.setAttribute('aria-label', title);
      const description = $('.dk-card__desc', card)?.textContent || '';
      const searchText = `${title} ${entry[3]} ${description}`.normalize('NFKC').toLowerCase();
      cards.push({ card, entry, searchText });
      const markup = sampleMarkup(card, entry);
      const actions = document.createElement('div');
      actions.className = 'dk-component-code';
      if (markup) {
        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'dk-component-code__open';
        open.setAttribute('data-dk-code-open', '');
        open.setAttribute('aria-haspopup', 'dialog');
        open.setAttribute('aria-controls', 'code-dialog');
        open.setAttribute('aria-label', `示例代码 · ${title}`);
        open.innerHTML = `${icon('code')}示例代码<span>HTML</span>`;
        const pre = document.createElement('pre');
        pre.className = 'dk-code';
        pre.hidden = true;
        const code = document.createElement('code');
        code.textContent = markup;
        pre.append(code);
        actions.append(open, pre);
      }
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'dk-component-code__link';
      link.setAttribute('data-dk-component-link', '');
      link.setAttribute('aria-label', `复制链接 · ${title}`);
      link.innerHTML = `${icon('link')}链接`;
      actions.append(link);
      card.append(actions);
    });
  }

  function commandItem(id, label, keywords, glyph, kind) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'q-command__item';
    button.dataset.command = `navigate:#${id}`;
    button.dataset.commandText = keywords;
    button.innerHTML = `${icon(glyph)}<span class="q-command__item-label"></span><span class="q-command__item-meta"></span>`;
    $('.q-command__item-label', button).textContent = label;
    $('.q-command__item-meta', button).textContent = kind;
    return button;
  }

  function renderCommands() {
    const body = $('#command-palette .q-command__body');
    if (!body) return;
    const groups = $$('[data-command-group]', body);
    const newTask = $('[data-command="new-task"]', body);
    const settings = $('[data-command="open-settings"]', body);
    if (newTask) {
      newTask.dataset.command = 'navigate:#surfaces';
      $('.q-command__item-label', newTask).textContent = '体验新会话';
      $('.q-command__item-meta', newTask).textContent = '页面';
    }
    if (settings) {
      settings.dataset.command = 'navigate:#settings-surface';
      $('.q-command__item-label', settings).textContent = '查看设置页面';
      $('.q-command__item-meta', settings).textContent = '页面';
    }
    const pageGroup = groups[1];
    if (pageGroup) {
      pageGroup.replaceChildren();
      const label = document.createElement('div');
      label.className = 'q-command__label';
      label.textContent = '页面导航';
      pageGroup.append(label, ...pages.map(([id, name, keywords, glyph]) => commandItem(id, name, keywords, glyph, '页面')));
    }
    const componentGroup = document.createElement('div');
    componentGroup.className = 'q-command__group';
    componentGroup.setAttribute('data-command-group', '');
    const label = document.createElement('div');
    label.className = 'q-command__label';
    label.textContent = '组件目录';
    componentGroup.append(label, ...cards.map(({ card, entry }) => commandItem(card.id, entry[0], `${entry[0]} ${entry[3]}`, 'box', '组件')));
    body.insertBefore(componentGroup, $('.q-command__empty', body));
  }

  function init() {
    const input = $('[data-dk-component-search]');
    const filters = $$('[data-dk-filter]');
    const count = $('[data-dk-component-count]');
    const empty = $('[data-dk-component-empty]');
    const clear = $('[data-dk-search-clear]');
    let category = 'all';
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get('category');
      category = filters.some((button) => button.dataset.dkFilter === requested) ? requested : 'all';
      if (input) input.value = params.get('q') || '';
    };
    restore();

    const update = (persist = true) => {
      const words = (input?.value || '').trim().normalize('NFKC').toLowerCase().split(/\s+/).filter(Boolean);
      let visible = 0;
      cards.forEach(({ card, entry, searchText }) => {
        const match = (category === 'all' || entry[2] === category) && words.every((word) => searchText.includes(word));
        card.hidden = !match;
        if (match) visible += 1;
      });
      filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.dkFilter === category)));
      if (count) {
        count.textContent = `${visible} / ${cards.length}`;
        count.setAttribute('aria-label', `显示 ${visible} 组组件，共 ${cards.length} 组`);
      }
      if (empty) empty.hidden = visible > 0;
      if (clear) clear.hidden = !input?.value;
      if (persist) saveSearchState({ q: input?.value.trim(), category: category === 'all' ? '' : category });
    };
    const reset = (persist = true) => {
      category = 'all';
      if (input) input.value = '';
      update(persist);
    };
    filters.forEach((button) => button.addEventListener('click', () => { category = button.dataset.dkFilter; update(); }));
    input?.addEventListener('input', () => update());
    input?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { reset(); event.stopPropagation(); } });
    clear?.addEventListener('click', () => { if (input) { input.value = ''; input.focus(); } update(); });
    $('[data-dk-show-all]')?.addEventListener('click', () => { reset(); input?.focus(); });
    $('[data-dk-catalog-tools]')?.removeAttribute('hidden');
    update(false);

    function navigate(id, { historyMode = 'push' } = {}) {
      const target = document.getElementById(id);
      if (!target) return;
      const component = target.classList.contains('dk-comp');
      if (component) reset(false);
      const url = new URL(window.location.href);
      url.hash = id;
      if (component) {
        url.searchParams.delete('q');
        url.searchParams.delete('category');
      }
      if (url.href !== window.location.href) {
        try {
          if (historyMode === 'push') history.pushState(history.state, '', url);
          else history.replaceState(history.state, '', url);
        } catch (error) { /* file previews can deny history writes */ }
      }
      requestAnimationFrame(() => {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
    }
    document.addEventListener('q:command', (event) => {
      const command = event.detail?.command;
      if (!command?.startsWith('navigate:#')) return;
      event.preventDefault();
      navigate(command.slice('navigate:#'.length));
    });
    window.addEventListener('hashchange', () => {
      const id = window.location.hash.slice(1);
      if (id.startsWith('component-')) navigate(id, { historyMode: 'replace' });
    });
    if (window.location.hash.startsWith('#component-')) navigate(window.location.hash.slice(1), { historyMode: 'replace' });
    window.addEventListener('popstate', () => {
      restore();
      update(false);
      const target = document.getElementById(window.location.hash.slice(1));
      if (target?.classList.contains('dk-comp')) {
        if (target.hidden) reset(false);
        target.scrollIntoView({ block: 'start', behavior: 'auto' });
      }
    });

    const iconInput = $('[data-dk-icon-search]');
    const tiles = $$('[data-icon-name]');
    const iconFilters = $$('[data-dk-icon-filter]');
    const iconCount = $('[data-dk-icon-count]');
    const iconEmpty = $('[data-dk-icon-empty]');
    const iconClear = $('[data-dk-icon-clear]');
    let iconStyle = 'all';
    const restoreIcons = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get('iconStyle');
      iconStyle = iconFilters.some((button) => button.dataset.dkIconFilter === requested) ? requested : 'all';
      if (iconInput) iconInput.value = params.get('icons') || '';
    };
    restoreIcons();
    const updateIcons = (persist = true) => {
      const words = normalize(iconInput?.value).split(/\s+/).filter(Boolean);
      let visible = 0;
      tiles.forEach((tile) => {
        const style = tile.dataset.iconName.endsWith('-filled') ? 'filled' : 'outline';
        const searchText = normalize(tile.dataset.iconSearch || tile.dataset.iconName);
        tile.hidden = !((iconStyle === 'all' || style === iconStyle) && words.every((word) => searchText.includes(word)));
        if (!tile.hidden) visible += 1;
      });
      iconFilters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.dkIconFilter === iconStyle)));
      if (iconCount) {
        iconCount.textContent = `${visible} / ${tiles.length}`;
        iconCount.setAttribute('aria-label', `显示 ${visible} 个图标，共 ${tiles.length} 个`);
      }
      if (iconEmpty) iconEmpty.hidden = visible > 0;
      if (iconClear) iconClear.hidden = !iconInput?.value;
      if (persist) saveSearchState({ icons: iconInput?.value.trim(), iconStyle: iconStyle === 'all' ? '' : iconStyle });
    };
    iconInput?.addEventListener('input', () => updateIcons());
    iconFilters.forEach((button) => button.addEventListener('click', () => {
      iconStyle = button.dataset.dkIconFilter;
      updateIcons();
    }));
    const resetIcons = () => {
      iconStyle = 'all';
      if (iconInput) iconInput.value = '';
      updateIcons();
    };
    iconInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { resetIcons(); event.stopPropagation(); }
    });
    iconClear?.addEventListener('click', () => { iconInput.value = ''; updateIcons(); iconInput.focus(); });
    $('[data-dk-icon-reset]')?.addEventListener('click', () => { resetIcons(); iconInput?.focus(); });
    window.addEventListener('popstate', () => { restoreIcons(); updateIcons(false); });
    $('[data-dk-icon-tools]')?.removeAttribute('hidden');
    $$('[data-dk-icon-total]').forEach((total) => { total.textContent = String(tiles.length); });
    updateIcons(false);

    const syncSample = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim();
      $$('[data-dk-primary-value]').forEach((label) => { label.textContent = value.toUpperCase(); });
    };
    document.addEventListener('q:themechange', syncSample);
    syncSample();
    $('[data-dk-lab-switch]')?.addEventListener('q:switch', (event) => {
      const label = $('[data-dk-lab-status]');
      if (label) label.textContent = event.detail.checked ? '已开启' : '已关闭';
    });
    const shortcut = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
    $$('[data-dk-shortcut]').forEach((label) => { label.textContent = shortcut; });
  }

  // Build snippets and commands before the existing interaction layer binds them.
  renderCatalog();
  renderCommands();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
