import { expect, test } from '@playwright/test';

test('home renders festive banner and trending products', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /top rated & trending products/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /fresh factory drops/i })).toBeVisible();
});

test('shop catalog renders and searches', async ({ page }) => {
  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: /everything/i })).toBeVisible();
  await expect(page.getByPlaceholder(/search everything/i)).toBeVisible();
});

test('shop category URL param preselects tab', async ({ page }) => {
  await page.goto('/shop?cat=fashion');
  await expect(page.getByText(/showing \d+ items/i)).toBeVisible();
});

test('track page accepts lookup input', async ({ page }) => {
  await page.goto('/track');
  await expect(page.getByPlaceholder(/you@email\.com/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /track order/i })).toBeVisible();
});

test('checkout renders email field', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page.getByPlaceholder(/name@example\.com/i)).toBeVisible();
});
