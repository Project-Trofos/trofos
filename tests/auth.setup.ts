import { test as setup } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';
import path from 'path';

/**
 * This file runs ONCE per browser before all other tests
 * It logs in and saves the authentication state to a file
 * Other tests reuse this saved state instead of logging in again
 */

setup('authenticate', async ({ browser }) => {
  const page = await browser.newPage();
  
  // Login with the dedicated test account
  await loginAsTestUser(page);
  
  // Save the authenticated state to a file
  // This includes cookies, local storage, session storage, etc.
  const stateFile = path.join(__dirname, `../auth-state-${browser.browserType().name()}.json`);
  await page.context().storageState({ path: stateFile });
  
  await page.close();
});
