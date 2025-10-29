# Playwright Test Suite

This directory contains end-to-end tests for the eDMT Gallery application using Playwright.

## Test Files

- **home.spec.ts** - Tests for the home page (wallet connection, content display)
- **swap.spec.ts** - Tests for the swap page (LiFi widget, token swapping)
- **gallery.spec.ts** - Tests for the gallery page (token gating, content access)
- **navigation.spec.ts** - Tests for navigation between pages
- **layout.spec.ts** - Tests for layout consistency and UI elements

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### View test report
```bash
npm run test:report
```

### Run specific test file
```bash
npx playwright test tests/home.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
```

## Test Configuration

Tests are configured in `playwright.config.ts`. The configuration:
- Starts the dev server automatically before tests
- Runs on Chromium, Firefox, and WebKit browsers
- Takes screenshots on failure
- Generates traces for debugging

## Notes

- Some tests may have conditional behavior based on wallet connection state
- Tests wait for content to load before assertions
- The swap page tests handle redirects when wallet is not connected

