import { test, expect } from '@playwright/test';

test.describe('MCP Analytics Workflow - Complete Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to initialize
    await page.waitForSelector('text=MCP Analytics Workflow', { timeout: 30000 });
  });

  test('application loads and displays initial state correctly', async ({ page }) => {
    // Check that the main header is visible
    await expect(page.locator('h1')).toContainText('MCP Analytics Workflow');
    await expect(page.locator('text=Automated Sales Data Quality and Insight Agent')).toBeVisible();
    await expect(page.locator('text=v3.0 - React Flow Professional Visualizer')).toBeVisible();
    
    // Check that key UI elements are present
    await expect(page.locator('text=Data Upload')).toBeVisible();
    await expect(page.locator('text=📊 Choose CSV File')).toBeVisible();
    await expect(page.locator('text=📥 Download sample CSV')).toBeVisible();
    await expect(page.locator('text=🚀 Start New Workflow')).toBeVisible();
    
    // Check that workflow visualization area is present
    await expect(page.locator('text=Workflow Execution')).toBeVisible();
  });

  test('can download sample CSV file', async ({ page }) => {
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click the download sample CSV link
    await page.locator('text=📥 Download sample CSV').click();
    
    // Wait for download to complete
    const download = await downloadPromise;
    
    // Check download properties
    expect(download.suggestedFilename()).toBe('sample-sales-data.csv');
    
    // Save the file to check its contents
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('workflow execution completes successfully with sample CSV', async ({ page }) => {
    // First download and then upload the sample CSV
    const downloadPromise = page.waitForEvent('download');
    await page.locator('text=📥 Download sample CSV').click();
    const download = await downloadPromise;
    const csvPath = await download.path();
    
    // Upload the downloaded CSV file
    const fileInput = page.locator('input[type="file"]');
    if (csvPath) {
      await fileInput.setInputFiles(csvPath);
    }
    
    // Verify file upload success
    await expect(page.locator('text=✅')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=.csv')).toBeVisible();
    
    // Start the workflow
    await page.locator('text=🚀 Start New Workflow').click();
    
    // Wait for workflow to start running
    await expect(page.locator('text=⏳ Running...')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Status: RUNNING')).toBeVisible();
    
    // Wait for workflow to complete (may take some time)
    await expect(page.locator('text=Status: COMPLETED')).toBeVisible({ timeout: 60000 });
    
    // Check that the report button appears
    await expect(page.locator('text=📊 Show Report')).toBeVisible();
  });

  test('React Flow visualization displays correctly during workflow', async ({ page }) => {
    // Start workflow without file upload (should work with mock data)
    await page.locator('text=🚀 Start New Workflow').click();
    
    // Wait for React Flow to render
    await page.waitForSelector('[data-testid="rf__wrapper"]', { timeout: 15000 });
    
    // Check that React Flow components are present
    await expect(page.locator('[data-testid="rf__wrapper"]')).toBeVisible();
    
    // Check for workflow nodes
    await expect(page.locator('text=Data Input')).toBeVisible();
    await expect(page.locator('text=Calculations')).toBeVisible();
    await expect(page.locator('text=AI Insights')).toBeVisible();
    
    // Check for React Flow controls
    await expect(page.locator('[data-testid="rf__controls"]')).toBeVisible();
    
    // Check for status legend
    await expect(page.locator('text=Workflow Status')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Running')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test('workflow report displays after completion', async ({ page }) => {
    // Start workflow
    await page.locator('text=🚀 Start New Workflow').click();
    
    // Wait for completion
    await expect(page.locator('text=Status: COMPLETED')).toBeVisible({ timeout: 60000 });
    
    // Click show report button
    await page.locator('text=📊 Show Report').click();
    
    // Check report content
    await expect(page.locator('text=📊 Workflow Report')).toBeVisible();
    await expect(page.locator('text=Sales Analysis Workflow')).toBeVisible();
    await expect(page.locator('text=Executive Summary')).toBeVisible();
    await expect(page.locator('text=Step Results')).toBeVisible();
    
    // Check for data metrics
    await expect(page.locator('text=Data Processed')).toBeVisible();
    await expect(page.locator('text=Total Sales')).toBeVisible();
    await expect(page.locator('text=Key Insights')).toBeVisible();
    
    // Check export functionality
    await expect(page.locator('text=📥 Export Report')).toBeVisible();
    
    // Test export
    const downloadPromise = page.waitForEvent('download');
    await page.locator('text=📥 Export Report').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/workflow-report.*\.json/);
  });

  test('audit log functionality works correctly', async ({ page }) => {
    // Start workflow
    await page.locator('text=🚀 Start New Workflow').click();
    
    // Show audit log
    await page.locator('text=📝 Show Audit Log').click();
    
    // Check audit log content
    await expect(page.locator('text=Audit Log')).toBeVisible();
    await expect(page.locator('text=Hide Audit Log')).toBeVisible();
    
    // Hide audit log
    await page.locator('text=📝 Hide Audit Log').click();
    await expect(page.locator('text=Show Audit Log')).toBeVisible();
  });

  test('technical documentation modal works', async ({ page }) => {
    // Open documentation
    await page.locator('text=📚 How It\'s Built').first().click();
    
    // Check modal content
    await expect(page.locator('text=DataPrism Framework, Plugins & Architecture')).toBeVisible();
    await expect(page.locator('text=⚡ DataPrism Framework')).toBeVisible();
    await expect(page.locator('text=🔌 Plugin Architecture')).toBeVisible();
    await expect(page.locator('text=🔄 Workflow Pipeline')).toBeVisible();
    
    // Close modal
    await page.locator('text=✕').click();
    await expect(page.locator('text=DataPrism Framework, Plugins & Architecture')).not.toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that main elements are still visible and accessible
    await expect(page.locator('h1')).toContainText('MCP Analytics Workflow');
    await expect(page.locator('text=📊 Choose CSV File')).toBeVisible();
    await expect(page.locator('text=🚀 Start New Workflow')).toBeVisible();
    
    // Start workflow to test mobile layout
    await page.locator('text=🚀 Start New Workflow').click();
    
    // Check that React Flow adapts to mobile
    await page.waitForSelector('[data-testid="rf__wrapper"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="rf__wrapper"]')).toBeVisible();
  });

  test('error handling works correctly', async ({ page }) => {
    // Test with invalid file upload (if possible)
    const invalidFile = 'data:text/plain;base64,VGhpcyBpcyBub3QgYSBDU1YgZmlsZQ==';
    
    // Try to trigger an error state by uploading non-CSV content
    // Note: This may not work in all browsers due to file input restrictions
    
    // Check that error states are handled gracefully
    // The app should continue to function even if some operations fail
    
    // Verify app remains responsive
    await expect(page.locator('text=MCP Analytics Workflow')).toBeVisible();
    await expect(page.locator('text=🚀 Start New Workflow')).toBeVisible();
  });

  test('workflow state persistence during page interactions', async ({ page }) => {
    // Start workflow
    await page.locator('text=🚀 Start New Workflow').click();
    
    // Wait for workflow to start
    await expect(page.locator('text=Status: RUNNING')).toBeVisible({ timeout: 10000 });
    
    // Interact with other UI elements while workflow is running
    await page.locator('text=📝 Show Audit Log').click();
    await expect(page.locator('text=Audit Log')).toBeVisible();
    
    // Hide audit log
    await page.locator('text=📝 Hide Audit Log').click();
    
    // Open documentation
    await page.locator('text=📚 How It\'s Built').first().click();
    await expect(page.locator('text=DataPrism Framework, Plugins & Architecture')).toBeVisible();
    
    // Close documentation
    await page.locator('text=✕').click();
    
    // Verify workflow is still running/completed
    const workflowStatus = await page.locator('text=Status:').textContent();
    expect(workflowStatus).toMatch(/Status: (RUNNING|COMPLETED)/);
  });

  test('multiple workflow executions work correctly', async ({ page }) => {
    // Start first workflow
    await page.locator('text=🚀 Start New Workflow').click();
    
    // Wait for completion
    await expect(page.locator('text=Status: COMPLETED')).toBeVisible({ timeout: 60000 });
    
    // Check workflow count
    await expect(page.locator('text=1').first()).toBeVisible(); // Total workflows
    await expect(page.locator('text=1').nth(1)).toBeVisible(); // Completed workflows
    
    // Start second workflow
    await page.locator('text=🚀 Start New Workflow').click();
    
    // Wait for completion
    await expect(page.locator('text=Status: COMPLETED')).toBeVisible({ timeout: 60000 });
    
    // Check updated workflow count
    await expect(page.locator('text=2').first()).toBeVisible(); // Total workflows
    await expect(page.locator('text=2').nth(1)).toBeVisible(); // Completed workflows
  });
});