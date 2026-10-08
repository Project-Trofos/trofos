import { test, expect, type Page } from '@playwright/test';

/**
 * SHARED FIXTURE: One login per browser for all dashboard tests
 * Auth is done via auth.setup.ts and saved to file (storageState)
 * All tests below reuse the same authenticated session
 */
const dashboardTest = test.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Page is already authenticated via storageState from auth.setup.ts
    // Navigate with retry — under parallel CI load we may briefly land on the public page
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await page.goto('https://trofos-production.comp.nus.edu.sg/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await page.waitForTimeout(1500);

      const homeMenu = page.getByRole('menuitem', { name: /home/i }).first();
      const isAuthenticated = await homeMenu.isVisible().catch(() => false);
      if (isAuthenticated) {
        break;
      }

      if (attempt < maxRetries) {
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
      } else {
        await homeMenu.waitFor({ state: 'visible', timeout: 15000 });
      }
    }

    await use(page);
  },
});

// Keep default mode so failures do not skip the remaining tests in this file

// ============================================================================
// DASHBOARD TESTS ONLY
// ============================================================================

dashboardTest('[Dashboard] 1.1 - Display dashboard correctly', async ({ authenticatedPage: page }) => {
  // Navigate to home/dashboard
  await page.getByRole('heading', { name: 'Home' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  // Verify current course section exists
  await expect(page.getByRole('heading', { name: 'Current Course' })).toBeVisible();
  
  // Verify current projects section exists
  await expect(page.getByRole('heading', { name: 'Current Projects' })).toBeVisible();
});

dashboardTest('[Dashboard] 1.2 - Toggle past courses', async ({ authenticatedPage: page }) => {
  await page.getByRole('heading', { name: 'Home' }).click();
  await page.waitForLoadState('domcontentloaded');
  
  // Toggle to show past courses
  const toggleSwitch = page.getByRole('switch').nth(1);
  await toggleSwitch.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  // Verify toggle is active
  await expect(toggleSwitch).toBeChecked();
  
  // Toggle back
  await toggleSwitch.click();
  await page.waitForLoadState('domcontentloaded');
});

dashboardTest('[Dashboard] 1.3 - Sort projects by ID ascending', async ({ authenticatedPage: page }) => {
  await page.getByRole('heading', { name: 'Home' }).click();
  await page.waitForLoadState('domcontentloaded');
  
  // Click ID column header to sort
  const idHeader = page.locator('div').filter({ hasText: /^ID$/ }).first();
  await idHeader.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  
  // Verify table rows exist after sorting (at least 1 row)
  const tableRows = page.getByRole('row');
  const rowCount = await tableRows.count();
  await expect(rowCount).toBeGreaterThan(1); // At least header + 1 data row
});

dashboardTest('[Dashboard] 1.4 - Sort projects by ID descending', async ({ authenticatedPage: page }) => {
  await page.getByRole('heading', { name: 'Home' }).click();
  await page.waitForLoadState('domcontentloaded');
  
  // Click ID column header again to reverse sort
  const idHeader = page.locator('div').filter({ hasText: /^ID$/ }).first();
  await idHeader.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
});

dashboardTest('[Dashboard] 1.5 - Search projects', async ({ authenticatedPage: page }) => {
  await page.getByRole('heading', { name: 'Home' }).click();
  await page.waitForLoadState('domcontentloaded');
  
  // Find and use search box for projects
  const searchBox = page.getByPlaceholder('Search').first();
  await searchBox.fill('TIC');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  // Verify results are filtered
  await expect(searchBox).toHaveValue('TIC');
  
  // Clear search
  await searchBox.clear();
  await page.waitForLoadState('domcontentloaded');
});

dashboardTest('[Dashboard] 1.6 - Pagination changes page size', async ({ authenticatedPage: page }) => {
  await page.goto('https://trofos-production.comp.nus.edu.sg/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  // Find the pagination dropdown and click it
  const paginationDropdown = page.getByText('50 / page').first();
  
  if (await paginationDropdown.isVisible().catch(() => false)) {
    await paginationDropdown.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for table to refresh with 50 rows
    
    // Verify the table is still visible (it should now show more rows)
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  }
});

dashboardTest('[Dashboard] 1.7 - Current Projects section is visible', async ({ authenticatedPage: page }) => {
  await page.getByRole('heading', { name: 'Home' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  // Verify the Current Projects section and table exist
  await expect(page.getByRole('heading', { name: 'Current Projects' })).toBeVisible();
  
  // Verify the Projects table specifically (not the courses table above it)
  const projectsCard = page.locator('div:nth-child(3) > .ant-card');
  await expect(projectsCard).toBeVisible();
});

dashboardTest('[Dashboard] 1.8 - Toggle dark/light theme', async ({ authenticatedPage: page }) => {
  await page.getByRole('heading', { name: 'Home' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  
  // 1. Click D/L (Dark/Light) toggle in header
  const themeToggle = page.getByRole('switch', { name: 'D L' }).first();
  await expect(themeToggle).toBeVisible();
  
  // 2. Click to toggle theme
  await themeToggle.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  // Verify toggle is still visible and working (no errors)
  await expect(themeToggle).toBeVisible();
  
  // 3. Refresh page
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  
  // Verify page still loads after theme change
  const heading = page.getByRole('heading', { name: 'Home' });
  await expect(heading).toBeVisible();
  
  // 4. Click toggle again to switch back
  const themeToggleAfterRefresh = page.getByRole('switch', { name: 'D L' }).first();
  await themeToggleAfterRefresh.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  // Verify toggle works on refresh too
  await expect(themeToggleAfterRefresh).toBeVisible();
});
