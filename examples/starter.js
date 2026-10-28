/* Example business code; the library owns switch, slider and theme behavior. */
(function () {
  'use strict';
  function init() {
    const form = document.getElementById('workspace-preferences');
    const themePicker = document.querySelector('[data-starter-theme]');
    const status = document.querySelector('[data-starter-status]');
    const switches = Array.from(form.querySelectorAll('[data-preference]'));
    const storageKey = 'qdk-starter-preferences';

    const syncTheme = () => { themePicker.value = QTheme.get() === 'dark' ? 'forest-dark' : QTheme.get(); };
    // This settings form stays interactive during rapid edits and saves.
    themePicker.addEventListener('change', () => QTheme.set(themePicker.value, { animate: false }));
    document.addEventListener('q:themechange', syncTheme);
    syncTheme();

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && typeof saved === 'object') {
        if (typeof saved.workspaceName === 'string') form.elements.workspaceName.value = saved.workspaceName;
        if (['standard', 'wide'].includes(saved.contentWidth)) form.elements.contentWidth.value = saved.contentWidth;
        if (Number.isFinite(saved.interfaceScale)) {
          form.elements.interfaceScale.value = String(saved.interfaceScale);
          form.elements.interfaceScale.dispatchEvent(new Event('input', { bubbles: true }));
        }
        switches.forEach(sw => {
          if (typeof saved[sw.dataset.preference] === 'boolean') QSwitch.set(sw, saved[sw.dataset.preference]);
        });
      }
    } catch (error) { /* Local storage is optional, including when opened as a file. */ }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const preferences = {
        workspaceName: form.elements.workspaceName.value.trim(),
        contentWidth: form.elements.contentWidth.value,
        interfaceScale: Number(form.elements.interfaceScale.value)
      };
      switches.forEach(sw => { preferences[sw.dataset.preference] = QSwitch.get(sw); });
      try {
        localStorage.setItem(storageKey, JSON.stringify(preferences));
        status.textContent = `${preferences.workspaceName} 的设置已保存。`;
        QToast.show({ title: '设置已保存', description: '重新打开页面时会保留这些偏好。', type: 'success' });
      } catch (error) {
        status.textContent = '设置已应用到当前页面。';
        QToast.show({ title: '设置已应用', description: '当前环境未提供本地存储。', type: 'info' });
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
