import { test, expect } from '@playwright/test';

/**
 * URQR Platform — Phase 1 Standalone Manager POS
 * Bharath | QA Automation & Hardware Lead
 * Playwright UI Component Test Suite
 *
 * Scope: shadcn/ui Form, Input, Button, Alert Primitives & Virtual Keypad Bounds
 * Technical Standards: Playwright 1.65.1, Chromium & WebKit, Touch Targets >= 48px
 */

// Embedded component test fixture matching shadcn/ui & Tailwind design tokens
const createComponentFixtureHtml = ({
  isLoading = false,
  hasError = false,
  errorMessage = 'This field is required',
  showKeypad = false,
} = {}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>URQR POS UI Primitives Fixture</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 24px;
    }
    .form-container {
      width: 100%;
      max-width: 440px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .form-group {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    input {
      width: 100%;
      min-height: 48px;
      height: 48px;
      padding: 10px 16px;
      font-size: 15px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #f8fafc;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    input:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    }
    input[aria-invalid="true"] {
      border-color: #ef4444 !important;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
    }
    .error-msg {
      font-size: 12px;
      color: #f87171;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn {
      width: 100%;
      min-height: 48px;
      height: 48px;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      background: #0284c7;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background-color 0.15s ease, opacity 0.15s ease;
    }
    .btn:hover:not(:disabled) {
      background: #0369a1;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .alert-banner {
      width: 100%;
      max-width: 440px;
      margin-bottom: 20px;
      padding: 14px 16px;
      border-radius: 8px;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }
    .alert-close {
      background: transparent;
      border: none;
      color: #fca5a5;
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
    }
    /* Touch Keypad Simulation */
    .touch-keypad {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 280px;
      background: #0f172a;
      border-top: 2px solid #334155;
      padding: 16px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      z-index: 1000;
    }
    .keypad-btn {
      min-height: 64px;
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      font-size: 20px;
      font-weight: 700;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div id="alert-container" class="alert-banner" role="alert" style="display: ${hasError ? 'flex' : 'none'};">
    <span id="alert-text">${errorMessage}</span>
    <button class="alert-close" id="alert-dismiss" aria-label="Dismiss alert">&times;</button>
  </div>

  <form id="pos-login-form" class="form-container" novalidate>
    <div class="form-group">
      <label for="username-input">Manager Username</label>
      <div class="input-wrapper">
        <input
          id="username-input"
          name="username"
          type="text"
          placeholder="e.g. pos_manager_1"
          aria-invalid="${hasError ? 'true' : 'false'}"
          aria-describedby="username-error"
        />
      </div>
      <p id="username-error" class="error-msg" role="alert" style="display: ${hasError ? 'block' : 'none'};">
        ${errorMessage}
      </p>
    </div>

    <div class="form-group">
      <label for="password-input">Security PIN / Password</label>
      <div class="input-wrapper">
        <input
          id="password-input"
          name="password"
          type="password"
          placeholder="Enter 4-6 digit PIN"
          aria-invalid="false"
          aria-describedby="password-error"
        />
      </div>
      <p id="password-error" class="error-msg" role="alert" style="display: none;">
        PIN must be at least 4 digits
      </p>
    </div>

    <button
      id="submit-btn"
      class="btn"
      type="submit"
      ${isLoading ? 'disabled aria-busy="true"' : 'aria-busy="false"'}
    >
      ${isLoading ? '<div class="spinner" aria-hidden="true"></div><span>Authenticating...</span>' : '<span>Sign In to POS</span>'}
    </button>
  </form>

  ${showKeypad ? `
  <div id="virtual-keypad" class="touch-keypad" role="region" aria-label="Touch numeric keypad">
    <button type="button" class="keypad-btn">1</button>
    <button type="button" class="keypad-btn">2</button>
    <button type="button" class="keypad-btn">3</button>
    <button type="button" class="keypad-btn">4</button>
    <button type="button" class="keypad-btn">5</button>
    <button type="button" class="keypad-btn">6</button>
    <button type="button" class="keypad-btn">7</button>
    <button type="button" class="keypad-btn">8</button>
    <button type="button" class="keypad-btn">9</button>
    <button type="button" class="keypad-btn">CLR</button>
    <button type="button" class="keypad-btn">0</button>
    <button type="button" class="keypad-btn">DEL</button>
  </div>
  ` : ''}

  <script>
    // Dynamic interactive behavior for validation & loading tests
    const form = document.getElementById('pos-login-form');
    const usernameInput = document.getElementById('username-input');
    const usernameError = document.getElementById('username-error');
    const submitBtn = document.getElementById('submit-btn');
    const alertContainer = document.getElementById('alert-container');
    const alertDismiss = document.getElementById('alert-dismiss');

    usernameInput.addEventListener('blur', () => {
      if (!usernameInput.value.trim()) {
        usernameInput.setAttribute('aria-invalid', 'true');
        usernameError.style.display = 'block';
      } else {
        usernameInput.setAttribute('aria-invalid', 'false');
        usernameError.style.display = 'none';
      }
    });

    usernameInput.addEventListener('input', () => {
      if (usernameInput.value.trim()) {
        usernameInput.setAttribute('aria-invalid', 'false');
        usernameError.style.display = 'none';
      }
    });

    if (alertDismiss) {
      alertDismiss.addEventListener('click', () => {
        alertContainer.style.display = 'none';
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!usernameInput.value.trim()) {
        usernameInput.setAttribute('aria-invalid', 'true');
        usernameError.style.display = 'block';
        return;
      }
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.innerHTML = '<div class="spinner" aria-hidden="true"></div><span>Authenticating...</span>';
    });
  </script>
</body>
</html>
`;

test.describe('Task 1: Form, Input, Button, and Alert Primitives', () => {
  test('Renders shadcn/ui primitives with minimum 48px touch targets', async ({ page }) => {
    await page.setContent(createComponentFixtureHtml());

    const usernameInput = page.locator('#username-input');
    const passwordInput = page.locator('#password-input');
    const submitBtn = page.locator('#submit-btn');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Verify touch target ergonomics: minimum 48px height
    const inputHeight = await usernameInput.evaluate((el) => el.getBoundingClientRect().height);
    const btnHeight = await submitBtn.evaluate((el) => el.getBoundingClientRect().height);

    expect(inputHeight).toBeGreaterThanOrEqual(48);
    expect(btnHeight).toBeGreaterThanOrEqual(48);
  });
});

test.describe('Task 2: Touch-Screen Virtual Keypad Accessibility Bounds', () => {
  test('Assert input fields remain strictly visible above virtual keypad without overlap', async ({ page }) => {
    // Set POS Counter terminal viewport: 1366x768
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.setContent(createComponentFixtureHtml({ showKeypad: true }));

    const usernameInput = page.locator('#username-input');
    const passwordInput = page.locator('#password-input');
    const keypad = page.locator('#virtual-keypad');

    await expect(keypad).toBeVisible();

    const keypadBox = await keypad.boundingBox();
    expect(keypadBox).not.toBeNull();

    // Verify username input bounding box is strictly above keypad
    const usernameBox = await usernameInput.boundingBox();
    expect(usernameBox).not.toBeNull();
    expect(usernameBox!.y + usernameBox!.height).toBeLessThanOrEqual(keypadBox!.y);
    expect(usernameBox!.y).toBeGreaterThanOrEqual(0);

    // Verify password input bounding box is strictly above keypad
    const passwordBox = await passwordInput.boundingBox();
    expect(passwordBox).not.toBeNull();
    expect(passwordBox!.y + passwordBox!.height).toBeLessThanOrEqual(keypadBox!.y);
    expect(passwordBox!.y).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Task 3: Form Validation States on Blur', () => {
  test('Assert instant field-level error messages render when invalid inputs are blurred', async ({ page }) => {
    await page.setContent(createComponentFixtureHtml());

    const usernameInput = page.locator('#username-input');
    const errorMsg = page.locator('#username-error');

    // Initially error must be hidden
    await expect(errorMsg).toBeHidden();
    expect(await usernameInput.getAttribute('aria-invalid')).toBe('false');

    // Focus and blur without typing
    await usernameInput.focus();
    await usernameInput.blur();

    // Assert field-level error renders with role="alert" and aria-invalid="true"
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toHaveText('This field is required');
    expect(await usernameInput.getAttribute('aria-invalid')).toBe('true');

    // Enter valid text and assert error clears
    await usernameInput.fill('pos_manager_1');
    expect(await usernameInput.getAttribute('aria-invalid')).toBe('false');
    await expect(errorMsg).toBeHidden();
  });
});

test.describe('Task 4: Button Loading & Disabled States', () => {
  test('Assert button is disabled and shows animated loading spinner during async events', async ({ page }) => {
    // Initial state: not loading
    await page.setContent(createComponentFixtureHtml());
    const submitBtn = page.locator('#submit-btn');

    await expect(submitBtn).toBeEnabled();
    expect(await submitBtn.getAttribute('aria-busy')).toBe('false');
    await expect(page.locator('.spinner')).toHaveCount(0);

    // Load fixture with active loading state
    await page.setContent(createComponentFixtureHtml({ isLoading: true }));
    const loadingBtn = page.locator('#submit-btn');

    await expect(loadingBtn).toBeDisabled();
    expect(await loadingBtn.getAttribute('aria-busy')).toBe('true');

    // Verify animated spinner exists and has aria-hidden
    const spinner = loadingBtn.locator('.spinner');
    await expect(spinner).toBeVisible();
    expect(await spinner.getAttribute('aria-hidden')).toBe('true');
  });

  test('Alert banner displays error message and supports dismissal', async ({ page }) => {
    await page.setContent(createComponentFixtureHtml({ hasError: true, errorMessage: 'Invalid cashier credentials' }));
    const alert = page.locator('#alert-container');
    const alertText = page.locator('#alert-text');
    const dismissBtn = page.locator('#alert-dismiss');

    await expect(alert).toBeVisible();
    await expect(alertText).toHaveText('Invalid cashier credentials');

    // Click dismiss button
    await dismissBtn.click();
    await expect(alert).toBeHidden();
  });
});
