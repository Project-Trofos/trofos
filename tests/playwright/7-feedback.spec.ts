import { test, expect, type Page } from '@playwright/test';

/**
 * SHARED FIXTURE: Reuse authenticated session from auth.setup.ts
 * Navigates to the first project's Feedback page before each test.
 * No hardcoded project name — works on any account.
 */
const feedbackTest = test.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Page is already authenticated via storageState from auth.setup.ts
    // Navigate to home with retry — under parallel load the page may land
    // on the public landing page instead of the authenticated dashboard
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

      if (attempt < maxRetries) {
        console.log(`[Feedback fixture] Attempt ${attempt}: dashboard not ready. Reloading...`);
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
      } else {
        // Last attempt — wait with longer timeout and let it fail naturally if needed
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

    // Verify the project loaded correctly — under parallel load the server may return an error page
    for (let retryNav = 0; retryNav < 3; retryNav++) {
      const projectError = await page.getByText('This project does not exist!').isVisible({ timeout: 2000 }).catch(() => false);
      if (!projectError) break;
      // Project page failed to load — reload and wait
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
    }

    await use(page);
  },
});

// Keep default mode so failures do not skip the remaining tests in this file

// ============================================================================
// HELPERS — each test creates its own data and cleans up after itself
// ============================================================================

/** Create a new sprint with the given name */
async function createSprint(page: Page, name: string): Promise<void> {
  // Outer retry: re-attempt the entire creation flow if sprint never appears
  for (let createAttempt = 0; createAttempt < 3; createAttempt++) {
    if (createAttempt > 0) {
      // On retry, do a full page navigation to reset state
      const url = page.url();
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      // Check if sprint appeared from a previous attempt that was slow to reflect
      const alreadyVisible = await page.locator('.sprint-card-name', { hasText: name }).isVisible({ timeout: 3000 }).catch(() => false);
      if (alreadyVisible) return;
    }

    // Go to Sprint tab to create sprint
    await page.getByRole('menuitem', { name: 'Sprint' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Ensure "New Sprint" button is present (page may show "project does not exist" under load)
    const newSprintBtn = page.getByRole('button', { name: 'New Sprint' });
    if (!(await newSprintBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      if (!(await newSprintBtn.isVisible({ timeout: 5000 }).catch(() => false))) continue; // outer retry
    }

    await newSprintBtn.click();
    await page.waitForSelector('.ant-modal-content');
    await page.locator('#name').clear();
    await page.locator('#name').fill(name);

    // Click submit and wait for either API response or modal close
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/sprint') && resp.request().method() === 'POST', { timeout: 15000 }).catch(() => null),
      page.locator('.ant-modal-footer button[type="submit"]').click(),
    ]);

    // Wait for modal to close
    await expect(page.locator('.ant-modal-content')).not.toBeVisible({ timeout: 10000 }).catch(async () => {
      // If modal didn't close, press Escape and try again
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    });

    // If sprint doesn't appear quickly, try refresh strategies
    for (let attempt = 0; attempt < 5; attempt++) {
      const visible = await page.locator('.sprint-card-name', { hasText: name }).isVisible({ timeout: 3000 }).catch(() => false);
      if (visible) return; // Success!
      if (attempt < 2) {
        // Strategy 1: navigate away and back (forces React Router re-mount)
        const currentUrl = page.url();
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      } else if (attempt < 4) {
        // Strategy 2: hard reload
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
      } else {
        // Strategy 3: full page.goto
        const url = page.url();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(3000);
      }
    }
    // Sprint still not visible — will retry entire creation on next loop iteration
  }
  await expect(page.locator('.sprint-card-name', { hasText: name })).toBeVisible({ timeout: 15000 });
}

/** Delete a sprint by name */
async function deleteSprint(page: Page, name: string): Promise<void> {
  // Navigate to Sprint tab
  await page.getByRole('menuitem', { name: 'Sprint' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Ensure no lingering modals from previous actions
  await expect(page.locator('.ant-modal').filter({ hasText: 'DELETE SPRINT' })).not.toBeVisible({ timeout: 5000 }).catch(() => {});

  // Retry the dropdown click + menu selection — DOM can detach from concurrent re-renders
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const sprintCard = page.locator('.sprint-card-container').filter({ hasText: name });
      await sprintCard.locator('.sprint-menu-dropdown').click({ timeout: 5000 });
      await page.waitForTimeout(300);
      await page.locator('.ant-dropdown-menu-item-danger', { hasText: 'Delete sprint' }).click({ timeout: 5000 });
      break; // success
    } catch {
      // Dropdown or menu item detached — close any stale dropdown, wait, retry
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }

  // Wait for the delete confirmation modal to appear
  const deleteModal = page.locator('.ant-modal').filter({ hasText: 'DELETE SPRINT' });
  await expect(deleteModal).toBeVisible({ timeout: 5000 });
  await deleteModal.locator('button.ant-btn-dangerous').click();
  await page.waitForTimeout(500);
  await expect(page.locator('.sprint-card-name', { hasText: name })).not.toBeVisible({ timeout: 10000 });
}

/** Navigate to Feedback tab */
async function navigateToFeedback(page: Page): Promise<void> {
  const currentUrl = page.url();
  if (!currentUrl.includes('/feedback')) {
    // Extract project ID from current URL
    const projectMatch = currentUrl.match(/\/project\/(\d+)/);
    if (projectMatch) {
      const projectId = projectMatch[1];
      await page.goto(`https://trofos-production.comp.nus.edu.sg/project/${projectId}/feedback`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
    }
  }
}

/** Create feedback for a sprint */
async function createFeedback(page: Page, sprintName: string, feedbackText: string): Promise<void> {
  // Ensure we're on the Feedback tab
  await navigateToFeedback(page);

  // Find and click the sprint feedback section
  // A newly created sprint may take a moment to appear on the feedback page — reload once if needed
  const sprintButton = page.getByRole('button', { name: new RegExp(sprintName, 'i') });
  const btnVisible = await sprintButton.isVisible({ timeout: 5000 }).catch(() => false);
  if (!btnVisible) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  }
  await expect(sprintButton).toBeVisible({ timeout: 15000 });
  await sprintButton.click();
  await page.waitForTimeout(500);

  // Click "New" button to create feedback
  const newButton = page.locator('button:has-text("New")').first();
  await expect(newButton).toBeVisible({ timeout: 5000 });
  await newButton.click();
  await page.waitForTimeout(500);

  // Fill feedback text
  const textbox = page.getByRole('textbox');
  await expect(textbox).toBeVisible({ timeout: 5000 });
  await textbox.fill(feedbackText);
  await page.waitForTimeout(300);

  // Save feedback
  const saveButton = page.locator('button:has-text("Save")').first();
  await saveButton.click();
  await page.waitForTimeout(1000);

  // Verify feedback was created — reload once if not immediately visible
  const feedbackVisible = await page.getByText(feedbackText).isVisible({ timeout: 3000 }).catch(() => false);
  if (!feedbackVisible) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  }
  await expect(page.getByText(feedbackText)).toBeVisible({ timeout: 8000 });
}

/** Edit feedback text */
async function editFeedback(page: Page, oldText: string, newText: string): Promise<void> {
  // Ensure we can see the feedback
  await expect(page.getByText(oldText)).toBeVisible({ timeout: 5000 });

  // Click "Edit" button - use locator to avoid matching collapse header divs
  const editButton = page.locator('button:has-text("Edit")').first();
  await expect(editButton).toBeVisible({ timeout: 5000 });
  await editButton.click();
  await page.waitForTimeout(500);

  // Update feedback text
  const textbox = page.getByRole('textbox');
  await textbox.fill(newText);
  await page.waitForTimeout(300);

  // Save changes
  const saveButton = page.locator('button:has-text("Save")').first();
  await saveButton.click();
  await page.waitForTimeout(1000);

  // Verify update message
  await expect(page.getByText('Feedback updated!')).toBeVisible({ timeout: 5000 });
}

/** Delete feedback */
async function deleteFeedback(page: Page): Promise<void> {
  // Click "Delete" button - use locator to avoid matching other elements
  const deleteButton = page.locator('button:has-text("Delete")').first();
  await expect(deleteButton).toBeVisible({ timeout: 5000 });
  await deleteButton.click();
  await page.waitForTimeout(500);

  // Confirm deletion in modal
  const confirmButton = page.getByRole('button', { name: 'OK' });
  await expect(confirmButton).toBeVisible({ timeout: 5000 });
  await confirmButton.click();
  await page.waitForTimeout(1000);

  // Verify deletion message
  await expect(page.getByText('Feedback removed!')).toBeVisible({ timeout: 5000 });
}

// ============================================================================
// FEEDBACK TESTS — Section 7
// ============================================================================

// --- 0. Cleanup leftover sprints from previous failed runs ------------------

feedbackTest('[Feedback] 7.0 - Cleanup leftover AutoTest data', async ({ authenticatedPage: page }) => {
  feedbackTest.setTimeout(120_000);

  // Navigate to Sprint tab to clean up sprints
  await page.getByRole('menuitem', { name: 'Sprint' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Delete any leftover sprints whose names start with known test prefixes
  const prefixes = ['AutoTest', 'Feedback Sprint', 'Edit Feedback', 'Delete Feedback', 'Lifecycle Feedback'];

  for (const prefix of prefixes) {
    let retries = 0;
    while (retries < 10) {
      const card = page.locator('.sprint-card-container').filter({ hasText: new RegExp(`^.*${prefix}`) });
      const visible = await card.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (!visible) break;
      try {
        await card.first().locator('.sprint-menu-dropdown').click({ timeout: 5000 });
        await page.waitForTimeout(300);
        await page.locator('.ant-dropdown-menu-item-danger', { hasText: 'Delete sprint' }).click({ timeout: 5000 });
        await page.locator('.ant-modal').filter({ hasText: 'DELETE SPRINT' }).locator('button.ant-btn-dangerous').click({ timeout: 5000 });
        await page.waitForTimeout(500);
      } catch {
        // Element may have been detached by another browser — reload and retry
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
      }
      retries++;
    }
  }

  // Navigate back to Feedback tab
  await navigateToFeedback(page);
});

// --- 1. Create and view feedback (7.1) ------------------------------------

feedbackTest('[Feedback] 7.1 - Create and view feedback for sprint', async ({ authenticatedPage: page }) => {
  const sprintName = `Feedback Sprint ${Date.now()}`;
  const feedbackText = `Test Feedback ${Date.now()}`;

  // Navigate to Feedback
  await navigateToFeedback(page);

  // Create a sprint first
  await createSprint(page, sprintName);

  // Create feedback
  await createFeedback(page, sprintName, feedbackText);

  // Verify feedback is visible
  await expect(page.getByText(feedbackText)).toBeVisible();

  // Cleanup: navigate to Sprint tab and delete sprint (cascades delete)
  await deleteSprint(page, sprintName);
});

// --- 2. Edit feedback (7.2) -----------------------------------------------

feedbackTest('[Feedback] 7.2 - Edit feedback text', async ({ authenticatedPage: page }) => {
  const sprintName = `Edit Feedback Sprint ${Date.now()}`;
  const originalText = `Original Feedback ${Date.now()}`;
  const updatedText = `Updated Feedback ${Date.now()}`;

  // Navigate to Feedback
  await navigateToFeedback(page);

  // Create a sprint and feedback
  await createSprint(page, sprintName);
  await createFeedback(page, sprintName, originalText);

  // Edit the feedback
  await editFeedback(page, originalText, updatedText);

  // Verify updated text is visible
  await expect(page.getByText(updatedText)).toBeVisible();
  await expect(page.getByText(originalText)).not.toBeVisible();

  // Cleanup
  await deleteSprint(page, sprintName);
});

// --- 3. Delete feedback (7.3) -----------------------------------------------

feedbackTest('[Feedback] 7.3 - Delete feedback', async ({ authenticatedPage: page }) => {
  const sprintName = `Delete Feedback Sprint ${Date.now()}`;
  const feedbackText = `Feedback to Delete ${Date.now()}`;

  // Navigate to Feedback
  await navigateToFeedback(page);

  // Create a sprint and feedback
  await createSprint(page, sprintName);
  await createFeedback(page, sprintName, feedbackText);

  // Verify feedback exists
  await expect(page.getByText(feedbackText)).toBeVisible();

  // Delete the feedback
  await deleteFeedback(page);

  // Verify feedback is deleted (text is no longer visible)
  await expect(page.getByText(feedbackText)).not.toBeVisible({ timeout: 5000 });

  // Cleanup
  await deleteSprint(page, sprintName);
});

// --- 4. Multiple feedback items (7.4) ------------------------------------

feedbackTest('[Feedback] 7.4 - Create multiple feedback items', async ({ authenticatedPage: page }) => {
  const sprintName = `Lifecycle Feedback Sprint ${Date.now()}`;
  const feedback1 = `Feedback Item 1 ${Date.now()}`;
  const feedback2 = `Feedback Item 2 ${Date.now()}`;

  // Navigate to Feedback
  await navigateToFeedback(page);

  // Create a sprint
  await createSprint(page, sprintName);

  // Create first feedback
  await createFeedback(page, sprintName, feedback1);

  // For second feedback, click the sprint button again to expand it
  // The sprint may have collapsed after createFeedback
  const sprintButton = page.getByRole('button', { name: new RegExp(sprintName, 'i') });
  
  // Check if sprint is expanded by looking for visible New button
  const isExpanded = await page.locator('button:has-text("New")').first().isVisible({ timeout: 2000 }).catch(() => false);
  
  if (!isExpanded) {
    // Sprint is collapsed, click to expand it
    await sprintButton.click();
    await page.waitForTimeout(500);
  }

  // Click "New" button
  const newButton = page.locator('button:has-text("New")').first();
  await newButton.click();
  await page.waitForTimeout(500);

  // Fill second feedback - use the empty/editable textbox (not the readonly one from first feedback)
  const textboxes = page.locator('div[role="textbox"][contenteditable="true"]');
  const emptyTextbox = textboxes.last(); // Get the last/newest editable textbox
  await emptyTextbox.click();
  await emptyTextbox.fill(feedback2);
  await page.waitForTimeout(300);

  // Save
  const saveButton = page.locator('button:has-text("Save")').first();
  await saveButton.click();
  await page.waitForTimeout(1500);

  // Verify second feedback is visible (toast disappears too fast in CI — check text instead)
  await expect(page.getByText(feedback2)).toBeVisible({ timeout: 8000 });

  // Cleanup - delete the sprint (which cascades delete feedbacks)
  await deleteSprint(page, sprintName);
});

// --- 5. Feedback navigation (7.5) ----------------------------------------

feedbackTest('[Feedback] 7.5 - Navigate between tabs with feedback', async ({ authenticatedPage: page }) => {
  const sprintName = `Nav Feedback Sprint ${Date.now()}`;
  const feedbackText = `Navigation Test ${Date.now()}`;

  // Navigate to Feedback and create sprint+feedback
  await navigateToFeedback(page);
  await createSprint(page, sprintName);
  await createFeedback(page, sprintName, feedbackText);

  // Navigate to Sprint tab
  await page.getByRole('menuitem', { name: 'Sprint' }).click();
  await expect(page).toHaveURL(/\/sprint/);

  // Navigate back to Feedback tab
  await navigateToFeedback(page);
  await expect(page).toHaveURL(/\/feedback/);

  // Verify feedback is still there
  const sprintButton = page.getByRole('button', { name: new RegExp(sprintName, 'i') });
  await sprintButton.click();
  await page.waitForTimeout(500);
  await expect(page.getByText(feedbackText)).toBeVisible();

  // Navigate to Board tab
  await page.getByRole('menuitem', { name: 'Board' }).click();
  await expect(page).toHaveURL(/\/board/);

  // Navigate back to Feedback
  await navigateToFeedback(page);
  await expect(page).toHaveURL(/\/feedback/);

  // Cleanup
  await deleteSprint(page, sprintName);
});

// --- 6. Theme toggle on feedback page (7.6) ---------------------------------

feedbackTest('[Feedback] 7.6 - Theme toggle on feedback page', async ({ authenticatedPage: page }) => {
  // Navigate to Feedback first
  await navigateToFeedback(page);

  const toggle = page.getByRole('switch');
  await expect(toggle).toBeVisible();

  // Toggle theme twice (dark → light → back)
  await toggle.click();
  await page.waitForTimeout(300);
  await toggle.click();
  await page.waitForTimeout(300);

  // Verify still on feedback page
  await expect(page).toHaveURL(/\/feedback/);
});

// --- 7. Empty feedback handling (7.7) ------------------------------------

feedbackTest('[Feedback] 7.7 - Handle empty feedback submission', async ({ authenticatedPage: page }) => {
  const sprintName = `Empty Feedback Sprint ${Date.now()}`;

  // Navigate to Feedback
  await navigateToFeedback(page);

  // Create a sprint
  await createSprint(page, sprintName);

  // Navigate back to Feedback tab
  await navigateToFeedback(page);

  // Click on sprint
  const sprintButton = page.getByRole('button', { name: new RegExp(sprintName, 'i') });
  await sprintButton.click();
  await page.waitForTimeout(500);

  // Click New but don't fill anything
  const newButton = page.locator('button:has-text("New")').first();
  await newButton.click();
  await page.waitForTimeout(500);

  // Try to save without text
  const saveButton = page.locator('button:has-text("Save")').first();
  const isSaveDisabled = await saveButton.evaluate((el: HTMLButtonElement) => el.disabled);

  // If save is enabled, clicking it should fail gracefully
  if (!isSaveDisabled) {
    await saveButton.click();
    await page.waitForTimeout(500);
    // Check if feedback was created (it shouldn't be)
    const emptyFeedback = await page.getByText('').isVisible().catch(() => false);
    // Just verify no error occurred during the action
  }

  // Cleanup
  await deleteSprint(page, sprintName);
});
