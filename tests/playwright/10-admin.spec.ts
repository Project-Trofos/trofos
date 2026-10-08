import { test, expect, type Page } from '@playwright/test';

/**
 * Helper function to delete the first user matching the browser pattern
 * Searches for _browserName@gmail.com suffix to find existing test users
 */
async function deleteFirstUserByBrowser(page: Page, browserName: string) {
  // Navigate to User Management tab
  await page.getByRole('tab', { name: 'User Management' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  
  // Search for users created by this browser (find _chromium@gmail.com, _firefox@gmail.com, _webkit@gmail.com)
  const searchBox = page.getByRole('textbox', { name: 'Search User by ID, Name, Email' });
  await searchBox.click();
  await searchBox.clear();
  await searchBox.fill(`_${browserName}@gmail.com`);
  await page.waitForTimeout(2000); // Wait for search results
  
  // Get the FIRST user row matching this pattern
  const firstUserRow = page.locator('table tbody tr').first();
  await firstUserRow.waitFor({ state: 'visible', timeout: 10000 });
  
  // Click the delete/trash button (usually the last button in the row)
  // Retry if button not clickable immediately
  for (let attempt = 0; attempt < 2; attempt++) {
    const deleteBtn = firstUserRow.locator('button').last();
    if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteBtn.click();
      break;
    }
    if (attempt === 0) await page.waitForTimeout(2000);
  }
  await page.waitForTimeout(1000);
  
  // Confirm deletion in modal - click "Delete" button
  await page.getByRole('button', { name: 'Delete', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.waitForTimeout(1500);
  
  // Verify success message
  await expect(page.getByText(/User deleted successfully|deleted/i)).toBeVisible({ timeout: 8000 });
}

/**
 * Navigate to the admin page with retry logic for parallel-load resilience.
 * Under parallel workers the server sometimes renders the Home dashboard
 * instead of /admin, so we retry up to 5 times.
 */
async function gotoAdmin(page: Page) {
  const adminUrl = 'https://trofos-production.comp.nus.edu.sg/admin';
  const adminConsole = page.getByText('Admin Console');

  for (let attempt = 1; attempt <= 5; attempt++) {
    await page.goto(adminUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    if (await adminConsole.isVisible().catch(() => false)) {
      return; // Admin page loaded correctly
    }

    // Not on admin page — reload and retry
    console.log(`[Admin] Attempt ${attempt}: Admin Console not visible, reloading…`);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    if (await adminConsole.isVisible().catch(() => false)) {
      return;
    }
  }

  // Final fallback — hard wait for admin content
  await adminConsole.waitFor({ state: 'visible', timeout: 15000 });
}

// Keep default mode so failures do not skip the remaining tests in this file

  let browserName: string;

  test.beforeAll(async ({ browser }, workerInfo) => {
    // Auth is already done via auth.setup.ts, just get browser name
    browserName = workerInfo.project.name.replace('-setup', '');
    
    // Navigate to Admin page
    const page = await browser.newPage();
    await page.goto('https://trofos-production.comp.nus.edu.sg/admin');
    await page.close();
  });

  test('[Admin] 10.1 - Switch between tabs', async ({ page }) => {
    // Page is already authenticated via auth.setup.ts storageState
    await gotoAdmin(page);
    await expect(page.getByText('Admin Console')).toBeVisible();
    await page.waitForTimeout(500);
    
    // Test 1: User Management Tab
    await page.getByRole('tab', { name: 'User Management' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('button', { name: 'Create User' })).toBeVisible();

    // Test 2: Role Management Tab
    await page.getByRole('tab', { name: 'Role Management' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('tabpanel', { name: 'Role Management' })).toBeVisible();

    // Test 3: Settings Management Tab
    await page.getByRole('tab', { name: 'Settings Management' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('tabpanel', { name: 'Settings Management' })).toBeVisible();

    // Test 4: Feature Flags Tab
    await page.getByRole('tab', { name: 'Feature Flags' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('columnheader', { name: 'Feature Name' })).toBeVisible({ timeout: 5000 });
  });

  // test('Admin - create user', async ({ page }) => {
  //   await gotoAdmin(page);
  //   await page.getByRole('tab', { name: 'User Management' }).click();
  //   await page.waitForLoadState('domcontentloaded');
  //   await page.waitForTimeout(500);
    
  //   await page.getByRole('button', { name: 'Create User' }).click();
  //   await page.waitForTimeout(800);
    
  //   // Add browser name to make email unique across parallel test runs
  //   const email = `test${Date.now()}_${browserName}@gmail.com`;
  //   await page.getByRole('textbox', { name: '* User Email' }).fill(email);
  //   await page.getByRole('textbox', { name: '* Password' }).fill('Test1234!');
  //   await page.getByRole('textbox', { name: '* Confirm Password' }).fill('Test1234!');
    
  //   // Click the Create button in the modal (exact match to avoid strict mode)
  //   await page.getByRole('button', { name: 'Create', exact: true }).click();
  //   await page.waitForLoadState('domcontentloaded');
  //   await page.waitForTimeout(1000);
    
  //   // Verify creation success
  //   await expect(page.getByText(/User created successfully|created/i)).toBeVisible({ timeout: 5000 }).catch(() => {
  //     return expect(page.getByRole('button', { name: 'Create User' })).toBeVisible();
  //   });
  // });

  test('[Admin] 10.2 - Delete user', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('tab', { name: 'User Management' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Create a user
    await page.getByRole('button', { name: 'Create User' }).click();
    await page.waitForTimeout(1000);
    
    const email = `testdelete${Date.now()}_${browserName}@gmail.com`;
    await page.getByRole('textbox', { name: '* User Email' }).fill(email);
    await page.getByRole('textbox', { name: '* Password' }).fill('Test1234!');
    await page.getByRole('textbox', { name: '* Confirm Password' }).fill('Test1234!');
    
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Reload page to ensure table data is fresh
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    // Search for the user by email
    const searchBox = page.getByRole('textbox', { name: 'Search User by ID, Name, Email' });
    await searchBox.click();
    await searchBox.clear();
    await searchBox.fill(email);
    await page.waitForTimeout(3000);
    
    // Find and click delete button for the email row
    const deleteBtn = page.locator('table tbody tr').filter({ hasText: email }).locator('button').last();
    await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });
    
    // Retry click logic for slow CI runners
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await deleteBtn.click({ timeout: 5000 });
        break;
      } catch (e) {
        if (attempt < 2) {
          await page.waitForTimeout(1500);
        } else {
          throw e;
        }
      }
    }
    await page.waitForTimeout(1000);
    
    // Confirm deletion in modal
    await page.getByRole('button', { name: 'Delete', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.waitForTimeout(1500);
    
    // Verify success message
    await expect(page.getByText(/User deleted successfully|deleted/i)).toBeVisible({ timeout: 8000 });
  });

  test('[Admin] 10.3 - Search user works', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('tab', { name: 'User Management' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const searchBox = page.getByRole('textbox', { name: 'Search User by ID, Name, Email' });
    await searchBox.fill('test');
    await expect(searchBox).toHaveValue('test');
  });