import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have header with navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /GET eDMT/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Media/i })).toBeVisible();
  });

  test('should navigate to gallery page', async ({ page }) => {
    await page.getByRole('link', { name: /Media/i }).click();
    await expect(page).toHaveURL(/.*gallery/);
  });

  test('should navigate to swap page', async ({ page }) => {
    await page.getByRole('link', { name: /GET eDMT/i }).click();
    await expect(page).toHaveURL(/.*swap/);
  });

  test('should have footer with social links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for social media links
    const xLink = footer.locator('a[href*="x.com"]');
    const psydaoLink = footer.locator('a[href*="psydao.io"]');
    
    await expect(xLink).toBeVisible();
    await expect(psydaoLink).toBeVisible();
  });

  test('footer should be fixed at bottom', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check that footer has fixed positioning
    const footerStyles = await footer.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        position: styles.position,
      };
    });
    
    expect(footerStyles.position).toBe('fixed');
  });

  test('should have logo that links to swap page', async ({ page }) => {
    const logoLink = page.locator('header a[href*="swap"]');
    await expect(logoLink).toBeVisible();
    
    await logoLink.click();
    await expect(page).toHaveURL(/.*swap/);
  });
});

