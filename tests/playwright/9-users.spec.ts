import { test, expect, type Page } from '@playwright/test';

// SHARED FIXTURE — reuse authenticated session, navigate to Users page

const usersTest = test.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to home with retry — parallel workers can cause landing-page flakiness
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await page.goto('https://trofos-production.comp.nus.edu.sg/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await page.waitForTimeout(1500);

      const homeMenu = page.getByRole('menuitem', { name: /home/i }).first();
      const isAuthenticated = await homeMenu.isVisible().catch(() => false);
      if (isAuthenticated) break;

      if (attempt < maxRetries) {
        console.log(`[Users fixture] Attempt ${attempt}: dashboard not ready. Reloading…`);
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
      } else {
        await homeMenu.waitFor({ state: 'visible', timeout: 15000 });
      }
    }

    // Navigate to "Test Project" (preferred), fallback to first available project
    const projectsMenu = page.getByRole('menuitem', { name: 'project Project' });
    await expect(projectsMenu).toBeVisible();
    await projectsMenu.click();
    await page.waitForTimeout(500);

    const testProject = page.locator('a[href^="/project/"]').filter({ hasText: 'Test Project' }).first();
    const firstProject = page.locator('a[href^="/project/"]').first();

    if (await testProject.isVisible({ timeout: 3000 }).catch(() => false)) {
      await testProject.click();
    } else {
      await expect(firstProject).toBeVisible();
      await firstProject.click();
    }

    await page.waitForURL('**/project/**');
    await page.waitForLoadState('domcontentloaded');

    // Retry if server returned error page under load
    for (let retryNav = 0; retryNav < 3; retryNav++) {
      const projectError = await page.getByText('This project does not exist!').isVisible({ timeout: 2000 }).catch(() => false);
      if (!projectError) break;
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
    }

    // Navigate to Users page via sidebar menu
    await page.getByRole('menuitem', { name: 'Users' }).click();
    await page.waitForTimeout(1000);

    await use(page);
  },
});

// USERS TESTS — Section 9

// Keep default mode so failures do not skip the remaining tests in this file

  const testEmail = 'test@gmail.com';

  // ── 9.0  Cleanup leftover test user ──────────────────────────────
  usersTest('[Users] 9.0 - Cleanup leftover test user', async ({ authenticatedPage: page }) => {
    // Check if the test user already exists in the table and remove them
    const userRow = page.locator('tr', { hasText: testEmail });

    for (let safety = 0; safety < 3; safety++) {
      if (!await userRow.first().isVisible({ timeout: 2000 }).catch(() => false)) break;

      const removeBtn = userRow.first().getByRole('button', { name: 'Remove' });
      if (await removeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await removeBtn.click();
        await page.waitForTimeout(1000);
      } else {
        break;
      }
    }
  });

  // ── 9.1  Add user to project ─────────────────────────────────────
  usersTest('[Users] 9.1 - Add user to project', async ({ authenticatedPage: page }) => {
    // Fill email and click Add
    await page.getByRole('textbox', { name: 'Add user by email' }).click();
    await page.getByRole('textbox', { name: 'Add user by email' }).fill(testEmail);
    await page.getByRole('button', { name: 'Add' }).click();

    // Verify success toast
    await expect(page.getByText('User added!')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    // Verify the user appears in the table
    await expect(page.locator('tr', { hasText: testEmail })).toBeVisible({ timeout: 5000 });
  });

  // ── 9.2  Change user role ────────────────────────────────────────
  usersTest('[Users] 9.2 - Change user role', async ({ authenticatedPage: page }) => {
    // Find the row with the test user
    const userRow = page.locator('tr', { hasText: testEmail });
    await expect(userRow).toBeVisible({ timeout: 5000 });

    // Click the role button (currently STUDENT) to open the "Modify User's Role" modal
    await userRow.getByRole('button', { name: 'STUDENT' }).click();
    await page.waitForTimeout(500);

    // Wait for modal to appear
    const modal = page.locator('.ant-modal-content');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Click the select/combobox inside the modal to open the dropdown
    await modal.locator('.ant-select').click();
    await page.waitForTimeout(300);

    // Select FACULTY from the dropdown options
    await page.locator('.ant-select-dropdown:visible').getByText('FACULTY', { exact: true }).click();
    await page.waitForTimeout(300);

    // Confirm role change by clicking OK
    await modal.getByRole('button', { name: 'OK' }).click();

    // Verify success toast
    await expect(page.getByText('User role changed!')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);
  });

  // ── 9.3  Remove user from project ───────────────────────────────
  usersTest('[Users] 9.3 - Remove user from project', async ({ authenticatedPage: page }) => {
    // Find the row with the test user
    const userRow = page.locator('tr', { hasText: testEmail });
    await expect(userRow).toBeVisible({ timeout: 5000 });

    // Click Remove button on the user's row
    await userRow.getByRole('button', { name: 'Remove' }).click();
    await page.waitForTimeout(500);

    // Verify success toast
    await expect(page.getByText('User removed!')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    // Verify the user is no longer in the table
    await expect(page.locator('tr', { hasText: testEmail })).toHaveCount(0, { timeout: 5000 });
  });
