import { test, expect, type Page } from '@playwright/test';

test('can login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Trofos/);

  // Fill in the email field
  const emailInput = page.getByLabel('Email');
  await emailInput.fill('testuser@test.com');  

  // Fill in the password field
  const passwordInput = page.getByLabel('Password');
  await passwordInput.fill('testPassword');

  // Click the Sign In button
  await page.locator("[type=submit]").click();

  // Expect a successful login to navigate to the projects page
  await expect(page).toHaveURL('http://localhost:3000/projects/current');
});
