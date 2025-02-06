import { test as setup, expect } from '@playwright/test';

const adminFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Email').fill('testadmin@test.com');
  await page.getByLabel('Password').fill('testPassword');
  await page.locator("[type=submit]").click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('http://localhost:3000/projects/current');

  // End of authentication steps.

  await page.context().storageState({ path: adminFile });
});

const userFile = 'playwright/.auth/user.json';

setup('authenticate as user', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Email').fill('testuser@test.com');
  await page.getByLabel('Password').fill('testPassword');
  await page.locator("[type=submit]").click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await expect(page).toHaveURL('http://localhost:3000/projects/current');

  // End of authentication steps.

  await page.context().storageState({ path: userFile });
});