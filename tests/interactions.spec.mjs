import { test, expect } from '@playwright/test';

async function mount(page, content) {
  await page.route('**/__components.html', route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>组件交互回归</title><link rel="stylesheet" href="/assets/css/tokens.css">
      <link rel="stylesheet" href="/assets/css/components.css"></head>
      <body><main style="padding:32px"><h1>组件交互回归</h1>${content}</main>
      <script src="/assets/js/qoder-icons.js"></script><script src="/assets/js/qoder-ui.js"></script></body></html>`
  }));
  await page.goto('/__components.html');
  await page.waitForFunction(() => Boolean(window.QTheme));
}

const select = (id = 'language') => `<div class="q-select q-select--form" data-q-select id="${id}">
  <button type="button" class="q-select__trigger" aria-label="语言"><span data-q-select-label>Alpha</span></button>
  <div class="q-select__menu" role="listbox" hidden>
    <button type="button" class="q-select__option" role="option" data-value="alpha" aria-selected="true">Alpha</button>
    <button type="button" class="q-select__option" role="option" data-value="beta" disabled>Beta</button>
    <button type="button" class="q-select__option" role="option" data-value="gamma" aria-disabled="true">Gamma</button>
    <button type="button" class="q-select__option" role="option" data-value="hidden" hidden>Hidden</button>
    <button type="button" class="q-select__option" role="option" data-value="delta">Delta</button>
    <button type="button" class="q-select__option" role="option" data-value="echo">Echo</button>
  </div>
</div>`;

const menu = `<div class="q-menu-wrap">
  <button type="button" id="menu-trigger" data-q-menu-trigger aria-controls="actions">更多操作</button>
  <div class="q-menu" id="actions" role="menu" hidden>
    <button type="button" class="q-menu__item" role="menuitem" data-value="copy">复制</button>
    <button type="button" class="q-menu__item" role="menuitem" data-value="disabled" aria-disabled="true">停用操作</button>
    <button type="button" class="q-menu__item" role="menuitemcheckbox" aria-checked="false" data-value="pin">置顶</button>
  </div>
</div>`;

test('select links its named listbox and skips disabled or hidden options', async ({ page }) => {
  await mount(page, select());
  const trigger = page.locator('.q-select__trigger');
  await trigger.press('ArrowDown');
  const listbox = page.getByRole('listbox');
  await expect(listbox).toHaveAccessibleName('语言');
  await expect(trigger).toHaveAttribute('aria-controls', await listbox.getAttribute('id'));
  await expect(page.getByRole('option', { name: 'Alpha' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option', { name: 'Delta' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('option', { name: 'Echo' })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.getByRole('option', { name: 'Alpha' })).toBeFocused();
});

test('select typeahead moves focus without committing until Enter', async ({ page }) => {
  await mount(page, select());
  await page.locator('.q-select__trigger').press('Enter');
  await page.keyboard.type('de');
  await expect(page.getByRole('option', { name: 'Delta' })).toBeFocused();
  await expect(page.locator('#language')).toHaveAttribute('data-value', 'alpha');
  await page.keyboard.press('Enter');
  await expect(page.locator('#language')).toHaveAttribute('data-value', 'delta');
  await expect(page.locator('[data-q-select-label]')).toHaveText('Delta');
  await expect(page.locator('.q-select__trigger')).toBeFocused();
});

test('Space opens a select with non-button options without immediately choosing one', async ({ page }) => {
  await mount(page, `<div class="q-select" data-q-select>
    <button class="q-select__trigger" type="button"><span data-q-select-label>Alpha</span></button>
    <div class="q-select__menu" role="listbox" hidden>
      <div class="q-select__option" role="option" data-value="alpha" aria-selected="true">Alpha</div>
      <div class="q-select__option" role="option" data-value="beta">Beta</div>
    </div></div>`);
  await page.locator('.q-select__trigger').press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.down('Space');
  await expect(page.locator('[data-q-select]')).toHaveAttribute('data-value', 'alpha');
  await page.keyboard.up('Space');
  await expect(page.locator('[data-q-select]')).toHaveAttribute('data-value', 'beta');
  await expect(page.locator('.q-select__menu')).toBeHidden();
});

test('select cannot commit an aria-disabled option', async ({ page }) => {
  await mount(page, select());
  await page.locator('.q-select__trigger').click();
  await page.locator('[data-value="gamma"]').evaluate(option => option.click());
  await expect(page.locator('#language')).toHaveAttribute('data-value', 'alpha');
  await expect(page.getByRole('listbox')).toBeVisible();
});

test('select Tab and Shift+Tab continue from the trigger', async ({ page }) => {
  await mount(page, `<button id="before">前一项</button>${select()}<button id="after">后一项</button>`);
  const trigger = page.locator('.q-select__trigger');
  await trigger.press('Enter');
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#before')).toBeFocused();
  await expect(page.locator('.q-select__menu')).toBeHidden();
  await trigger.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.locator('#after')).toBeFocused();
});

test('popups close when focus leaves and opening another popup closes the first', async ({ page }) => {
  await mount(page, `${select()}${menu}<button id="outside">外部</button>`);
  await page.locator('.q-select__trigger').press('Enter');
  await page.locator('#outside').focus();
  await expect(page.locator('.q-select__menu')).toBeHidden();
  await page.locator('.q-select__trigger').press('Enter');
  await page.locator('#menu-trigger').evaluate(button => button.click());
  await expect(page.locator('#actions')).toBeVisible();
  await expect(page.locator('.q-select__menu')).toBeHidden();
});

test('menu keyboard skips disabled actions and dispatches checkbox selections', async ({ page }) => {
  await mount(page, menu);
  await page.locator('#menu-trigger').evaluate(button => {
    window.selections = [];
    button.addEventListener('q:menu-select', event => window.selections.push(event.detail.value));
  });
  await page.locator('#menu-trigger').press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemcheckbox')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.selections)).toEqual(['pin']);
  await expect(page.locator('#actions')).toBeHidden();
  await expect(page.locator('#menu-trigger')).toBeFocused();
});

test('tabs never select disabled tabs and ignore hidden tabs', async ({ page }) => {
  await mount(page, `<div data-q-tab-group><div class="q-tabs" data-q-tabs aria-label="内容">
    <button data-q-tab="one" aria-selected="true">一</button>
    <button data-q-tab="two" disabled>二</button>
    <button data-q-tab="three" aria-disabled="true">三</button>
    <button data-q-tab="hidden" hidden>隐藏</button>
    <button data-q-tab="four">四</button></div>
    <div data-q-panel="one">第一面板</div><div data-q-panel="two">第二面板</div>
    <div data-q-panel="three">第三面板</div><div data-q-panel="four">第四面板</div></div>`);
  await page.getByRole('tab', { name: '一', exact: true }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: '四', exact: true })).toBeFocused();
  await expect(page.locator('[data-q-panel="four"]')).toBeVisible();
  await page.locator('[data-q-tab="three"]').evaluate(button => button.click());
  await expect(page.getByRole('tab', { name: '四', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: '一', exact: true })).toBeFocused();
});

test('context menu works with Shift+F10, arrow keys and Escape', async ({ page }) => {
  await mount(page, `<button id="context-zone" data-q-context-menu="context-actions">任务</button>
    <div class="q-menu q-context-menu" id="context-actions" role="menu" aria-label="任务操作" hidden>
      <button class="q-menu__item" role="menuitem">复制</button>
      <button class="q-menu__item" role="menuitem">删除</button></div>`);
  await page.locator('#context-zone').press('Shift+F10');
  await expect(page.getByRole('menuitem', { name: '复制' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: '删除' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#context-actions')).toBeHidden();
  await expect(page.locator('#context-zone')).toBeFocused();
});

test('tooltip adds and removes its description without losing existing hints', async ({ page }) => {
  await mount(page, `<p id="hint">原有说明</p><button id="tip" data-q-tooltip="更多说明" aria-describedby="hint">帮助</button>`);
  const target = page.locator('#tip');
  await target.focus();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  await expect(target).toHaveAccessibleDescription('原有说明 更多说明');
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await expect(target).toHaveAttribute('aria-describedby', 'hint');
  await expect(target).toBeFocused();
});

test('tooltip is reachable inside a native modal and Escape dismisses it first', async ({ page }) => {
  await mount(page, `<button data-q-dialog-open="dialog">打开</button>
    <dialog id="dialog" class="q-dialog" aria-label="详情"><div class="q-dialog__panel">
      <button id="tip" data-q-tooltip="弹窗中的说明">帮助</button><button data-q-dialog-close>关闭</button>
    </div></dialog>`);
  await page.getByRole('button', { name: '打开', exact: true }).click();
  await expect(page.locator('#dialog [role="tooltip"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#dialog')).toBeHidden();
});

test('dragging from a dialog panel onto the backdrop does not close it', async ({ page }) => {
  await mount(page, `<button data-q-dialog-open="dialog">打开</button>
    <dialog id="dialog" class="q-dialog" aria-label="详情"><div class="q-dialog__panel">
      <p>可以选择和复制这段说明。</p><button data-q-dialog-close>关闭</button>
    </div></dialog>`);
  await page.getByRole('button', { name: '打开', exact: true }).click();
  const panel = await page.locator('.q-dialog__panel').boundingBox();
  await page.mouse.move(panel.x + 20, panel.y + 20);
  await page.mouse.down();
  await page.mouse.move(8, 8);
  await page.mouse.up();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.mouse.click(8, 8);
  await expect(page.locator('#dialog')).toBeHidden();
});

test('a select near the bottom of a mobile viewport stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await mount(page, `<div style="position:fixed;right:16px;bottom:16px">${select()}</div>`);
  await page.locator('.q-select__trigger').click();
  const bounds = await page.getByRole('listbox').boundingBox();
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(600);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
});

test('command palette does not execute while confirming an IME composition', async ({ page }) => {
  await page.goto('/');
  await page.locator('.dk-search-trigger').click();
  const input = page.locator('[data-q-command-input]');
  await input.fill('开关');
  await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
  await expect(page.locator('#command-palette')).toBeVisible();
  await input.press('Enter');
  await expect(page.locator('#command-palette')).toBeHidden();
  await expect(page).toHaveURL(/#component-switch$/);
});

test('command search normalizes full-width input and matches multiple words', async ({ page }) => {
  await page.goto('/');
  await page.locator('.dk-search-trigger').click();
  await page.locator('[data-q-command-input]').fill('ＳＷＩＴＣＨ 开关');
  await expect(page.locator('#command-palette [data-command="navigate:#component-switch"]')).toBeVisible();
});

test('chart treats dynamic labels and values as text', async ({ page }) => {
  await page.goto('/');
  const point = page.locator('.q-chart__point').first();
  await point.evaluate(node => {
    node.dataset.label = '<em data-untrusted>日期</em>';
    node.dataset.primary = '<em data-untrusted>1</em>';
    node.dispatchEvent(new Event('mouseenter'));
  });
  await expect(page.locator('.q-chart__tooltip [data-untrusted]')).toHaveCount(0);
  await expect(page.locator('.q-chart__tooltip-title')).toHaveText('<em data-untrusted>日期</em>');
});

test('unknown theme names fall back to light instead of inherited object keys', async ({ page }) => {
  await page.goto('/?theme=constructor');
  await page.waitForFunction(() => Boolean(window.QTheme));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => QTheme.set('__proto__', { animate: false }))).toBe('light');
});

test('token refresh leaves unchanged content alone and rapid changes show the final theme', async ({ page }) => {
  await mount(page, `<div data-token="--q-primary"><span data-token-value></span></div>
    <span data-theme-id></span><span data-theme-name></span><button data-q-theme-toggle>主题</button>`);
  const mutations = await page.evaluate(async () => {
    QTokens.refresh();
    const observer = new MutationObserver(() => {});
    observer.observe(document.body, { childList: true, attributes: true, subtree: true, characterData: true });
    QTokens.refresh();
    const count = observer.takeRecords().length;
    observer.disconnect();
    QTheme.set('forest-dark', { animate: false });
    QTheme.set('bee-light', { animate: false });
    QTheme.set('mint-dark', { animate: false });
    return count;
  });
  expect(mutations).toBe(0);
  await expect(page.locator('[data-theme-id]')).toHaveText('mint-dark');
  const value = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim());
  await expect(page.locator('[data-token-value]')).toHaveText(value);
});

test('a native modal blocks background scrolling until closed', async ({ page }) => {
  await mount(page, `<button data-q-dialog-open="dialog">打开</button><div style="height:1800px"></div>
    <dialog id="dialog" class="q-dialog" aria-label="详情"><div class="q-dialog__panel"><button data-q-dialog-close>关闭</button></div></dialog>`);
  await page.getByRole('button', { name: '打开', exact: true }).click();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).toBe('hidden');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).not.toBe('hidden');
});
