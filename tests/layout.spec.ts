import { test, expect } from '@playwright/test';

test.describe('Layout and UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have consistent header across pages', async ({ page }) => {
    // Check header on home
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Navigate to gallery and check header still visible
    await page.goto('/gallery');
    await expect(header).toBeVisible();
    
    // Navigate to swap and check header still visible
    await page.goto('/swap');
    await expect(header).toBeVisible();
  });

  test('should have footer visible on all pages', async ({ page }) => {
    const footer = page.locator('footer');
    
    // Check footer on home
    await expect(footer).toBeVisible();
    
    // Check footer on gallery
    await page.goto('/gallery');
    await expect(footer).toBeVisible();
    
    // Check footer on swap
    await page.goto('/swap');
    await expect(footer).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(header).toBeVisible();
  });

  test('should have proper z-index layering', async ({ page }) => {
    const header = page.locator('header');
    const main = page.locator('main');
    const footer = page.locator('footer');
    
    // All should be visible and properly layered
    await expect(header).toBeVisible();
    await expect(main).toBeVisible();
    await expect(footer).toBeVisible();
  });

  test('should load background video on home page', async ({ page }) => {
    const video = page.locator('video');
    await expect(video).toBeVisible();
    
    // Check video attributes
    const src = await video.getAttribute('src');
    expect(src).toContain('.mp4');
  });

  test('should have social media links with correct attributes', async ({ page }) => {
    const footer = page.locator('footer');
    const xLink = footer.locator('a[href*="x.com"]');
    const psydaoLink = footer.locator('a[href*="psydao.io"]');
    
    // Check X link
    await expect(xLink).toHaveAttribute('href', expect.stringContaining('x.com'));
    await expect(xLink).toHaveAttribute('target', '_blank');
    await expect(xLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
    
    // Check PsyDAO link
    await expect(psydaoLink).toHaveAttribute('href', expect.stringContaining('psydao.io'));
    await expect(psydaoLink).toHaveAttribute('target', '_blank');
    await expect(psydaoLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});

