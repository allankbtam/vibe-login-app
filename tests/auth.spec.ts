import { test, expect } from '@playwright/test';

const TIMESTAMP = Date.now();
const testEmail = `test${TIMESTAMP}@example.com`;
const testPassword = 'password123';

test.describe('Authentication Flow', () => {
  test('register a new user, login, see dashboard, and logout', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // ===== Step 1: Register =====
    await expect(page.locator('#authCard')).toBeVisible();
    await expect(page.locator('#loginForm')).toBeVisible();

    // Switch to Register tab
    await page.click('#registerTab');
    await expect(page.locator('#registerForm')).toBeVisible();
    await expect(page.locator('#loginForm')).toHaveClass(/hidden/);

    // Fill out registration form
    await page.fill('#registerUsername', testEmail);
    await page.fill('#registerPassword', testPassword);
    await page.fill('#registerConfirmPassword', testPassword);

    // Submit registration
    await page.click('#registerForm .auth-btn');

    // Wait for success message
    const successMsg = page.locator('#registerSuccess');
    await expect(successMsg).toBeVisible({ timeout: 15000 });
    await expect(successMsg).toContainText('Account created successfully');

    // Because email confirmations are disabled, registration auto-signs in the user.
    // The onAuthStateChange listener will fire SIGNED_IN and call showDashboard(),
    // hiding the auth card. So we wait for the dashboard directly.
    await expect(page.locator('#dashboardCard')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#displayUsername')).toContainText(testEmail);

    // Auth card should already be hidden (auto-sign in went straight to dashboard)
    await expect(page.locator('#authCard')).toHaveClass(/hidden/);

    // ===== Step 2: Logout =====
    await page.click('.logout-btn');

    // Auth card should be visible again
    await expect(page.locator('#authCard')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#dashboardCard')).toHaveClass(/hidden/);
    await expect(page.locator('#loginForm')).toBeVisible();

    // ===== Step 3: Login (now that we're back at auth screen) =====
    await page.fill('#loginUsername', testEmail);
    await page.fill('#loginPassword', testPassword);
    await page.click('#loginForm .auth-btn');

    // Wait for dashboard to appear again
    await expect(page.locator('#dashboardCard')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#displayUsername')).toContainText(testEmail);

    // Auth card should be hidden
    await expect(page.locator('#authCard')).toHaveClass(/hidden/);
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/');

    await page.fill('#loginUsername', 'wrong@example.com');
    await page.fill('#loginPassword', 'wrongpassword');
    await page.click('#loginForm .auth-btn');

    // Wait for error message
    const errorMsg = page.locator('#loginError');
    await expect(errorMsg).toBeVisible({ timeout: 15000 });
    await expect(errorMsg).toContainText(/Invalid|invalid/i);
  });
});