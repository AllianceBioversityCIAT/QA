import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Suppress CSS parsing errors from JSDOM
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Could not parse CSS stylesheet')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};
