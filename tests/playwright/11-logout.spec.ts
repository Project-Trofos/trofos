import { test, expect, type Page } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

async function openUserMenu(page: Page): Promise<void> {
  // Prefer a menu trigger with explicit accessible name, then fall back to avatar-like controls.
  const candidates = [
    page.getByRole('button', { name: /profile|account|user/i }).first(),
    page.getByRole('button', { name: /^[A-Z]$/ }).last(),
    page.locator('header').getByText(/^[A-Z]$/).last(),
    page.locator('.ant-avatar').first(),
    page.locator('span').filter({ hasText: /^[A-Z]$/ }).last(),
  ];

  for (const trigger of candidates) {
    if (await trigger.isVisible({ timeout: 1500 }).catch(() => false)) {
      await trigger.click({ timeout: 5000 });
      const logoutItem = page.getByText('Log Out').first();
      if (await logoutItem.isVisible({ timeout: 2000 }).catch(() => false)) {
        return;
      }
      await page.keyboard.press('Escape').catch(() => {});
    }
  }

  throw new Error('Could not open user menu for logout.');
}

test('[Logout] 11.1 - User can log out successfully', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto('https://trofos-production.comp.nus.edu.sg/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // If the session is already authenticated via project storageState, skip login.
  const loginButton = page.getByRole('button', { name: 'Login' });
  if (await loginButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await loginAsTestUser(page);
  }

  // Ensure we are in authenticated app shell before opening account menu.
  await expect(page.getByRole('menuitem', { name: /home/i }).first()).toBeVisible({ timeout: 15000 });

  await openUserMenu(page);
  await page.getByText('Log Out').first().click();

  // Verify user is logged out and redirected to public/unauthenticated view.
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 15000 });
});
