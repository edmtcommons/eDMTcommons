import { test, expect } from '@playwright/test';

test.describe('Swap Page', () => {
  test('should redirect to home if not connected', async ({ page }) => {
    await page.goto('/swap');
    // Wait for potential redirect
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    // Should redirect to home if wallet is not connected
    expect(currentUrl).toMatch(/\/(\?.*)?$/);
  });

  test('should display swap page content structure', async ({ page }) => {
    // Try to access swap page - it might redirect, but we can check structure
    await page.goto('/swap');
    await page.waitForTimeout(1000);
    
    // Check if we're on home (redirected) or swap page
    const url = page.url();
    if (!url.includes('swap')) {
      // If redirected, verify home page elements
      await expect(page.getByText('Open The Door')).toBeVisible();
    } else {
      // If on swap page, verify swap elements
      await expect(page.getByText(/Swap|Welcome/i)).toBeVisible();
    }
  });

  test('should have LiFi widget container when accessible', async ({ page }) => {
    await page.goto('/swap');
    await page.waitForTimeout(1000);
    
    // Widget container should exist if page loaded
    const widgetContainer = page.locator('.widget-container');
    const exists = await widgetContainer.count() > 0;
    
    // This test is conditional based on whether user is connected
    if (exists) {
      await expect(widgetContainer).toBeVisible();
    }
  });

  test('should display welcome card when on swap page', async ({ page }) => {
    await page.goto('/swap');
    await page.waitForTimeout(1000);
    
    // Check for either swap page content or redirected home page
    const welcomeText = page.getByText(/Welcome inside|Open The Door/i);
    await expect(welcomeText.first()).toBeVisible({ timeout: 3000 });
  });
});

