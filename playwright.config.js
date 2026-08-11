import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  reporter: [['line']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    channel: 'msedge',
    colorScheme: 'light',
    reducedMotion: 'reduce'
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:3000/design-system',
    reuseExistingServer: true,
    timeout: 120000
  }
});
