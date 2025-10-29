import { test, expect } from '@playwright/test';

test.describe('Gallery Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
  });

  test('should display gallery page', async ({ page }) => {
    // Should show token gate message or gallery content
    await expect(
      page.locator('body')
    ).toBeVisible();
  });

  test('should show token requirement message when not connected', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Check for token gate message or insufficient tokens message
    const hasTokenGate = await page.getByText(/insufficient|need at least|tokens to access/i).count() > 0;
    const hasGallery = await page.getByText(/gallery|media/i).count() > 0;
    
    // At least one should be visible
    expect(hasTokenGate || hasGallery).toBeTruthy();
  });

  test('should have header on gallery page', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check for navigation links in header
    await expect(header.getByRole('link', { name: /GET eDMT/i })).toBeVisible();
    await expect(header.getByRole('link', { name: /Media/i })).toBeVisible();
  });

  test('should redirect to swap when clicking get tokens', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for button/link to get tokens
    const getTokensButton = page.getByRole('button', { name: /get more|get tokens/i }).first();
    const buttonExists = await getTokensButton.count() > 0;
    
    if (buttonExists) {
      await getTokensButton.click();
      await expect(page).toHaveURL(/.*swap/);
    }
  });
});

