import { expect, test } from '@playwright/test';

test('home renders festive banner and flagship drops', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /explore graphic drops/i })).toBeVisible();
});

test('shop catalog renders and displays products', async ({ page }) => {
  await page.goto('/shop');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /all drops/i })).toBeVisible();
});

test('shop category URL param preselects tab', async ({ page }) => {
  await page.goto('/shop?cat=mens-printed');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('track page accepts lookup input', async ({ page }) => {
  await page.goto('/track');
  await expect(page.getByRole('button', { name: /track order/i })).toBeVisible();
});

test('checkout renders email field', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page.getByPlaceholder(/name@example\.com/i)).toBeVisible();
});
