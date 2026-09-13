import { expect, test } from '@playwright/test';

const email = process.env.SMOKE_TEST_EMAIL;
const password = process.env.SMOKE_TEST_PASSWORD;

test('production login survives product navigation and a full reload', async ({ page }) => {
  test.skip(!email || !password, 'SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD are required.');

  const authResponses = new Map();
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.pathname === '/api/v1/auth/login' || url.pathname === '/api/v1/auth/csrf' || url.pathname === '/api/v1/auth/refresh') {
      authResponses.set(`${response.request().method()} ${url.pathname}`, response.status());
    }
  });

  await page.goto('/account');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'SIGN IN' }).last().click();
  await expect(page.getByRole('heading', { name: 'Recent activity' })).toBeVisible();
  expect(authResponses.get('POST /api/v1/auth/login')).toBe(200);

  await page.getByRole('link', { name: 'ALL PRODUCTS', exact: true }).click();
  await expect(page).toHaveURL(/\/search$/);
  await page.reload();

  await page.getByRole('link', { name: /profile/i }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: 'Recent activity' })).toBeVisible();
  expect(authResponses.get('GET /api/v1/auth/csrf')).toBe(200);
  expect(authResponses.get('POST /api/v1/auth/refresh')).toBe(200);
});
