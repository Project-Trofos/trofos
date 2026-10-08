import { Page } from '@playwright/test';

/**
 * Logs in with the dedicated test account (direct email + password).
 * Call this at the start of every test that requires authentication.
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing TEST_EMAIL or TEST_PASSWORD. Set these in .env locally and in GitHub Actions repository secrets for CI.'
    );
  }

  await page.goto('https://trofos-production.comp.nus.edu.sg/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Click Login button
  await page.getByRole('button', { name: 'Login' }).click({ force: true });
  await page.waitForTimeout(500);

  // Fill email and password directly (no SSO)
  const emailBox = page.getByRole('textbox', { name: '* Email' });
  await emailBox.waitFor({ state: 'visible', timeout: 15000 });
  await emailBox.fill(email);

  await page.getByRole('textbox', { name: '* Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for page to load after login
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Dismiss the welcome / announcement modal that appears after login (if it exists)
  const closeButton = page.getByRole('button', { name: 'Close' });
  if (await closeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await closeButton.click();
  }

  // Ensure we are truly authenticated before auth.setup.ts stores storageState
  await page.getByRole('menuitem', { name: /home/i }).first().waitFor({ state: 'visible', timeout: 15000 });
}

/**
 * Navigates to Past Courses, searches for "software tes", and opens
 * the settings page of the first matching course.
 * Shared by the Search and Project Assignments test groups.
 */
export async function navigateToSoftwareTestingCourseSettings(page: Page): Promise<void> {
  // Wait for and click Courses menu with retry logic
  const coursesMenu = page.getByRole('menuitem', { name: 'book Courses' });
  await coursesMenu.waitFor({ state: 'visible', timeout: 10000 });
  await coursesMenu.click({ force: true });
  await page.waitForTimeout(500);
  
  // Wait for and click Past Courses submenu with retry logic
  const pastCoursesMenu = page.getByRole('menuitem', { name: 'Past Courses' });
  await pastCoursesMenu.waitFor({ state: 'visible', timeout: 10000 });
  await pastCoursesMenu.click({ force: true });
  await page.waitForTimeout(500);
  
  // Wait for and fill search box
  const searchBox = page.getByRole('textbox', { name: 'Search Course by name' });
  await searchBox.waitFor({ state: 'visible', timeout: 10000 });
  await searchBox.fill('software tes');
  await searchBox.press('Enter');
  
  // Wait for search results to load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  // Wait for and click settings link
  const settingLink = page.getByRole('link', { name: 'setting' }).first();
  await settingLink.waitFor({ state: 'visible', timeout: 10000 });
  await settingLink.click();
}
