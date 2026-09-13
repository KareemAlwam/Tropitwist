import { expect, test } from '@playwright/test';

const routes = ['/', '/skincare', '/body-care', '/bundles', '/about', '/search', '/cart', '/checkout', '/account', '/wishlist', '/admin', '/products/p1'];

test('all storefront routes return the React application', async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('#root'), route).not.toBeEmpty();
  }
});

test('desktop customer flow validates fields and places a COD order', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop-only checkout flow.');
  await page.goto('/search');
  await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
  await expect(page.getByRole('link', { name: /Cart, 1 items/ })).toBeVisible();

  await page.getByRole('link', { name: /Cart, 1 items/ }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await page.getByRole('link', { name: 'SIGN IN TO CHECKOUT' }).click();
  await expect(page).toHaveURL(/\/account\?next=checkout/);

  await page.getByRole('button', { name: 'CREATE ACCOUNT' }).first().click();
  const accountForm = page.locator('form').filter({ has: page.locator('input[name="firstName"]') });
  await accountForm.getByRole('button', { name: 'CREATE ACCOUNT' }).click();
  await expect(page.locator('input[name="firstName"]')).toHaveClass(/border-cherry/);
  await expect(page.locator('input[name="email"]')).toHaveClass(/border-cherry/);

  const email = `playwright-${Date.now()}@example.test`;
  await page.locator('input[name="firstName"]').fill('Browser');
  await page.locator('input[name="lastName"]').fill('Test');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('playwright-password-123');
  await page.locator('input[name="confirmPassword"]').fill('playwright-password-123');
  await accountForm.getByRole('button', { name: 'CREATE ACCOUNT' }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await page.getByRole('button', { name: /PLACE ORDER/ }).click();
  await expect(page.getByRole('alert')).toContainText('Please correct the highlighted fields.');
  await expect(page.locator('input[name="firstName"]')).toHaveClass(/border-cherry/);

  await page.locator('input[name="firstName"]').fill('Browser');
  await page.locator('input[name="lastName"]').fill('Test');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="phone"]').fill('01000000000');
  await page.locator('input[name="address"]').fill('12 Nile Street');
  await page.locator('input[name="city"]').fill('Cairo');
  await page.locator('input[name="area"]').fill('Dokki');
  await expect(page.locator('input[value="paymob-card"]')).toBeDisabled();
  await page.getByRole('button', { name: /PLACE ORDER/ }).click();
  await expect(page.getByText('Your order has been placed. You can view it in your account dashboard.')).toBeVisible();

  await page.goto('/account');
  await expect(page.getByRole('heading', { name: 'Recent activity' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('account-dashboard.png'), fullPage: true });
});

test('mobile navigation opens, links work, and closes', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, 'Mobile-only navigation check.');
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const menu = page.getByRole('dialog', { name: 'Mobile navigation' });
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: /SKINCARE/ }).click();
  await expect(page).toHaveURL(/\/skincare$/);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await menu.getByRole('button', { name: 'Close menu' }).last().click();
  await expect(menu).toBeHidden();
});
