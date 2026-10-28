/* ============================================================
   Qoder Design Kit — interaction layer
   Vanilla JS. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const qicon = (name, cls) => (window.QIcon ? window.QIcon(name, cls) : '');
  const enabled = (el) => Boolean(el) && !el.matches(':disabled, [aria-disabled="true"], [hidden]');
  const available = (el) => enabled(el) && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const normalizeText = (value) => String(value || '').normalize('NFKC').toLowerCase().trim();
  let nextId = 0;
  function ensureId(el, prefix) {
    if (!el.id) {
      let id;
      do { id = `${prefix}-${++nextId}`; } while (document.getElementById(id));
      el.id = id;
    }
    return el.id;
  }

  const THEMES = {
    light: { label: '默认亮色', accent: 'default', mode: 'light' },
    'forest-light': { label: '森林亮色', accent: 'forest', mode: 'light' },
    'bee-light': { label: '蜜色亮色', accent: 'bee', mode: 'light' },
    'mint-light': { label: '薄荷亮色', accent: 'mint', mode: 'light' },
    'light-parchment': { label: '羊皮纸亮色', accent: 'parchment', mode: 'light' },
    'forest-dark': { label: '森林暗色', accent: 'forest', mode: 'dark' },
    'bee-dark': { label: '蜜色暗色', accent: 'bee', mode: 'dark' },
    'mint-dark': { label: '薄荷暗色', accent: 'mint', mode: 'dark' },
    'parchment-dark': { label: '羊皮纸暗色', accent: 'parchment', mode: 'dark' },
    dark: { label: '暗色', accent: 'default', mode: 'dark' }
  };

  const THEME_BY_ACCENT = {
    default: { light: 'light', dark: 'dark' },
    forest: { light: 'forest-light', dark: 'forest-dark' },
    bee: { light: 'bee-light', dark: 'bee-dark' },
    mint: { light: 'mint-light', dark: 'mint-dark' },
    parchment: { light: 'light-parchment', dark: 'parchment-dark' }
  };

  /* ---------- Theme ---------- */
  let tokenRefreshFrame = null;
  function scheduleTokenRefresh() {
    if (tokenRefreshFrame !== null) return;
    tokenRefreshFrame = requestAnimationFrame(() => {
      tokenRefreshFrame = null;
      refreshTokenValues();
    });
  }

  function refreshTokenValues() {
    if (tokenRefreshFrame !== null) {
      cancelAnimationFrame(tokenRefreshFrame);
      tokenRefreshFrame = null;
    }
    const style = getComputedStyle(document.documentElement);
    // Read every computed value before changing text, avoiding repeated style flushes.
    const tokens = $$('[data-token]').map((el) => {
      const name = el.getAttribute('data-token');
      const out = el.querySelector('[data-token-value]');
      return { out, value: name && out ? style.getPropertyValue(name).trim() : '' };
    });
    const info = QTheme.info();
    const writeText = (el, text) => { if (el.textContent !== text) el.textContent = text; };
    tokens.forEach(({ out, value }) => { if (out && value) writeText(out, value); });
    $$('[data-theme-id]').forEach((el) => {
      writeText(el, info.id);
    });
    $$('[data-theme-name]').forEach((el) => {
      writeText(el, info.label);
    });
    $$('[data-q-theme-toggle]').forEach((btn) => {
      const use = btn.querySelector('use');
      const href = info.mode === 'dark' ? '#q-i-sun' : '#q-i-moon';
      if (use && use.getAttribute('href') !== href) use.setAttribute('href', href);
      const action = info.mode === 'dark' ? '切换到亮色主题' : '切换到暗色主题';
      const caption = btn.textContent.trim();
      const label = caption ? `${caption} · ${action}` : action;
      if (btn.getAttribute('aria-label') !== label) btn.setAttribute('aria-label', label);
      if (btn.getAttribute('title') !== action) btn.setAttribute('title', action);
    });
    $$('[data-q-theme-label]').forEach((el) => {
      writeText(el, info.label);
    });
  }

  let themeRevision = 0;
  let themeTransition = null;

  const QTheme = {
    get() {
      const id = document.documentElement.dataset.theme || 'light';
      return Object.hasOwn(THEMES, id) ? id : 'light';
    },
    info(id) {
      const requested = id || QTheme.get();
      const themeId = Object.hasOwn(THEMES, requested) ? requested : 'light';
      const t = THEMES[themeId];
      return { id: themeId, label: t.label, accent: t.accent, mode: t.mode };
    },
    set(id, options = {}) {
      const safe = Object.hasOwn(THEMES, id) ? id : 'light';
      const root = document.documentElement;
      const revision = ++themeRevision;
      themeTransition?.skipTransition();
      themeTransition = null;
      const apply = () => {
        if (revision !== themeRevision) return;
        if (root.dataset.theme !== safe) root.dataset.theme = safe;
        document.dispatchEvent(new CustomEvent('q:themechange', { detail: { theme: safe, ...QTheme.info(safe) } }));
        scheduleTokenRefresh();
      };
      const cleanup = () => {
        if (revision !== themeRevision) return;
        themeTransition = null;
        root.removeAttribute('data-q-theme-transition');
        root.style.removeProperty('--q-theme-transition-duration');
      };
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const effectsOff = root.dataset.visualEffects === 'off';
      const canAnimate = options.animate !== false && typeof document.startViewTransition === 'function' && !reduced && !effectsOff;
      if (canAnimate) {
        root.setAttribute('data-q-theme-transition', 'fade');
        root.style.setProperty('--q-theme-transition-duration', '160ms');
        try {
          const transition = document.startViewTransition(apply);
          themeTransition = transition;
          transition.ready.catch(() => {});
          transition.finished.then(cleanup, cleanup);
        } catch (e) {
          cleanup();
          apply();
        }
      } else {
        cleanup();
        apply();
      }
      if (options.persist !== false) {
        try { localStorage.setItem('qdk-theme', safe); } catch (e) { /* noop */ }
      }
      return safe;
    },
    apply(accent = 'default', mode = 'light') {
      const pair = Object.hasOwn(THEME_BY_ACCENT, accent) ? THEME_BY_ACCENT[accent] : THEME_BY_ACCENT.default;
      return QTheme.set(pair[mode === 'dark' ? 'dark' : 'light']);
    },
    toggle() {
      const info = QTheme.info();
      const pair = THEME_BY_ACCENT[info.accent] || THEME_BY_ACCENT.default;
      return QTheme.set(pair[info.mode === 'dark' ? 'light' : 'dark']);
    },
    list() {
      return Object.entries(THEMES).map(([id, t]) => ({ id, ...t }));
    }
  };

  function initTheme() {
    let stored = null;
    try { stored = localStorage.getItem('qdk-theme'); } catch (e) { /* noop */ }
    const current = document.documentElement.dataset.theme;
    const requested = new URLSearchParams(window.location.search).get('theme');
    const initial = Object.hasOwn(THEMES, requested) ? requested : (Object.hasOwn(THEMES, stored) ? stored : current);
    QTheme.set(initial || 'light', { persist: false, animate: false });
    $$('[data-q-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => QTheme.toggle());
    });
    document.addEventListener('q:themechange', scheduleTokenRefresh);
    scheduleTokenRefresh();
  }

  /* ---------- Shared popup behavior ---------- */
  const MENU_ITEM = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], .q-menu__item';
  let activePopup = null;

  function closePopup({ focusTrigger = false } = {}) {
    if (!activePopup) return;
    const { menu, trigger } = activePopup;
    activePopup = null;
    menu.hidden = true;
    menu.setAttribute('data-state', 'closed');
    menu.removeAttribute('data-q-popup-placement');
    menu.removeAttribute('data-q-popup-align');
    menu.style.removeProperty('--q-popup-max-height');
    trigger.setAttribute('aria-expanded', 'false');
    if (focusTrigger && trigger.isConnected) trigger.focus({ preventScroll: true });
  }

  function labelPopup(trigger, menu) {
    trigger.setAttribute('aria-controls', ensureId(menu, 'q-popup'));
    if (!menu.hasAttribute('aria-label') && !menu.hasAttribute('aria-labelledby')) {
      menu.setAttribute('aria-labelledby', ensureId(trigger, 'q-popup-trigger'));
    }
  }

  function positionPopup(trigger, menu, point) {
    const edge = 8;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    if (point) {
      menu.style.setProperty('--q-popup-max-height', `${Math.max(0, viewportHeight - edge * 2)}px`);
      menu.style.left = `${Math.round(clamp(point.x, edge, Math.max(edge, viewportWidth - menu.offsetWidth - edge)))}px`;
      menu.style.top = `${Math.round(clamp(point.y, edge, Math.max(edge, viewportHeight - menu.offsetHeight - edge)))}px`;
      return;
    }
    const anchor = trigger.getBoundingClientRect();
    const above = Math.max(0, anchor.top - edge - 4);
    const below = Math.max(0, viewportHeight - anchor.bottom - edge - 4);
    const preferUp = Boolean(trigger.closest('.q-select--up'));
    const upward = preferUp ? (above >= menu.offsetHeight || above > below) : (below < menu.offsetHeight && above > below);
    menu.setAttribute('data-q-popup-placement', upward ? 'top' : 'bottom');
    menu.style.setProperty('--q-popup-max-height', `${upward ? above : below}px`);
    const bounds = menu.getBoundingClientRect();
    if (bounds.right > viewportWidth - edge) menu.setAttribute('data-q-popup-align', 'end');
    else if (bounds.left < edge) menu.setAttribute('data-q-popup-align', 'start');
  }

  function openPopup(trigger, menu, { focus, point } = {}) {
    if (!enabled(trigger)) return;
    closePopup();
    hideTooltip();
    menu.hidden = false;
    menu.setAttribute('data-state', 'open');
    trigger.setAttribute('aria-expanded', 'true');
    activePopup = { menu, trigger };
    positionPopup(trigger, menu, point);
    focus?.()?.focus({ preventScroll: true });
  }

  function bindPopup(menu, selector, choose) {
    let query = '';
    let lastKeyTime = 0;
    let searchSession = null;
    let spacePress = null;
    const items = () => $$(selector, menu).filter(available);
    $$(selector, menu).forEach((item) => item.setAttribute('tabindex', '-1'));
    // Capture prevents disabled actions from reaching business click handlers.
    menu.addEventListener('click', (event) => {
      const item = event.target.closest(selector);
      if (item && !available(item)) { event.preventDefault(); event.stopPropagation(); }
    }, true);
    menu.addEventListener('click', (event) => {
      const item = event.target.closest(selector);
      if (item && menu.contains(item) && available(item)) choose(item);
    });
    menu.addEventListener('keydown', (event) => {
      if (activePopup?.menu !== menu || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
      const list = items();
      const index = list.indexOf(document.activeElement);
      let next;
      if (event.key === 'ArrowDown') next = list[(index + 1) % list.length];
      if (event.key === 'ArrowUp') next = index < 0 ? list.at(-1) : list[(index - 1 + list.length) % list.length];
      if (event.key === 'Home') next = list[0];
      if (event.key === 'End') next = list.at(-1);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        query = '';
        next?.focus({ preventScroll: true });
        next?.scrollIntoView({ block: 'nearest' });
        return;
      }
      const current = event.target.closest(selector);
      if (event.key === 'Enter' || event.key === ' ') {
        const nativeActivation = event.key === 'Enter' ? 'button, a[href]' : 'button';
        if (current && !current.matches(nativeActivation)) {
          event.preventDefault();
          if (event.key === 'Enter' && available(current)) current.click();
          if (event.key === ' ' && available(current)) spacePress = { item: current, popup: activePopup };
        }
        return;
      }
      if (event.key.length !== 1 || !list.length) return;
      event.preventDefault();
      const now = performance.now();
      if (searchSession !== activePopup || now - lastKeyTime > 600) query = '';
      searchSession = activePopup;
      lastKeyTime = now;
      const key = normalizeText(event.key);
      query += key;
      if ([...query].every((letter) => letter === key)) query = key;
      const ordered = [...list.slice(index + 1), ...list.slice(0, index + 1)];
      const find = (prefix) => ordered.find((item) => normalizeText(
        item.querySelector('[data-option-label], .q-menu__label-text')?.textContent || item.textContent
      ).startsWith(prefix));
      next = find(query);
      if (!next) { query = key; next = find(query); }
      next?.focus({ preventScroll: true });
      next?.scrollIntoView({ block: 'nearest' });
    });
    menu.addEventListener('keyup', (event) => {
      const item = event.target.closest(selector);
      if (event.key !== ' ') return;
      const press = spacePress;
      spacePress = null;
      if (!event.isComposing && press?.popup === activePopup && press?.item === item && activePopup?.menu === menu && available(item)) {
        event.preventDefault();
        item.click();
      }
    });
    return items;
  }

  function setupPopupDismissal() {
    document.addEventListener('pointerdown', (event) => {
      if (!activePopup) return;
      const { menu, trigger } = activePopup;
      if (!menu.contains(event.target) && !trigger.contains(event.target)) {
        closePopup({ focusTrigger: menu.contains(document.activeElement) });
      }
    }, true);
    document.addEventListener('focusin', (event) => {
      if (activePopup && !activePopup.menu.contains(event.target) && !activePopup.trigger.contains(event.target)) closePopup();
    });
    document.addEventListener('keydown', (event) => {
      if (!activePopup || event.isComposing) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closePopup({ focusTrigger: true });
      } else if (event.key === 'Tab') {
        // Let the browser continue from the trigger in either Tab direction.
        closePopup({ focusTrigger: activePopup.menu.contains(document.activeElement) });
      }
    }, true);
    window.addEventListener('resize', () => closePopup({ focusTrigger: Boolean(activePopup?.menu.contains(document.activeElement)) }));
    window.addEventListener('blur', () => closePopup());
  }

  /* ---------- Menus ---------- */
  function selectMenuItem(trigger, menu, item) {
    closePopup({ focusTrigger: true });
    trigger.dispatchEvent(new CustomEvent('q:menu-select', {
      bubbles: true,
      detail: {
        value: item.getAttribute('data-value') || '',
        label: item.querySelector('.q-menu__label-text')?.textContent?.trim() || item.textContent.trim(),
        item,
        menu
      }
    }));
  }

  function setupMenus() {
    $$('[data-q-menu-trigger]').forEach((trigger) => {
      if (trigger.dataset.qMenuReady) return;
      const id = trigger.getAttribute('aria-controls');
      const menu = (id && document.getElementById(id)) || trigger.parentElement?.querySelector('.q-menu') || trigger.nextElementSibling;
      if (!menu || !menu.classList.contains('q-menu')) return;
      trigger.dataset.qMenuReady = 'true';
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('role', menu.getAttribute('role') || 'menu');
      menu.hidden = true;
      menu.setAttribute('data-state', 'closed');
      labelPopup(trigger, menu);
      const items = bindPopup(menu, MENU_ITEM, (item) => selectMenuItem(trigger, menu, item));

      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (activePopup?.menu === menu) closePopup({ focusTrigger: true });
        else openPopup(trigger, menu, { focus: () => items()[0] });
      });
      trigger.addEventListener('keydown', (event) => {
        if (event.isComposing) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          openPopup(trigger, menu, { focus: () => event.key === 'ArrowUp' ? items().at(-1) : items()[0] });
        }
      });
    });
  }

  /* ---------- Select ---------- */
  function setSelectLabel(select, option, { emit = true } = {}) {
    if (!enabled(option)) return;
    const label =
      option.querySelector('[data-option-label]')?.textContent?.trim() ||
      option.getAttribute('data-label') ||
      option.textContent.trim();
    const labelEl = select.querySelector('[data-q-select-label]');
    if (labelEl) labelEl.textContent = label;
    select.dataset.value = option.getAttribute('data-value') || '';
    $$('[role="option"]', select).forEach((o) => o.setAttribute('aria-selected', String(o === option)));
    if (emit) {
      select.dispatchEvent(new CustomEvent('q:select', {
        bubbles: true,
        detail: { value: select.dataset.value, label, option, select }
      }));
    }
  }

  function setupSelects() {
    $$('[data-q-select]').forEach((select) => {
      if (select.dataset.qSelectReady) return;
      const trigger = select.querySelector('.q-select__trigger');
      const menu = select.querySelector('.q-select__menu');
      if (!trigger || !menu) return;
      select.dataset.qSelectReady = 'true';
      menu.hidden = true;
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('role', 'listbox');
      labelPopup(trigger, menu);
      const options = $$('[role="option"]', menu);
      const initial = options.find((option) => enabled(option) && option.getAttribute('aria-selected') === 'true') || options.find(enabled);
      if (initial) setSelectLabel(select, initial, { emit: false });
      const items = bindPopup(menu, '[role="option"]', (option) => {
        closePopup({ focusTrigger: true });
        setSelectLabel(select, option);
      });
      const open = () => openPopup(trigger, menu, {
        focus: () => items().find((option) => option.getAttribute('aria-selected') === 'true') || items()[0]
      });

      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (menu.hidden) open(); else closePopup({ focusTrigger: true });
      });
      trigger.addEventListener('keydown', (event) => {
        if (event.isComposing) return;
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
          event.preventDefault();
          if (menu.hidden) open();
        }
      });
    });
  }

  /* ---------- Dialogs ---------- */
  function setupDialogs() {
    $$('[data-q-dialog-open]').forEach((trigger) => {
      if (trigger.dataset.qDialogReady) return;
      trigger.dataset.qDialogReady = 'true';
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const dialog = document.getElementById(trigger.getAttribute('data-q-dialog-open'));
        if (dialog && typeof dialog.showModal === 'function') {
          if (!dialog.open) dialog.showModal();
          dialog.setAttribute('data-state', 'open');
        }
      });
    });
    $$('dialog.q-dialog, dialog[data-q-dialog]').forEach((dialog) => {
      if (dialog.dataset.qDialogReady) return;
      dialog.dataset.qDialogReady = 'true';
      let backdropPress = false;
      let backdropRelease = false;
      dialog.addEventListener('pointerdown', (event) => {
        backdropPress = event.button === 0 && event.target === dialog;
        backdropRelease = false;
      });
      dialog.addEventListener('pointerup', (event) => { backdropRelease = event.target === dialog; });
      dialog.addEventListener('pointercancel', () => { backdropPress = false; });
      dialog.addEventListener('click', (event) => {
        if (backdropPress && backdropRelease && event.target === dialog) dialog.close();
        backdropPress = false;
        backdropRelease = false;
      });
      dialog.addEventListener('close', () => {
        dialog.removeAttribute('data-state');
        if (tooltipTarget && dialog.contains(tooltipTarget)) hideTooltip();
        if (activePopup && dialog.contains(activePopup.menu)) closePopup();
      });
      $$('[data-q-dialog-close]', dialog).forEach((btn) => {
        btn.addEventListener('click', (event) => {
          event.preventDefault();
          dialog.close();
        });
      });
    });
  }

  /* ---------- Command palette ---------- */
  function setupCommandPalette() {
    const dialog = document.getElementById('command-palette');
    if (!dialog) return;
    const input = dialog.querySelector('[data-q-command-input]');
    const items = $$('[data-command]', dialog);
    const groups = $$('[data-command-group]', dialog);
    const empty = dialog.querySelector('.q-command__empty');
    const triggerButtons = $$('[data-q-command-open]');
    let active = -1;
    if (!input) return;
    const results = dialog.querySelector('.q-command__body');
    if (results) {
      if (!results.id) results.id = `${dialog.id}-results`;
      results.setAttribute('role', 'listbox');
      results.setAttribute('aria-label', '搜索结果');
      input.setAttribute('aria-controls', results.id);
    }
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    groups.forEach((group) => {
      group.setAttribute('role', 'group');
      const label = group.querySelector('.q-command__label');
      if (label) group.setAttribute('aria-label', label.textContent.trim());
    });
    items.forEach((item, index) => {
      if (!item.id) item.id = `${dialog.id}-option-${index}`;
      item.setAttribute('role', 'option');
      item.setAttribute('tabindex', '-1');
      item.setAttribute('aria-selected', 'false');
    });

    const visibleItems = () => items.filter((item) => !item.hidden);
    const setActive = (index) => {
      const list = visibleItems();
      active = list.length ? ((index % list.length) + list.length) % list.length : -1;
      items.forEach((item) => {
        item.classList.remove('is-active');
        item.setAttribute('aria-selected', 'false');
      });
      const current = list[active];
      if (current) {
        current.classList.add('is-active');
        current.setAttribute('aria-selected', 'true');
        current.scrollIntoView({ block: 'nearest' });
        input.setAttribute('aria-activedescendant', current.id);
      } else input.removeAttribute('aria-activedescendant');
    };
    const filter = () => {
      const words = normalizeText(input.value).split(/\s+/).filter(Boolean);
      items.forEach((item) => {
        const text = normalizeText(`${item.getAttribute('data-command-text') || ''} ${item.textContent || ''}`);
        item.hidden = !words.every((word) => text.includes(word));
      });
      groups.forEach((group) => {
        group.hidden = !$$('[data-command]', group).some((item) => !item.hidden);
      });
      const list = visibleItems();
      if (empty) empty.hidden = list.length > 0;
      setActive(0);
    };
    const open = () => {
      if (!dialog.open) dialog.showModal();
      input.setAttribute('aria-expanded', 'true');
      input.value = '';
      filter();
      requestAnimationFrame(() => {
        input.focus();
        dialog.querySelectorAll('[data-q-scroll-fade]').forEach((el) => el.dispatchEvent(new Event('scroll')));
      });
    };
    const close = () => { if (dialog.open) dialog.close(); };
    const choose = (item) => {
      if (!item) return;
      const command = item.getAttribute('data-command') || '';
      const label = item.querySelector('.q-command__item-label')?.textContent?.trim() || item.textContent.trim();
      close();
      const unhandled = document.dispatchEvent(new CustomEvent('q:command', { bubbles: true, cancelable: true, detail: { command, label, item } }));
      if (!unhandled) return;
      if (command === 'toggle-theme') { QTheme.toggle(); return; }
      if (command === 'toggle-sidebar') { $('.q-window [data-q-sidebar-toggle]')?.click(); return; }
      if (command === 'toggle-artifacts') { $('.q-window [data-q-artifacts-toggle]')?.click(); return; }
      if (command === 'toggle-loading') { QBoot.show({ duration: 2400 }); return; }
      QToast.show({ title: label, description: '命令已执行（演示）。', type: 'success', duration: 2200 });
    };

    triggerButtons.forEach((btn) => {
      if (btn.dataset.qCommandReady) return;
      btn.dataset.qCommandReady = 'true';
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        open();
      });
    });
    input.addEventListener('input', filter);
    input.addEventListener('keydown', (event) => {
      if (event.isComposing || event.keyCode === 229) return;
      const list = visibleItems();
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!list.length) return;
        setActive(active + (event.key === 'ArrowDown' ? 1 : -1));
      }
      if (event.key === 'Home') { event.preventDefault(); setActive(0); }
      if (event.key === 'End') { event.preventDefault(); setActive(list.length - 1); }
      if (event.key === 'Enter') {
        event.preventDefault();
        choose(list[active]);
      }
    });
    items.forEach((item) => {
      item.addEventListener('pointermove', () => setActive(visibleItems().indexOf(item)));
      item.addEventListener('click', () => choose(item));
    });
    dialog.addEventListener('close', () => {
      input.value = '';
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      if (empty) empty.hidden = true;
    });
    document.addEventListener('keydown', (event) => {
      if (event.isComposing || event.defaultPrevented) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog.open) close(); else open();
      }
    });
  }

  /* ---------- Context menus ---------- */
  function setupContextMenus() {
    $$('[data-q-context-menu]').forEach((zone) => {
      if (zone.dataset.qContextMenuReady) return;
      const menu = document.getElementById(zone.getAttribute('data-q-context-menu'));
      if (!menu) return;
      zone.dataset.qContextMenuReady = 'true';
      menu.hidden = true;
      zone.setAttribute('aria-haspopup', 'menu');
      zone.setAttribute('aria-expanded', 'false');
      labelPopup(zone, menu);
      const items = bindPopup(menu, MENU_ITEM, (item) => selectMenuItem(zone, menu, item));
      const open = (point) => {
        const rect = zone.getBoundingClientRect();
        openPopup(zone, menu, { point: point || { x: rect.left, y: rect.bottom + 4 }, focus: () => items()[0] });
      };
      zone.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        open(event.clientX || event.clientY ? { x: event.clientX, y: event.clientY } : undefined);
      });
      zone.addEventListener('keydown', (event) => {
        if (!event.isComposing && (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))) {
          event.preventDefault();
          open();
        }
      });
      // A native button also gives touch and keyboard users a direct entry point.
      if (zone instanceof HTMLButtonElement) zone.addEventListener('click', () => open());
    });
  }

  /* ---------- Tabs ---------- */
  function setupTabs() {
    $$('[data-q-tabs]').forEach((tabs, groupIndex) => {
      if (tabs.dataset.qTabsReady) return;
      tabs.dataset.qTabsReady = 'true';
      const group = tabs.closest('[data-q-tab-group]') || tabs.parentElement;
      const triggers = $$('[data-q-tab], [role="tab"]', tabs)
        .filter((trigger) => trigger.closest('[data-q-tabs]') === tabs);
      tabs.setAttribute('role', 'tablist');
      const panelFor = (trigger) => {
        const value = trigger.getAttribute('data-q-tab');
        const id = trigger.getAttribute('aria-controls');
        const controlled = id && document.getElementById(id);
        if (controlled) return controlled;
        if (!value) return null;
        return group?.querySelector(`[data-q-panel="${CSS.escape(value)}"]`) || null;
      };
      const activate = (trigger, focus = false) => {
        if (!enabled(trigger)) return;
        triggers.forEach((t) => {
          const selected = t === trigger;
          t.setAttribute('aria-selected', String(selected));
          t.setAttribute('data-state', selected ? 'active' : 'inactive');
          t.setAttribute('tabindex', selected ? '0' : '-1');
          const panel = panelFor(t);
          if (panel) {
            panel.hidden = !selected;
            panel.setAttribute('data-state', selected ? 'active' : 'inactive');
          }
        });
        if (focus) trigger.focus();
        tabs.dispatchEvent(new CustomEvent('q:tab-change', {
          bubbles: true,
          detail: { value: trigger.getAttribute('data-q-tab'), trigger }
        }));
      };
      triggers.forEach((trigger, index) => {
        trigger.setAttribute('role', 'tab');
        if (!trigger.id) trigger.id = `q-tab-${groupIndex + 1}-${index + 1}`;
        const panel = panelFor(trigger);
        if (panel) {
          if (!panel.id) panel.id = `${trigger.id}-panel`;
          trigger.setAttribute('aria-controls', panel.id);
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('aria-labelledby', trigger.id);
          if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '0');
        }
        trigger.addEventListener('click', () => activate(trigger));
        trigger.addEventListener('keydown', (event) => {
          if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
          const vertical = tabs.getAttribute('aria-orientation') === 'vertical';
          const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
          const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft';
          const choices = triggers.filter(available);
          const at = choices.indexOf(trigger);
          if (!choices.length) return;
          if (event.key === nextKey || event.key === previousKey) {
            event.preventDefault();
            const delta = event.key === nextKey ? 1 : -1;
            activate(choices[(at + delta + choices.length) % choices.length], true);
          }
          if (event.key === 'Home') { event.preventDefault(); activate(choices[0], true); }
          if (event.key === 'End') { event.preventDefault(); activate(choices.at(-1), true); }
        });
      });
      const current = triggers.find((t) => enabled(t) && t.getAttribute('aria-selected') === 'true') || triggers.find(enabled);
      if (current) activate(current);
    });
  }

  /* ---------- Switch ---------- */
  const switchBindings = new WeakSet();

  function setSwitchState(sw, checked, { emit = false, motion = null } = {}) {
    const next = Boolean(checked);
    const changed = sw.getAttribute('aria-checked') !== String(next);
    if (motion && changed) sw.dataset.switchMotion = motion;
    else sw.removeAttribute('data-switch-motion');
    sw.setAttribute('aria-checked', String(next));
    if (emit && changed) {
      sw.dispatchEvent(new CustomEvent('q:switch', { bubbles: true, detail: { checked: next } }));
    }
  }

  function setupSwitch(sw) {
    if (!(sw instanceof HTMLButtonElement)) return;
    sw.type = 'button';
    sw.setAttribute('role', 'switch');
    let thumb = sw.querySelector('.q-switch__thumb, [data-switch-thumb]');
    if (!thumb) {
      thumb = document.createElement('span');
      sw.append(thumb);
    }
    thumb.classList.add('q-switch__thumb');
    thumb.setAttribute('data-switch-thumb', '');
    let visual = thumb.querySelector('.q-switch__visual, [data-switch-visual]');
    if (!visual) {
      visual = document.createElement('span');
      thumb.append(visual);
    }
    visual.classList.add('q-switch__visual');
    visual.setAttribute('data-switch-visual', '');
    visual.setAttribute('aria-hidden', 'true');
    if (!sw.hasAttribute('aria-checked')) {
      sw.setAttribute('aria-checked', String(sw.hasAttribute('data-checked')));
    }
    if (switchBindings.has(sw)) return;
    switchBindings.add(sw);
    sw.addEventListener('pointerenter', () => sw.removeAttribute('data-switch-motion'));
    sw.addEventListener('click', (event) => {
      if (sw.disabled || sw.getAttribute('aria-disabled') === 'true') return;
      const next = sw.getAttribute('aria-checked') !== 'true';
      // Native keyboard activation has detail=0, exactly as Qoder's Switch.
      setSwitchState(sw, next, { emit: true, motion: event.detail > 0 ? (next ? 'on' : 'off') : null });
    });
  }

  function setupSwitches(root = document) {
    const selector = '[data-q-switch], [data-q-effects-toggle]';
    if (root.matches?.(selector)) setupSwitch(root);
    $$(selector, root).forEach(setupSwitch);
  }

  const QSwitch = {
    init: setupSwitches,
    get: (sw) => sw.getAttribute('aria-checked') === 'true',
    set(sw, checked, options) {
      if (!(sw instanceof HTMLButtonElement)) return;
      setupSwitch(sw);
      setSwitchState(sw, checked, options);
    }
  };

  /* ---------- Tooltips ---------- */
  let tooltipEl = null;
  let tooltipTarget = null;
  let tooltipTimer = null;
  let tooltipDismissTimer = null;

  function hideTooltip() {
    if (tooltipTimer) { clearTimeout(tooltipTimer); tooltipTimer = null; }
    if (tooltipDismissTimer) { clearTimeout(tooltipDismissTimer); tooltipDismissTimer = null; }
    if (tooltipEl && tooltipTarget) {
      const ids = (tooltipTarget.getAttribute('aria-describedby') || '').split(/\s+/).filter((id) => id && id !== tooltipEl.id);
      if (ids.length) tooltipTarget.setAttribute('aria-describedby', ids.join(' '));
      else tooltipTarget.removeAttribute('aria-describedby');
    }
    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
    tooltipTarget = null;
  }

  function positionTooltip(target, el) {
    const rect = target.getBoundingClientRect();
    const tr = el.getBoundingClientRect();
    let placement = target.getAttribute('data-q-tooltip-placement') || 'top';
    const gap = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = rect.top - tr.height - gap;
    let left = rect.left + rect.width / 2 - tr.width / 2;
    if (placement === 'top' && top < 8) placement = 'bottom';
    if (placement === 'bottom' && rect.bottom + gap + tr.height > vh - 8) placement = 'top';
    if (placement === 'bottom') top = rect.bottom + gap;
    if (placement === 'left') {
      top = rect.top + rect.height / 2 - tr.height / 2;
      left = rect.left - tr.width - gap;
      if (left < 8) placement = 'right';
    }
    if (placement === 'right') {
      top = rect.top + rect.height / 2 - tr.height / 2;
      left = rect.right + gap;
      if (left + tr.width > vw - 8) {
        left = clamp(rect.left + rect.width / 2 - tr.width / 2, 8, vw - tr.width - 8);
        top = rect.top - tr.height - gap;
      }
    }
    left = clamp(left, 8, Math.max(8, vw - tr.width - 8));
    top = clamp(top, 8, Math.max(8, vh - tr.height - 8));
    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(top)}px`;
  }

  function showTooltip(target) {
    const text = target.getAttribute('data-q-tooltip');
    if (!text || !target.isConnected || !target.getClientRects().length) return;
    hideTooltip();
    tooltipTarget = target;
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'q-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    tooltipEl.textContent = text;
    const id = ensureId(tooltipEl, 'q-tooltip');
    const describedBy = (target.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    target.setAttribute('aria-describedby', [...describedBy, id].join(' '));
    (target.closest('dialog[open]') || document.body).appendChild(tooltipEl);
    tooltipEl.addEventListener('mouseenter', () => clearTimeout(tooltipDismissTimer));
    tooltipEl.addEventListener('mouseleave', () => {
      if (document.activeElement !== target && !target.matches(':hover')) hideTooltip();
    });
    positionTooltip(target, tooltipEl);
  }

  function setupTooltips() {
    $$('[data-q-tooltip]').forEach((target) => {
      if (target.dataset.qTooltipReady) return;
      target.dataset.qTooltipReady = 'true';
      const schedule = () => {
        if (tooltipTimer) clearTimeout(tooltipTimer);
        if (tooltipDismissTimer) clearTimeout(tooltipDismissTimer);
        tooltipTimer = setTimeout(() => showTooltip(target), 150);
      };
      target.addEventListener('mouseenter', schedule);
      target.addEventListener('focus', schedule);
      target.addEventListener('mouseleave', () => {
        if (document.activeElement !== target) tooltipDismissTimer = setTimeout(hideTooltip, 120);
      });
      target.addEventListener('blur', hideTooltip);
      target.addEventListener('pointerdown', hideTooltip);
    });
    document.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('resize', hideTooltip);
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || event.isComposing) return;
      const visible = Boolean(tooltipEl);
      hideTooltip();
      if (visible) { event.preventDefault(); event.stopPropagation(); }
    }, true);
  }

  /* ---------- Toasts ---------- */
  const ToastIcons = {
    info: 'info-circle',
    success: 'circle-check',
    warning: 'alert-triangle',
    error: 'circle-x'
  };

  function ensureToaster() {
    let toaster = $('.q-toaster');
    if (!toaster) {
      toaster = document.createElement('div');
      toaster.className = 'q-toaster';
      toaster.setAttribute('role', 'region');
      toaster.setAttribute('aria-label', '通知');
      document.body.appendChild(toaster);
    }
    return toaster;
  }

  const QToast = {
    show({ title = '', description = '', type = 'info', duration = 4200 } = {}) {
      const toaster = ensureToaster();
      while (toaster.children.length >= 3) toaster.firstElementChild?.remove();
      const toast = document.createElement('div');
      toast.className = `q-toast q-toast--${type}`;
      toast.setAttribute('role', 'status');
      toast.innerHTML = `
        <span class="q-toast__icon">${qicon(ToastIcons[type] || 'info-circle')}</span>
        <div class="q-toast__content">
          <div class="q-toast__title"></div>
          ${description ? '<div class="q-toast__desc"></div>' : ''}
        </div>
        <button type="button" class="q-toast__close" aria-label="关闭通知">${qicon('x')}</button>
      `;
      toast.querySelector('.q-toast__title').textContent = title;
      if (description) toast.querySelector('.q-toast__desc').textContent = description;
      toaster.appendChild(toast);
      const remove = () => {
        if (!toast.isConnected) return;
        toast.classList.add('is-leaving');
        setTimeout(() => toast.remove(), 180);
      };
      toast.querySelector('.q-toast__close').addEventListener('click', remove);
      if (duration > 0) setTimeout(remove, duration);
      return toast;
    },
    close(toast) { toast?.remove(); }
  };

  function setupToastTriggers() {
    $$('[data-q-toast]').forEach((btn) => {
      if (btn.dataset.qToastReady) return;
      btn.dataset.qToastReady = 'true';
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-q-toast') || 'info';
        QToast.show({
          title: btn.getAttribute('data-title') || '通知',
          description: btn.getAttribute('data-desc') || '',
          type,
          duration: Number(btn.getAttribute('data-duration') || 4200)
        });
      });
    });
  }

  /* ---------- Composer ---------- */
  function resizeComposer(input) {
    input.style.height = 'auto';
    const next = clamp(input.scrollHeight, 52, 256);
    input.style.height = `${next}px`;
    input.style.overflowY = input.scrollHeight > 256 ? 'auto' : 'hidden';
  }

  function syncComposer(composer) {
    const input = composer.querySelector('[data-q-composer-input]');
    const send = composer.querySelector('[data-q-composer-send]');
    if (!input || !send) return;
    const running = composer.classList.contains('is-running');
    send.disabled = !running && !input.value.trim();
    send.setAttribute('aria-label', running ? '停止生成' : '发送');
  }

  function submitComposer(composer) {
    const input = composer.querySelector('[data-q-composer-input]');
    if (!input) return;
    if (composer.classList.contains('is-running')) {
      composer.dispatchEvent(new CustomEvent('q:composer-stop', { bubbles: true, detail: { composer } }));
      return;
    }
    const value = input.value.trim();
    if (!value) return;
    const event = new CustomEvent('q:composer-submit', {
      bubbles: true,
      cancelable: true,
      detail: { value, composer, input }
    });
    composer.dispatchEvent(event);
    if (!event.defaultPrevented) {
      input.value = '';
      resizeComposer(input);
      syncComposer(composer);
    }
  }

  function setupComposers() {
    $$('[data-chat-composer]').forEach((composer) => {
      if (composer.dataset.qComposerReady) return;
      composer.dataset.qComposerReady = 'true';
      const input = composer.querySelector('[data-q-composer-input]');
      const send = composer.querySelector('[data-q-composer-send]');
      if (!input) return;
      resizeComposer(input);
      syncComposer(composer);
      input.addEventListener('input', () => {
        resizeComposer(input);
        syncComposer(composer);
        composer.dispatchEvent(new CustomEvent('q:composer-input', { bubbles: true, detail: { value: input.value, composer } }));
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          submitComposer(composer);
        }
      });
      send?.addEventListener('click', () => submitComposer(composer));
      composer.addEventListener('q:composer-state', () => syncComposer(composer));
      composer.addEventListener('click', (event) => {
        const remove = event.target.closest('.q-context-chip__remove, .q-attachment__remove, .q-composer__banner-close');
        if (!remove) return;
        remove.closest('.q-context-chip, .q-attachment, .q-composer__banner')?.remove();
      });
    });
  }

  const QComposer = {
    setValue(composer, value) {
      const input = composer.querySelector('[data-q-composer-input]');
      if (!input) return;
      input.value = value;
      resizeComposer(input);
      syncComposer(composer);
    },
    setRunning(composer, running) {
      composer.classList.toggle('is-running', !!running);
      const send = composer.querySelector('[data-q-composer-send]');
      if (send) {
        send.disabled = false;
        send.classList.toggle('is-running', !!running);
        send.innerHTML = running
          ? '<span class="q-stop-square" aria-hidden="true"></span>'
          : qicon('arrow-up');
        send.setAttribute('aria-label', running ? '停止生成' : '发送');
      }
      composer.dispatchEvent(new CustomEvent('q:composer-state', { bubbles: true }));
    },
    focus(composer) {
      composer.querySelector('[data-q-composer-input]')?.focus();
    }
  };

  /* ---------- Surface effects ---------- */
  function setupScrollFades() {
    $$('[data-q-scroll-fade]').forEach((el) => {
      if (el.dataset.qScrollFadeReady) return;
      el.dataset.qScrollFadeReady = 'true';
      const update = () => {
        const max = el.scrollHeight - el.clientHeight;
        el.toggleAttribute('data-fade-top', el.scrollTop > 1);
        el.toggleAttribute('data-fade-bottom', max - el.scrollTop > 1);
      };
      el.addEventListener('scroll', update, { passive: true });
      if (window.ResizeObserver) new ResizeObserver(update).observe(el);
      if (window.MutationObserver) {
        new MutationObserver(update).observe(el, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['hidden']
        });
      }
      update();
    });
  }

  function setupDotFields() {
    $$('[data-q-dot-field]').forEach((field) => {
      const host = field.closest('[data-q-dot-host]') || field.parentElement;
      if (!host) return;
      let frame = null;
      const update = (event) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = null;
          const rect = field.getBoundingClientRect();
          field.style.setProperty('--q-pointer-x', `${Math.round(event.clientX - rect.left)}px`);
          field.style.setProperty('--q-pointer-y', `${Math.round(event.clientY - rect.top)}px`);
          field.setAttribute('data-pointer', 'true');
        });
      };
      const leave = () => field.setAttribute('data-pointer', 'false');
      host.addEventListener('pointermove', update, { passive: true });
      host.addEventListener('pointerleave', leave);
    });
  }

  function setupEffectsToggle() {
    const switches = $$('[data-q-effects-toggle]');
    const sync = () => {
      const enabled = document.documentElement.dataset.visualEffects !== 'off';
      switches.forEach((sw) => {
        if (QSwitch.get(sw) !== enabled) QSwitch.set(sw, enabled);
      });
    };
    switches.forEach((sw) => {
      if (sw.dataset.qEffectsReady) return;
      sw.dataset.qEffectsReady = 'true';
      sw.addEventListener('q:switch', (event) => {
        const enabled = event.detail.checked;
        if (enabled) delete document.documentElement.dataset.visualEffects;
        else document.documentElement.dataset.visualEffects = 'off';
        sync();
        document.dispatchEvent(new CustomEvent('q:effects', { detail: { enabled } }));
        refreshTokenValues();
      });
    });
    sync();
  }

  /* ---------- Boot splash ---------- */
  const QBoot = {
    _hide: null,
    show({ duration = 2200, label = '正在启动' } = {}) {
      $('.q-boot-splash')?.remove();
      const splash = document.createElement('div');
      splash.className = 'q-boot-splash';
      splash.setAttribute('role', 'status');
      splash.setAttribute('aria-label', label);
      splash.innerHTML = `
        <div class="q-loader q-loader--logo q-loader--xl" aria-hidden="true">
          <span class="q-loader__logo-base"></span>
          <span class="q-loader__logo-blur"></span>
          <span class="q-loader__logo-sweep"><i></i></span>
        </div>
      `;
      document.body.appendChild(splash);
      let timer = null;
      const hide = () => {
        if (!splash.isConnected) return;
        if (timer) { clearTimeout(timer); timer = null; }
        splash.classList.add('is-hiding');
        setTimeout(() => splash.remove(), 140);
        QBoot._hide = null;
      };
      if (duration > 0) timer = setTimeout(hide, duration);
      QBoot._hide = hide;
      return splash;
    },
    hide() { QBoot._hide?.(); }
  };

  function setupBoot() {
    $$('[data-q-boot-replay]').forEach((btn) => {
      if (btn.dataset.qBootReady) return;
      btn.dataset.qBootReady = 'true';
      btn.addEventListener('click', () => QBoot.show({ duration: 2400 }));
    });
  }

  /* ---------- Shell: sidebar, panels, window controls ---------- */
  function setupShells() {
    $$('[data-q-sidebar-toggle]').forEach((btn) => {
      if (btn.dataset.qSidebarReady) return;
      btn.dataset.qSidebarReady = 'true';
      btn.addEventListener('click', () => {
        const win = btn.closest('.q-window');
        if (!win) return;
        const collapsed = win.classList.toggle('is-sidebar-collapsed');
        btn.setAttribute('aria-expanded', String(!collapsed));
        btn.setAttribute('aria-label', collapsed ? '展开侧栏' : '收起侧栏');
        const use = btn.querySelector('use');
        if (use) use.setAttribute('href', collapsed ? '#q-i-layout-sidebar-left-expand' : '#q-i-layout-sidebar-left-collapse');
      });
    });

    $$('[data-q-artifacts-toggle]').forEach((btn) => {
      if (btn.dataset.qArtifactsReady) return;
      btn.dataset.qArtifactsReady = 'true';
      btn.addEventListener('click', () => {
        const win = btn.closest('.q-window');
        if (!win) return;
        const hidden = win.classList.toggle('is-artifacts-hidden');
        btn.setAttribute('aria-pressed', String(!hidden));
      });
    });

    $$('[data-q-sidebar-resizer]').forEach((handle) => {
      if (handle.dataset.qResizeReady) return;
      handle.dataset.qResizeReady = 'true';
      const win = handle.closest('.q-window');
      const sidebar = win?.querySelector('.q-sidebar');
      if (!win || !sidebar) return;
      let startX = 0;
      let startWidth = 0;
      const onMove = (event) => {
        const width = clamp(startWidth + event.clientX - startX, 208, 420);
        sidebar.style.width = `${width}px`;
        win.style.setProperty('--q-sidebar-width', `${width}px`);
      };
      const onUp = (event) => {
        handle.classList.remove('is-dragging');
        handle.releasePointerCapture?.(event.pointerId);
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
        win.dispatchEvent(new CustomEvent('q:sidebar-resize', { bubbles: true, detail: { width: sidebar.getBoundingClientRect().width } }));
      };
      handle.addEventListener('pointerdown', (event) => {
        if (win.classList.contains('is-sidebar-collapsed')) return;
        startX = event.clientX;
        startWidth = sidebar.getBoundingClientRect().width;
        handle.classList.add('is-dragging');
        handle.setPointerCapture?.(event.pointerId);
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
        handle.addEventListener('pointercancel', onUp);
      });
      handle.addEventListener('dblclick', () => {
        sidebar.style.width = '248px';
        win.style.setProperty('--q-sidebar-width', '248px');
      });
    });

    $$('[data-q-window-control]').forEach((btn) => {
      if (btn.dataset.qWindowReady) return;
      btn.dataset.qWindowReady = 'true';
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-q-window-control');
        if (action === 'close') {
          QToast.show({ title: '演示窗口', description: '这是网页中的交互演示，不会关闭当前窗口。', type: 'info' });
        } else if (action === 'minimize') {
          QToast.show({ title: '最小化', description: '在桌面应用中由 Electron 主进程处理。', type: 'info', duration: 2600 });
        } else if (action === 'maximize') {
          QToast.show({ title: '最大化', description: '在桌面应用中由 Electron 主进程处理。', type: 'info', duration: 2600 });
        }
      });
    });
  }

  /* ---------- Slider ---------- */
  function setupSliders() {
    $$('[data-q-slider]').forEach((slider) => {
      if (slider.dataset.qSliderReady) return;
      slider.dataset.qSliderReady = 'true';
      const input = slider.querySelector('input[type="range"]');
      if (!input) return;
      const scope = slider.closest('[data-q-slider-field]') || slider.parentElement;
      const output = scope?.querySelector('[data-q-slider-value]');
      const thumb = slider.querySelector('.q-slider__thumb');
      const unit = slider.getAttribute('data-q-slider-unit') || '';
      const sync = (emit = false) => {
        const min = input.min === '' ? 0 : Number(input.min);
        const max = input.max === '' ? 100 : Number(input.max);
        const value = Number(input.value);
        const pct = max > min ? clamp(((value - min) / (max - min)) * 100, 0, 100) : 0;
        slider.style.setProperty('--q-slider-fill', `${pct}%`);
        const thumbSize = thumb?.offsetWidth || 0;
        const width = slider.clientWidth;
        if (thumbSize && width > 0) {
          // Radix's getThumbInBoundsOffset: interpolate between half-thumb
          // insets, so the visible thumb follows the native input at all values.
          const left = thumbSize / 2 + ((width - thumbSize) * pct) / 100;
          slider.style.setProperty('--q-slider-left', `${left}px`);
        }
        if (output) output.textContent = `${value}${unit}`;
        if (emit) {
          slider.dispatchEvent(new CustomEvent('q:slider', {
            bubbles: true,
            detail: { value, min, max }
          }));
        }
      };
      input.addEventListener('input', () => sync(true));
      if (window.ResizeObserver) new ResizeObserver(() => sync()).observe(slider);
      sync();
    });
  }

  /* ---------- File tree ---------- */
  function setupFileTrees() {
    $$('[data-q-file-tree]').forEach((tree) => {
      if (tree.dataset.qFileTreeReady) return;
      tree.dataset.qFileTreeReady = 'true';
      const rows = () => $$('.q-file-tree__row', tree);
      const select = (row) => {
        rows().forEach((item) => {
          item.classList.remove('is-selected');
          if (item.getAttribute('role') === 'treeitem') item.setAttribute('aria-selected', 'false');
        });
        row.classList.add('is-selected');
        row.setAttribute('aria-selected', 'true');
        tree.dispatchEvent(new CustomEvent('q:file-select', {
          bubbles: true,
          detail: { path: row.getAttribute('data-path') || '', name: row.getAttribute('data-name') || row.textContent.trim() }
        }));
      };
      const toggle = (row, force) => {
        const key = row.getAttribute('data-q-tree-folder');
        const group = key ? tree.querySelector(`[data-q-tree-group="${CSS.escape(key)}"]`) : null;
        const expanded = force === undefined ? !row.classList.contains('is-expanded') : force;
        row.classList.toggle('is-expanded', expanded);
        row.setAttribute('aria-expanded', String(expanded));
        if (group) group.hidden = !expanded;
      };
      rows().forEach((row) => {
        const folder = row.hasAttribute('data-q-tree-folder');
        if (folder && row.getAttribute('aria-expanded') === 'null') row.setAttribute('aria-expanded', 'false');
        if (folder) {
          const key = row.getAttribute('data-q-tree-folder');
          const group = key ? tree.querySelector(`[data-q-tree-group="${CSS.escape(key)}"]`) : null;
          const expanded = row.classList.contains('is-expanded') || row.getAttribute('aria-expanded') === 'true';
          row.classList.toggle('is-expanded', expanded);
          row.setAttribute('aria-expanded', String(expanded));
          if (group) group.hidden = !expanded;
        } else {
          row.setAttribute('aria-selected', String(row.classList.contains('is-selected')));
        }
        row.addEventListener('click', () => {
          if (folder) toggle(row);
          else select(row);
        });
        row.addEventListener('keydown', (event) => {
          const visible = rows().filter((item) => item.offsetParent !== null);
          const index = visible.indexOf(row);
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (folder) toggle(row);
            else select(row);
          }
          if (event.key === 'ArrowRight' && folder) {
            event.preventDefault();
            toggle(row, true);
          }
          if (event.key === 'ArrowLeft' && folder) {
            event.preventDefault();
            toggle(row, false);
          }
          if (event.key === 'ArrowDown' && index < visible.length - 1) {
            event.preventDefault();
            visible[index + 1].focus();
          }
          if (event.key === 'ArrowUp' && index > 0) {
            event.preventDefault();
            visible[index - 1].focus();
          }
          if (event.key === 'Home' && visible[0]) { event.preventDefault(); visible[0].focus(); }
          if (event.key === 'End' && visible.length) { event.preventDefault(); visible[visible.length - 1].focus(); }
        });
      });
    });
  }

  /* ---------- Terminal ---------- */
  function setupTerminals() {
    $$('[data-q-terminal]').forEach((terminal, terminalIndex) => {
      if (terminal.dataset.qTerminalReady) return;
      terminal.dataset.qTerminalReady = 'true';
      const tabs = $$('[data-terminal-tab]', terminal);
      const panes = $$('[data-terminal-pane]', terminal);
      const input = terminal.querySelector('.q-terminal__input');
      const body = terminal.querySelector('.q-terminal__body');
      const closeCurrent = terminal.querySelector('[data-terminal-close-current]');
      const typed = new Map();
      let serial = tabs.length;
      const tabItem = (tab) => tab.closest('[data-terminal-tab-item]') || tab;
      const closeButton = (tab) => tabItem(tab).querySelector('.q-terminal__tab-close');

      tabs.forEach((tab, index) => {
        tab.setAttribute('role', 'tab');
        if (!tab.id) tab.id = `q-terminal-${terminalIndex + 1}-tab-${index + 1}`;
        const pane = panes.find((entry) => entry.getAttribute('data-terminal-pane') === tab.getAttribute('data-terminal-tab'));
        if (pane) {
          if (!pane.id) pane.id = `${tab.id}-pane`;
          tab.setAttribute('aria-controls', pane.id);
          pane.setAttribute('role', 'tabpanel');
          pane.setAttribute('aria-labelledby', tab.id);
        }
      });

      const activePane = () => panes.find((pane) => pane.classList.contains('is-active'));
      const activeTab = () => tabs.find((tab) => tabItem(tab).classList.contains('is-active'));

      const activate = (id, focus = false) => {
        const selected = tabs.find((tab) => tab.getAttribute('data-terminal-tab') === id) || tabs[0];
        if (!selected) return;
        id = selected.getAttribute('data-terminal-tab');
        tabs.forEach((tab) => {
          const on = tab === selected;
          tab.classList.toggle('is-active', on);
          tabItem(tab).classList.toggle('is-active', on);
          tab.setAttribute('aria-selected', String(on));
          tab.setAttribute('tabindex', on ? '0' : '-1');
          const close = closeButton(tab);
          if (close) {
            close.disabled = tabs.length <= 1;
            close.tabIndex = on ? 0 : -1;
          }
        });
        panes.forEach((pane) => {
          const on = pane.getAttribute('data-terminal-pane') === id;
          pane.classList.toggle('is-active', on);
          pane.hidden = !on;
        });
        if (input) {
          input.value = typed.get(id) || '';
          const echo = activePane()?.querySelector('[data-terminal-echo]');
          if (echo) echo.textContent = input.value;
        }
        if (closeCurrent) closeCurrent.disabled = tabs.length <= 1;
        if (focus) selected.focus({ preventScroll: true });
        terminal.dispatchEvent(new CustomEvent('q:terminal-tab', { bubbles: true, detail: { id } }));
      };

      const syncEcho = () => {
        const pane = activePane();
        if (!pane || !input) return;
        typed.set(pane.getAttribute('data-terminal-pane'), input.value);
        const echo = pane.querySelector('[data-terminal-echo]');
        if (echo) echo.textContent = input.value;
      };

      const append = (pane, html, className = 'q-terminal__line') => {
        const line = document.createElement('div');
        line.className = className;
        line.innerHTML = html;
        pane.querySelector('[data-terminal-history]')?.appendChild(line);
        pane.scrollTop = pane.scrollHeight;
      };

      const promptPrefix = '<span class="q-terminal__prompt-path">~/QoderDesign</span> <span class="q-terminal__prompt-branch">git:(main)</span> <span class="q-terminal__prompt-mark">❯</span> ';

      const run = (raw) => {
        const pane = activePane();
        const command = raw.trim();
        if (!pane) return;
        if (!command) {
          append(pane, promptPrefix);
          return;
        }
        append(pane, `${promptPrefix}<span class="q-terminal__command"></span>`);
        pane.querySelector('[data-terminal-history]').lastChild.querySelector('.q-terminal__command').textContent = command;
        const responses = {
          ls: '<span class="q-terminal__line--accent">dist/  node_modules/  src/</span>  <span class="q-terminal__line--dim">index.html  package.json  README.md</span>',
          pwd: '~/QoderDesign',
          'git status': '<span class="q-terminal__line--dim">On branch main</span>\nYour branch is up to date with \'origin/main\'.<br>nothing to commit, working tree clean',
          'npm run build': '<span class="q-terminal__line--dim">&gt; qoder-design-kit@0.4.8 build<br>&gt; vite build</span><br><br><span class="q-terminal__line--ok">✓ 138 modules transformed.</span><br><span class="q-terminal__line--ok">✓ built in 1.42s</span>',
          clear: ''
        };
        if (command === 'clear') {
          const history = pane.querySelector('[data-terminal-history]');
          if (history) history.innerHTML = '';
          return;
        }
        if (Object.prototype.hasOwnProperty.call(responses, command)) {
          append(pane, responses[command]);
        } else {
          append(pane, `<span class="q-terminal__line--err">zsh: command not found: ${command.replace(/[<>&]/g, '')}</span>`);
        }
      };

      const bindTab = (tab) => {
        tab.addEventListener('click', () => activate(tab.getAttribute('data-terminal-tab')));
        tab.addEventListener('keydown', (event) => {
          const index = tabs.indexOf(tab);
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            const delta = event.key === 'ArrowRight' ? 1 : -1;
            activate(tabs[(index + delta + tabs.length) % tabs.length].getAttribute('data-terminal-tab'), true);
          }
          if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            const next = event.key === 'Home' ? tabs[0] : tabs[tabs.length - 1];
            activate(next.getAttribute('data-terminal-tab'), true);
          }
          if (event.key === 'Delete') {
            event.preventDefault();
            closeTab(tab.getAttribute('data-terminal-tab'), true);
          }
        });
        closeButton(tab)?.addEventListener('click', (event) => {
          event.stopPropagation();
          closeTab(tab.getAttribute('data-terminal-tab'), true);
        });
      };

      body?.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        input?.focus({ preventScroll: true });
      });

      input?.addEventListener('input', syncEcho);
      input?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          run(input.value);
          input.value = '';
          syncEcho();
        }
      });

      $$('[data-terminal-theme-toggle]', terminal).forEach((btn) => {
        btn.addEventListener('click', () => {
          const light = terminal.getAttribute('data-terminal-theme') === 'light';
          terminal.setAttribute('data-terminal-theme', light ? 'dark' : 'light');
          const use = btn.querySelector('use');
          if (use) use.setAttribute('href', light ? '#q-i-sun' : '#q-i-moon');
          btn.setAttribute('aria-label', light ? '切换到亮色终端' : '切换到暗色终端');
          btn.setAttribute('aria-pressed', String(light));
        });
      });

      $$('[data-terminal-new]', terminal).forEach((btn) => {
        btn.addEventListener('click', () => {
          const number = ++serial;
          const id = `terminal-${terminalIndex + 1}-session-${number}`;
          const firstTab = tabs[0];
          const firstPane = panes[0];
          if (!firstTab || !firstPane) return;
          const item = tabItem(firstTab).cloneNode(true);
          const tab = item.matches('[data-terminal-tab]') ? item : item.querySelector('[data-terminal-tab]');
          tab.setAttribute('data-terminal-tab', id);
          tab.id = `term-tab-${id}`;
          tab.setAttribute('aria-controls', `term-pane-${id}`);
          tab.querySelector('.q-terminal__tab-label').textContent = `zsh ${number}`;
          const closeLabel = item.querySelector('.q-terminal__tab-close');
          if (closeLabel) closeLabel.setAttribute('aria-label', `关闭 zsh ${number}`);
          const pane = firstPane.cloneNode(true);
          pane.setAttribute('data-terminal-pane', id);
          pane.id = `term-pane-${id}`;
          pane.setAttribute('aria-labelledby', tab.id);
          pane.hidden = true;
          pane.classList.remove('is-active');
          const history = pane.querySelector('[data-terminal-history]');
          if (history) history.innerHTML = '<span class="q-terminal__line q-terminal__line--dim">Last login: today on ttys002</span><span class="q-terminal__line">&nbsp;</span>';
          const echo = pane.querySelector('[data-terminal-echo]');
          if (echo) echo.textContent = '';
          tabItem(tabs[tabs.length - 1]).after(item);
          panes[panes.length - 1].after(pane);
          tabs.push(tab);
          panes.push(pane);
          bindTab(tab);
          activate(id, true);
        });
      });

      const closeTab = (id, focus = false) => {
        if (tabs.length <= 1) return;
        const index = tabs.findIndex((tab) => tab.getAttribute('data-terminal-tab') === id);
        if (index < 0) return;
        const wasActive = tabs[index].classList.contains('is-active');
        tabItem(tabs[index]).remove();
        panes.find((pane) => pane.getAttribute('data-terminal-pane') === id)?.remove();
        tabs.splice(0, tabs.length, ...$$('[data-terminal-tab]', terminal));
        panes.splice(0, panes.length, ...$$('[data-terminal-pane]', terminal));
        typed.delete(id);
        const next = wasActive ? tabs[Math.min(index, tabs.length - 1)] : activeTab();
        activate(next?.getAttribute('data-terminal-tab'), focus);
      };

      closeCurrent?.addEventListener('click', () => {
        closeTab(activeTab()?.getAttribute('data-terminal-tab'), true);
      });

      tabs.forEach(bindTab);

      const current = activeTab() || tabs[0];
      if (current) activate(current.getAttribute('data-terminal-tab'));
    });
  }

  /* ---------- Chart ---------- */
  function setupCharts() {
    $$('[data-q-chart]').forEach((chart) => {
      if (chart.dataset.qChartReady) return;
      chart.dataset.qChartReady = 'true';
      const plot = chart.querySelector('.q-chart__plot');
      const tooltip = chart.querySelector('.q-chart__tooltip');
      const guide = chart.querySelector('.q-chart__guide');
      const points = $$('.q-chart__point', chart);
      if (!plot || !tooltip || !points.length) return;
      const viewWidth = Number(plot.getAttribute('data-view-width')) || 540;
      const viewHeight = Number(plot.getAttribute('data-view-height')) || 250;
      tooltip.innerHTML = `<div class="q-chart__tooltip-title"></div>
        <div class="q-chart__tooltip-row"><span class="q-chart__tooltip-label"><i class="q-chart__tooltip-swatch" style="background:var(--q-primary)"></i>对话轮次</span><span class="q-chart__tooltip-value"></span></div>
        <div class="q-chart__tooltip-row"><span class="q-chart__tooltip-label"><i class="q-chart__tooltip-swatch" style="background:var(--q-accent-blue)"></i>代码变更</span><span class="q-chart__tooltip-value"></span></div>`;
      const tooltipTitle = tooltip.querySelector('.q-chart__tooltip-title');
      const tooltipValues = $$('.q-chart__tooltip-value', tooltip);
      const hide = () => {
        tooltip.classList.remove('is-visible');
        if (guide) guide.setAttribute('opacity', '0');
      };
      const show = (point) => {
        const x = Number(point.getAttribute('data-x'));
        const y = Number(point.getAttribute('data-y'));
        const label = point.getAttribute('data-label') || '';
        const primary = point.getAttribute('data-primary') || '';
        const secondary = point.getAttribute('data-secondary') || '';
        tooltipTitle.textContent = label;
        tooltipValues[0].textContent = primary;
        tooltipValues[1].textContent = secondary;
        const left = clamp((x / viewWidth) * 100, 0, 100);
        const top = clamp((y / viewHeight) * 100, 0, 100);
        tooltip.style.left = `${left}%`;
        tooltip.style.top = `${top}%`;
        tooltip.classList.toggle('is-left', left > 62);
        tooltip.classList.add('is-visible');
        if (guide) {
          guide.setAttribute('x1', String(x));
          guide.setAttribute('x2', String(x));
          guide.setAttribute('opacity', '1');
        }
      };
      points.forEach((point) => {
        point.addEventListener('mouseenter', () => show(point));
        point.addEventListener('focus', () => show(point));
        point.addEventListener('click', () => show(point));
      });
      plot.addEventListener('mouseleave', hide);
      chart.addEventListener('focusout', (event) => {
        if (!chart.contains(event.relatedTarget)) hide();
      });
      chart.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') hide();
      });
    });
  }

  /* ---------- Settings surface ---------- */
  function setupSettingsSurfaces() {
    $$('[data-q-settings]').forEach((surface, surfaceIndex) => {
      if (surface.dataset.qSettingsReady) return;
      surface.dataset.qSettingsReady = 'true';
      const items = $$('[data-settings-section]', surface);
      const panels = $$('[data-settings-panel]', surface);
      const title = surface.querySelector('[data-settings-title]');
      const scroll = surface.querySelector('.q-settings__scroll');
      const search = surface.querySelector('[data-settings-search]');
      const empty = surface.querySelector('.q-settings__nav-empty');
      const nav = surface.querySelector('.q-settings__nav');
      const narrow = window.matchMedia('(max-width: 720px)');
      const syncOrientation = () => nav?.setAttribute('aria-orientation', narrow.matches ? 'horizontal' : 'vertical');
      nav?.setAttribute('role', 'tablist');
      syncOrientation();
      narrow.addEventListener('change', syncOrientation);
      const syncTabStops = () => {
        const visible = items.filter((entry) => !entry.hidden);
        const current = visible.find((entry) => entry.getAttribute('aria-selected') === 'true') || visible[0];
        items.forEach((entry) => entry.setAttribute('tabindex', entry === current ? '0' : '-1'));
      };
      const activate = (id) => {
        const item = items.find((entry) => entry.getAttribute('data-settings-section') === id) || items[0];
        if (!item) return;
        const section = item.getAttribute('data-settings-section');
        items.forEach((entry) => {
          const on = entry === item;
          entry.setAttribute('aria-selected', String(on));
          entry.setAttribute('tabindex', on ? '0' : '-1');
        });
        panels.forEach((panel) => {
          panel.hidden = panel.getAttribute('data-settings-panel') !== section;
        });
        syncTabStops();
        if (title) title.textContent = item.getAttribute('data-settings-label') || item.textContent.trim();
        if (scroll) scroll.scrollTop = 0;
        surface.dispatchEvent(new CustomEvent('q:settings-section', { bubbles: true, detail: { section, item } }));
      };
      items.forEach((item, index) => {
        item.setAttribute('role', 'tab');
        if (!item.id) item.id = `q-settings-${surfaceIndex + 1}-${item.getAttribute('data-settings-section')}-tab`;
        const panel = panels.find((entry) => entry.getAttribute('data-settings-panel') === item.getAttribute('data-settings-section'));
        if (panel) {
          if (!panel.id) panel.id = `${item.id}-panel`;
          item.setAttribute('aria-controls', panel.id);
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('aria-labelledby', item.id);
          if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '0');
        }
        item.addEventListener('click', () => activate(item.getAttribute('data-settings-section')));
        item.addEventListener('keydown', (event) => {
          const nextKey = narrow.matches ? 'ArrowRight' : 'ArrowDown';
          const previousKey = narrow.matches ? 'ArrowLeft' : 'ArrowUp';
          if (![nextKey, previousKey, 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const visible = items.filter((entry) => !entry.hidden && entry.offsetParent !== null);
          const at = visible.indexOf(item);
          let next = at;
          if (event.key === nextKey) next = (at + 1) % visible.length;
          if (event.key === previousKey) next = (at - 1 + visible.length) % visible.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = visible.length - 1;
          visible[next]?.focus();
          visible[next]?.click();
        });
        if (!item.hasAttribute('aria-selected')) item.setAttribute('aria-selected', String(index === 0));
      });
      search?.addEventListener('input', () => {
        const query = search.value.trim().toLowerCase();
        let matches = 0;
        $$('.q-settings__nav-group', surface).forEach((group) => {
          let groupMatches = 0;
          $$('.q-settings__nav-item', group).forEach((item) => {
            const hit = !query || item.textContent.toLowerCase().includes(query);
            item.hidden = !hit;
            if (hit) groupMatches++;
          });
          group.hidden = groupMatches === 0;
          matches += groupMatches;
        });
        if (empty) empty.hidden = matches !== 0;
        syncTabStops();
      });
      const selected = items.find((item) => item.getAttribute('aria-selected') === 'true') || items[0];
      if (selected) activate(selected.getAttribute('data-settings-section'));
    });
  }

  /* ---------- Init ---------- */
  function init() {
    initTheme();
    setupPopupDismissal();
    setupMenus();
    setupSelects();
    setupDialogs();
    setupTabs();
    setupSwitches();
    setupTooltips();
    setupToastTriggers();
    setupComposers();
    setupCommandPalette();
    setupContextMenus();
    setupScrollFades();
    setupDotFields();
    setupEffectsToggle();
    setupSliders();
    setupFileTrees();
    setupTerminals();
    setupCharts();
    setupSettingsSurfaces();
    setupBoot();
    setupShells();
    scheduleTokenRefresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.QTheme = QTheme;
  window.QToast = QToast;
  window.QComposer = QComposer;
  window.QSwitch = QSwitch;
  window.QBoot = QBoot;
  window.QTokens = { refresh: refreshTokenValues };
})();
