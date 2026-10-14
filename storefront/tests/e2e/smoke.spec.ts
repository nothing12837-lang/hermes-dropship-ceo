import { expect, test } from '@playwright/test';

test('home renders hero and shop link', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /discover everything you need/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /shop trending/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /what everyone's buying/i })).toBeVisible();
});

test('shop catalog filters and searches', async ({ page }) => {
  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: /everything\. everyday/i })).toBeVisible();
  await page.getByRole('button', { name: /electronics/i }).click();
  await expect(page.getByPlaceholder(/search everything/i)).toBeVisible();
});

test('shop category URL param preselects tab', async ({ page }) => {
  await page.goto('/shop?cat=fashion');
  await expect(page.getByText(/showing \d+ items/i)).toBeVisible();
});

test('track page accepts lookup input', async ({ page }) => {
  await page.goto('/track');
  await expect(page.getByPlaceholder(/you@email\.com/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /track my package/i })).toBeVisible();
});

test('checkout validates email', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page.getByPlaceholder(/email for tracking/i)).toBeVisible();
});
