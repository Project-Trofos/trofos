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
  await expect(page).not.toHaveURL('http://localhost:3000/login');

  // Wait for the tour element to appear
  const tourElement = page.locator('.ant-tour-content');
  await tourElement.waitFor({ state: 'visible' });

  // Assert that the tour has the expected text
  await expect(tourElement).toContainText('Welcome to Trofos!');
});
