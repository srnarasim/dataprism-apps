import { test, expect } from '@playwright/test';

test.describe('Demo Application', () => {
  test('should load the homepage', async ({ page }) => {
    // Navigate to the demo app
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for the page to be visible
    await page.waitForLoadState('domcontentloaded');
    
    // Basic assertion that page loads
    expect(page.locator('body')).toBeVisible();
    
    // Check that we have some HTML content
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should have React app structure', async ({ page }) => {
    // Navigate to root
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for React to render
    await page.waitForTimeout(3000);
    
    // Check that we have some basic HTML structure
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeDefined();
    expect(bodyContent).not.toBe('');
  });
});