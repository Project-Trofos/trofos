import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/admin.json' });

test('Check welcome message', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await expect(page.getByText('Welcome, User 3')).toBeVisible();
});