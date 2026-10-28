import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4180',
    browserName: 'chromium',
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: { mode: 'retain-on-failure', snapshots: false, screenshots: false }
  },
  webServer: {
    command: 'node tools/serve.mjs 4180',
    url: 'http://127.0.0.1:4180',
    reuseExistingServer: !process.env.CI
  }
});
