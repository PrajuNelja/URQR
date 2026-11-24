# URQR — Playwright QA Run Guide

## 1. Check available tests

```powershell
npx playwright test --list
```

## 2. Run all tests across all projects

```powershell
npx playwright test
```

## 3. Run individual POS viewport tests

Counter terminal — 1366 × 768:

```powershell
npx playwright test --project="POS-Counter-1366x768"
```

Standard POS — 1600 × 900:

```powershell
npx playwright test --project="POS-Standard-1600x900"
```

Desktop POS — 1920 × 1080:

```powershell
npx playwright test --project="POS-Desktop-1920x1080"
```

## 4. Run only viewport verification tests

```powershell
npx playwright test tests/pos-viewport.spec.ts
```

## 5. Open the HTML test report

```powershell
npx playwright show-report
```

## 6. Install Playwright browsers (if needed)

```powershell
npx playwright install
```

## 7. Run tests in headed mode (visible browser)

```powershell
npx playwright test --headed
```

## 8. Run tests in debug mode

```powershell
npx playwright test --debug
```

## 9. View a failure trace

Replace the path with the actual trace.zip path inside test-results:

```powershell
npx playwright show-trace "test-results/your-test-folder/trace.zip"
```

## 10. Evidence capture configuration

Keep this in playwright.config.ts:

```typescript
use: {
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
},
```

## Important

- Run commands from the URQR project directory.
- Successful tests do not retain failure evidence with the current configuration.
- Failed tests retain screenshots, videos and traces.
- Review the HTML report after test execution.
- Do not keep intentionally failing test files in the regular test suite.

1. First, collect these details from the development team
Information needed	What to ask
Git repository	    Which repository contains the latest URQR POS code?
Git branch	           Which branch should QA pull?
Frontend	        What is the frontend start command and local URL?
Backend	              What is the backend start command and port?
Environment	           Do we need .env files or configuration values?
Test accounts	       Are QA login credentials available?
API	               Is /actuator/health/liveness accessible?
Database	       Is a QA/test database available?
POS hardware	    Is a physical POS terminal available for testing?
