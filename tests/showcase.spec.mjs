import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => {
    if (request.failure()?.errorText !== 'net::ERR_ABORTED') errors.push(`${request.url()}: ${request.failure()?.errorText}`);
  });
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  return errors;
}

for (const theme of ['light', 'forest-dark']) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`showcase and starter fit ${width}px in ${theme}`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/', '/examples/starter.html']) {
        await page.goto(`${path}?theme=${theme}`);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      }
      expect(errors).toEqual([]);
    });
  }
}

test('all nine theme cards and the header selector stay synchronized', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');
  const errors = collectErrors(page);
  const themes = await page.locator('[data-theme-card]').evaluateAll(cards => cards.map(card => card.dataset.themeCard));
  expect(themes).toHaveLength(9);
  for (const theme of themes) {
    await page.locator(`[data-theme-card="${theme}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator(`[data-theme-card="${theme}"]`)).toHaveAttribute('aria-pressed', 'true');
    expect(new URL(page.url()).searchParams.get('theme')).toBe(theme);
  }
  await page.locator('.dk-theme-picker .q-select__trigger').click();
  await page.locator('.dk-theme-picker [data-value="mint"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'mint-dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'mint-dark');
  expect(errors).toEqual([]);
});

test('mobile navigation hands focus to search and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const trigger = page.locator('[data-dk-menu-open]');
  await trigger.click();
  await expect(page.locator('#dk-nav-sheet')).toBeVisible();
  await page.locator('[data-dk-sheet-search]').click();
  await expect(page.locator('#dk-nav-sheet')).toBeHidden();
  await expect(page.locator('[data-q-command-input]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#command-palette')).toBeHidden();
  await expect(page.locator('.dk-search-trigger')).toBeFocused();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#dk-nav-sheet')).toBeHidden();
  await page.setViewportSize({ width: 768, height: 844 });
  await trigger.click();
  await page.mouse.click(8, 400);
  await expect(page.locator('#dk-nav-sheet')).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('component and icon filters survive reload and recover from empty results', async ({ page }) => {
  await page.goto('/');
  const search = page.locator('[data-dk-component-search]');
  await search.fill('开关');
  await expect(page.locator('.dk-comp:visible')).toHaveCount(1);
  await page.reload();
  await expect(search).toHaveValue('开关');
  await expect(page.locator('#component-switch')).toBeVisible();
  await search.fill('zz-no-component');
  await expect(page.locator('[data-dk-component-empty]')).toBeVisible();
  await page.locator('[data-dk-show-all]').click();
  await expect(page.locator('.dk-comp:visible')).toHaveCount(23);
  const icons = page.locator('[data-dk-icon-search]');
  await icons.fill('文件夹');
  expect(await page.locator('[data-icon-name]:visible').count()).toBeGreaterThan(0);
  await page.reload();
  await expect(icons).toHaveValue('文件夹');
});

test('all 22 exported component pages load their references and stay interactive', async ({ page, context }) => {
  test.setTimeout(60000);
  await page.goto('/?theme=forest-dark');
  const cards = await page.locator('.dk-comp:has([data-dk-code-open])').evaluateAll(cards => cards.map(card => card.id));
  expect(cards).toHaveLength(22);
  const example = await context.newPage();
  const errors = collectErrors(example);
  let source = '';
  await example.route('**/__export.html', route => route.fulfill({ contentType: 'text/html', body: source }));
  try {
    for (const id of cards) {
      await page.locator(`#${id} [data-dk-code-open]`).click();
      await page.locator('#code-page-tab').click();
      source = await page.locator('[data-code-dialog-page]').textContent();
      await page.keyboard.press('Escape');
      await example.goto('/__export.html');
      await expect(example.locator('html')).toHaveAttribute('data-theme', 'forest-dark');
      const invalid = await example.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        const missing = [];
        for (const node of document.querySelectorAll('[aria-controls], [aria-labelledby], [aria-describedby], [for]')) {
          for (const name of ['aria-controls', 'aria-labelledby', 'aria-describedby', 'for']) {
            for (const id of (node.getAttribute(name) || '').split(/\s+/).filter(Boolean)) {
              if (!document.getElementById(id)) missing.push(`${name}=${id}`);
            }
          }
        }
        return { duplicates, missing };
      });
      expect(invalid, id).toEqual({ duplicates: [], missing: [] });
      if (id === 'component-menus') {
        await example.locator('.q-select__trigger').press('Enter');
        await example.keyboard.press('End');
        await example.keyboard.press('Enter');
        await expect(example.locator('[data-q-select]')).toHaveAttribute('data-value', 'auto');
      }
      if (id === 'component-hover-context') {
        await example.locator('[data-q-context-menu]').click();
        await expect(example.locator('.q-context-menu')).toBeVisible();
        await example.keyboard.press('Escape');
        await expect(example.locator('[data-q-context-menu]')).toBeFocused();
      }
      if (id === 'component-switch') {
        const control = example.locator('[data-q-switch]').first();
        const initial = await control.getAttribute('aria-checked');
        await control.press('Space');
        await expect(control).toHaveAttribute('aria-checked', initial === 'true' ? 'false' : 'true');
      }
    }
  } finally { await example.close(); }
  expect(errors).toEqual([]);
});

test('starter preferences still persist with native form controls', async ({ page }) => {
  await page.goto('/examples/starter.html');
  await page.locator('[name="workspaceName"]').fill('交互回归工作区');
  await page.locator('[data-preference="notifications"]').click();
  await page.getByText('宽', { exact: true }).click();
  await page.locator('[name="interfaceScale"]').press('End');
  await page.getByRole('button', { name: '保存设置' }).click();
  await expect(page.locator('[data-starter-status]')).toContainText('交互回归工作区');
  await page.reload();
  await expect(page.locator('[name="workspaceName"]')).toHaveValue('交互回归工作区');
  await expect(page.locator('[data-preference="notifications"]')).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[name="contentWidth"][value="wide"]')).toBeChecked();
  await expect(page.locator('[name="interfaceScale"]')).toHaveValue('120');
  await expect(page.locator('[data-q-slider-value]')).toHaveText('120%');
});

test('open select and command palette have no structural accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const audit = async () => page.evaluate(async () => {
    const results = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      // The extracted source palette has known contrast limitations, tracked separately.
      rules: { 'color-contrast': { enabled: false } }
    });
    return results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }));
  });
  await page.locator('#component-menus .q-select__trigger').click();
  expect(await audit()).toEqual([]);
  await page.keyboard.press('Escape');
  await page.locator('.dk-search-trigger').click();
  expect(await audit()).toEqual([]);
});

test('direct file preview keeps local assets and interactions working', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(pathToFileURL(resolve(root, 'index.html')).href);
  await page.locator('.dk-search-trigger').click();
  await page.locator('[data-q-command-input]').fill('开关');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#component-switch$/);
  await page.locator('#component-switch [data-dk-code-open]').click();
  await expect(page.locator('#code-dialog')).toBeVisible();
  expect(errors).toEqual([]);
});
