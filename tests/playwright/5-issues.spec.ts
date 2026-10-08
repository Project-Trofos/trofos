import { test, expect, type Page } from '@playwright/test';

// SHARED FIXTURE — reuse authenticated session, navigate to Issues page

const issueTest = test.extend<{ authenticatedPage: Page }>({
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
        console.log(`[Issues fixture] Attempt ${attempt}: dashboard not ready. Reloading…`);
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

    // Navigate to Issues page via URL (extract project ID from current URL)
    const url = page.url();
    const projectId = url.match(/project\/(\d+)/)?.[1];
    await page.goto(`https://trofos-production.comp.nus.edu.sg/project/${projectId}/issues`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(1000);

    await use(page);
  },
});

// ISSUE TESTS — Section 5

// Keep default mode so failures do not skip the remaining tests in this file


issueTest('[Issues] 5.1 - Create issue', async ({ authenticatedPage: page }) => {
    const issueTitle = `AutoTest Issue ${Date.now()}`;

  await page.getByRole('button', { name: 'Create Issue' }).click();
  await page.waitForSelector('.ant-modal-content');

  // Fill title
  await page.locator('#issueForm_title').fill(issueTitle);

  // Select Assignee project
  await page.locator('#issueForm_assigneeProjectId').click();
  await page.waitForTimeout(300);
  await page.locator('.ant-select-dropdown:visible .ant-select-item').first().click();
  await page.waitForTimeout(200);

  // Select Type
  await page.locator('#issueForm_type').click();
  await page.waitForTimeout(300);
  await page.locator('.ant-select-dropdown:visible .ant-select-item').first().click();
  await page.waitForTimeout(200);

  // Select Priority
  await page.locator('#issueForm_priority').click();
  await page.waitForTimeout(300);
  await page.locator('.ant-select-dropdown:visible .ant-select-item').first().click();
  await page.waitForTimeout(200);

  // Select Reporter
  await page.locator('#issueForm_reporterId').click();
  await page.waitForTimeout(300);
  await page.locator('.ant-select-dropdown:visible .ant-select-item').first().click();
  await page.waitForTimeout(200);

  // Submit
  await page.locator('.ant-modal-footer').getByRole('button', { name: 'Create' }).click();
  await page.waitForTimeout(1000);

  // Verify issue appears
  await expect(page.locator(`text=${issueTitle}`)).toBeVisible({ timeout: 5000 });
});

issueTest('[Issues] 5.2 - Add comment to issue', async ({ authenticatedPage: page }) => {
  const commentText = `AutoTest comment ${Date.now()}`;

  // Open issue detail
  await page.getByRole('button', { name: 'View' }).first().click();
  await page.waitForTimeout(500);

  // Fill and submit comment
  await page.getByRole('textbox', { name: 'Add new comment...' }).fill(commentText);
  await page.getByRole('button', { name: 'Add comment' }).click();
  await page.waitForTimeout(500);

  // Verify comment appears
  await expect(page.locator('.ant-list-item-meta-description', { hasText: commentText })).toBeVisible({ timeout: 5000 });
});

issueTest('[Issues] 5.3 - Update comment on issue', async ({ authenticatedPage: page }) => {
  const updatedText = `AutoTest updated comment ${Date.now()}`;

  // Open issue detail
  await page.getByRole('button', { name: 'View' }).first().click();
  await page.waitForTimeout(500);

  // Hover over the comment to reveal the hidden menu icon, then click it
  const commentItem = page.locator('.ant-list-item').first();
  await commentItem.hover();
  await page.waitForTimeout(500);
  await page.locator('.anticon.anticon-menu').first().click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();

  // Clear and fill updated comment
  await page.getByRole('textbox', { name: 'Update comment...' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Update comment...' }).fill(updatedText);

  // Submit update
  await page.getByRole('button', { name: 'Update' }).nth(1).click();
  await page.waitForTimeout(500);

  // Verify updated comment with (edited) marker
  await expect(page.locator('.ant-list-item-meta-description', { hasText: updatedText })).toBeVisible({ timeout: 5000 });
  await expect(page.locator('.comment-timestamp', { hasText: '(edited)' })).toBeVisible({ timeout: 5000 });
});

issueTest('[Issues] 5.4 - Delete comment on issue', async ({ authenticatedPage: page }) => {
  // Open issue detail
  await page.getByRole('button', { name: 'View' }).first().click();
  await page.waitForTimeout(500);

  // Open comment context menu → Delete
  await page.locator('.anticon.anticon-menu').first().click();
  await page.getByText('Delete').click();

  // Confirm deletion
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForTimeout(500);

  // Verify no comments remain
  await expect(page.locator('.ant-list-empty-text')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('.ant-list-empty-text p')).toHaveText('No Comment');
});

issueTest('[Issues] 5.5 - Delete issue (cleanup)', async ({ authenticatedPage: page }) => {
  // Switch to "Assigned BY this project" tab
  await page.getByRole('tab', { name: 'Assigned BY this project' }).click();
  await page.waitForTimeout(500);

  // Delete all issues one by one — re-check count after each deletion
  const tabPanel = page.getByRole('tabpanel', { name: 'Assigned BY this project' });
  const deleteBtn = tabPanel.getByRole('button', { name: 'Delete' });

  for (let safety = 0; safety < 20; safety++) {
    const count = await deleteBtn.count();
    if (count === 0) break;

    await deleteBtn.first().click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(1000);
  }

  // Verify empty state
  await expect(tabPanel.locator('.ant-table-placeholder')).toBeVisible({ timeout: 8000 });
});
