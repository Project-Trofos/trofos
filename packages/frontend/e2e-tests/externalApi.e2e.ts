import { test, expect, request, chromium } from '@playwright/test';

let generatedApiKey: string;
test.use({ storageState: 'playwright/.auth/admin.json' });

test.describe.serial('API Key Generation & Usage', () => {
  test.beforeAll(async ({ browserName, request }) => {
    test.setTimeout(30000)
    if (browserName !== 'chromium') {
      test.skip(); // Skip API key generation in Firefox/WebKit
    }

    if (generatedApiKey) {
      console.log('API key already set, skipping regeneration...');
      return;
    }

    const browser = await chromium.launch();
    const browserContext = await browser.newContext();
    const page = await browserContext.newPage();

    const response = await request.post('http://localhost:3000/api/account/updateUser', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        userId: 3,
        hasCompletedTour: true,
      },
    });

    expect(response.status()).toBe(200);

    await page.goto('http://localhost:3000/manage-api-key');

    try {
      await page.getByRole('button', { name: 'Generate API key' }).click({ timeout: 5000 });
    } catch (error) {
      console.log('API key already exists, regenerating...');
      await page.getByRole('button', { name: 'Regenerate' }).click();
    }

    const codeElement = await page.waitForSelector('code');

    generatedApiKey = await codeElement.innerText();
    console.log(`Generated API Key: ${generatedApiKey}`);

    expect(generatedApiKey).toBeTruthy();
  });

  test('Use API key to fetch course list', async ({ request }) => {
    expect(generatedApiKey).toBeTruthy();

    const response = await request.post('http://localhost:3003/api/external/v1/course/list', {
      headers: {
        'x-api-key': generatedApiKey,
        'Content-Type': 'application/json'
      },
      data: {
        option: 'all',
        pageIndex: 0,
        pageSize: 10
      }
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('Course List Response:', responseBody);

    expect(responseBody).toHaveProperty('totalCount');
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBeTruthy();
    expect(responseBody.data.length).toEqual(responseBody.totalCount);
  });

  test('Use API key to fetch project list', async ({ request }) => {
    expect(generatedApiKey).toBeTruthy();

    const response = await request.post('http://localhost:3003/api/external/v1/project/list', {
      headers: {
        'x-api-key': generatedApiKey,
        'Content-Type': 'application/json'
      },
      data: {
        pageIndex: 0,
        pageSize: 10
      }
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('Project List Response:', responseBody);

    expect(responseBody).toHaveProperty('totalCount');
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBeTruthy();
    expect(responseBody.data.length).toEqual(responseBody.totalCount);
  });

  test('Search course by keyword', async ({ request }) => {
    expect(generatedApiKey).toBeTruthy();

    const response = await request.post('http://localhost:3003/api/external/v1/course/list', {
      headers: {
        'x-api-key': generatedApiKey,
        'Content-Type': 'application/json'
      },
      data: {
        keyword: '1',
        pageIndex: 0,
        pageSize: 10
      }
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('Course Search Response:', responseBody);

    expect(responseBody).toHaveProperty('totalCount');
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBeTruthy();
    expect(responseBody.data[0].cname).toEqual('course1');
  });

  test('Search project by keyword', async ({ request }) => {
    expect(generatedApiKey).toBeTruthy();

    const response = await request.post('http://localhost:3003/api/external/v1/project/list', {
      headers: {
        'x-api-key': generatedApiKey,
        'Content-Type': 'application/json'
      },
      data: {
        keyword: '2',
        pageIndex: 0,
        pageSize: 10
      }
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('Project Search Response:', responseBody);

    expect(responseBody).toHaveProperty('totalCount');
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBeTruthy();
    expect(responseBody.data[0].pname).toEqual('project2');
  });

  test('Search project by course ID', async ({ request }) => {
    expect(generatedApiKey).toBeTruthy();

    const response = await request.post('http://localhost:3003/api/external/v1/project/list', {
      headers: {
        'x-api-key': generatedApiKey,
        'Content-Type': 'application/json'
      },
      data: {
        courseId: 1
      }
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('Project Search Response:', responseBody);

    expect(responseBody).toHaveProperty('totalCount');
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBeTruthy();
    expect(responseBody.data[0].pname).toEqual('project1');
  });
});
