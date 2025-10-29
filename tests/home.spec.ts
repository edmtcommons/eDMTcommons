import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display home page content', async ({ page }) => {
    await expect(page.getByText('Open The Door')).toBeVisible();
    await expect(page.getByText(/Sign in and connect your wallet/)).toBeVisible();
  });

  test('should show connect wallet button', async ({ page }) => {
    const connectButton = page.getByRole('button', { name: /connect/i });
    await expect(connectButton).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/eDMT Gallery/i);
  });

  test('should display logo in header', async ({ page }) => {
    const logo = page.locator('img[alt="eDMT"]');
    await expect(logo).toBeVisible();
  });

  test('should have background video', async ({ page }) => {
    const video = page.locator('video');
    await expect(video).toBeVisible();
  });
});

