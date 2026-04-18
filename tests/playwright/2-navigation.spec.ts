import { test, expect, type Page } from '@playwright/test';

/**
 * SHARED FIXTURE: Reuse authenticated session from auth.setup.ts
 * All tests reuse authenticated session from storage state (no re-login needed)
 */
const navigationTest = test.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Page is already authenticated via storageState from auth.setup.ts
    // Navigate to home with retry — under parallel load the page may land
    // on the public landing page or an error page instead of the dashboard
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await page.goto('https://trofos-production.comp.nus.edu.sg/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await page.waitForTimeout(1500);

      // Check if we landed on the authenticated dashboard (sidebar menu visible)
      const homeMenu = page.getByRole('menuitem', { name: /home/i }).first();
      const isAuthenticated = await homeMenu.isVisible().catch(() => false);
      if (isAuthenticated) {
        break; // Successfully on the dashboard
      }

      // Check if we're on the public landing page or error page
      const loginBtn = page.getByRole('button', { name: 'Login' });
      const isLoginPage = await loginBtn.isVisible().catch(() => false);
      const errorText = page.getByText('This project does not exist!');
      const isErrorPage = await errorText.isVisible().catch(() => false);

      if (attempt < maxRetries) {
        console.log(`[Nav fixture] Attempt ${attempt}: page not ready (login=${isLoginPage}, error=${isErrorPage}). Reloading...`);
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
      } else {
        // Last attempt — wait with longer timeout and let it fail naturally if needed
        await homeMenu.waitFor({ state: 'visible', timeout: 15000 });
      }
    }
    await use(page);
  },
});

// Keep default mode so failures do not skip the remaining tests in this file

// NAVIGATION TESTS - Section 2: Routes, Menus & Links

/** Helper: Navigate to a project via the left menu (Projects → first project link) */
async function navigateToProject(page: Page) {
  // Click the "Project" menu item to expand submenu
  const projectsMenu = page.getByRole('menuitem', { name: 'project Project' });
  await expect(projectsMenu).toBeVisible();
  await projectsMenu.click();
  await page.waitForTimeout(500);

  // The submenu contains individual project names (e.g. "CustomAIzEd", "FYP", "TIC2003")
  // Click the first project link in the expanded submenu
  const firstProject = page.locator('a[href^="/project/"]').first();
  await expect(firstProject).toBeVisible();
  await firstProject.click();

  await page.waitForURL('**/project/**');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
}

navigationTest('[Navigation] 2.1 - Home menu navigates to dashboard', async ({ authenticatedPage: page }) => {
  // 1. Click Home in left navigation menu
  const homeMenu = page.getByRole('menuitem', { name: /home/i }).first();
  await expect(homeMenu).toBeVisible();
  await homeMenu.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Verify: URL is the root dashboard
  await expect(page).toHaveURL(/\/$/);

  // Verify: Dashboard heading displays
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
});

navigationTest('[Navigation] 2.2 - Courses menu navigates', async ({ authenticatedPage: page }) => {
  // 1. Click Courses in left navigation menu
  const coursesMenu = page.getByRole('menuitem', { name: /courses/i }).first();
  await expect(coursesMenu).toBeVisible();
  await coursesMenu.click();

  await page.waitForURL('**/courses/**');
  await page.waitForLoadState('domcontentloaded');

  // Verify: URL contains /courses
  await expect(page).toHaveURL(/\/courses/);
});

navigationTest('[Navigation] 2.3 - Projects menu expands and links work', async ({ authenticatedPage: page }) => {
  // 1. Click Projects in left navigation menu → submenu expands
  await navigateToProject(page);

  // Verify: Navigates to a project page
  await expect(page).toHaveURL(/\/project\/\d+/);
});

navigationTest('[Navigation] 2.4 - Breadcrumb navigation works', async ({ authenticatedPage: page }) => {
  // 1. Navigate to a project page first
  await navigateToProject(page);
  await expect(page).toHaveURL(/\/project\/\d+/);

  // 2. Click home link in breadcrumb
  const breadcrumb = page.locator('a[href="/"]').first();
  await expect(breadcrumb).toBeVisible();
  await breadcrumb.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Verify: Returns to dashboard
  await expect(page).toHaveURL(/\/$/);
});

navigationTest('[Navigation] 2.5 - Logo click returns to home', async ({ authenticatedPage: page }) => {
  // Navigate to a project page first
  await navigateToProject(page);
  await expect(page).toHaveURL(/\/project\//);

  // 1. Click Trofos logo (an anchor tag linking to /)
  const logo = page.locator('a[href="/"]').first();
  await expect(logo).toBeVisible();
  await logo.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Verify: Navigates to / dashboard
  await expect(page).toHaveURL(/\/$/);
});

navigationTest('[Navigation] 2.6 - Overview tab shows project overview', async ({ authenticatedPage: page }) => {
  // Navigate to project first (lands on /project/X/overview by default)
  await navigateToProject(page);

  // 1. Click Overview menuitem in the project nav bar
  const overviewItem = page.getByRole('menuitem', { name: 'Overview' });
  await expect(overviewItem).toBeVisible();
  await overviewItem.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Verify: URL contains /overview
  await expect(page).toHaveURL(/\/project\/\d+\/overview/);

  // Verify: Overview content is visible (Burn Down Chart heading exists on this page)
  await expect(page.getByRole('heading', { level: 4 }).first()).toBeVisible();
});

navigationTest('[Navigation] 2.7 - Users tab shows team members', async ({ authenticatedPage: page }) => {
  // Navigate to project first
  await navigateToProject(page);

  // 1. Click Users menuitem in project nav bar
  const usersItem = page.getByRole('menuitem', { name: 'Users' });
  await expect(usersItem).toBeVisible();
  await usersItem.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Verify: URL contains /users
  await expect(page).toHaveURL(/\/project\/\d+\/users/);

  // Verify: Team members display in table (at least 1 row)
  const tableRows = page.locator('table tbody tr');
  await expect(tableRows.first()).toBeVisible();
});

navigationTest('[Navigation] 2.8 - Sprint tab shows sprint list', async ({ authenticatedPage: page }) => {
  // Navigate to project first
  await navigateToProject(page);

  // 1. Click Sprint menuitem in project nav bar
  const sprintItem = page.getByRole('menuitem', { name: 'Sprint' });
  await expect(sprintItem).toBeVisible();
  await sprintItem.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Verify: URL contains /sprint
  await expect(page).toHaveURL(/\/project\/\d+\/sprint/);

  // Verify: Sprint page content is visible
  const sprintContent = page.locator('.ant-card, .ant-table, [class*="sprint"]').first();
  await expect(sprintContent).toBeVisible();
});

navigationTest('[Navigation] 2.9 - Board tab shows Kanban board', async ({ authenticatedPage: page }) => {
  // Navigate to project first
  await navigateToProject(page);

  // 1. Click Board menuitem in project nav bar
  const boardItem = page.getByRole('menuitem', { name: 'Board' });
  await expect(boardItem).toBeVisible();
  await boardItem.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Verify: URL contains /board
  await expect(page).toHaveURL(/\/project\/\d+\/board/);

  // Verify: Board page loaded - URL is correct
  // Note: Board content depends on project having sprints/issues
  // For navigation test, just verify the URL is correct and page rendered
  const mainContent = page.locator('main').first();
  await expect(mainContent).toBeVisible();
});
