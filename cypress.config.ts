import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://pvslite.opitz-consulting.de',
    viewportWidth: 1200,
    viewportHeight: 800,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('before:browser:launch', (browser, launchOptions) => {
        // supply the absolute path to an unpacked extension's folder
        // NOTE: extensions cannot be loaded in headless Chrome
        launchOptions.extensions.push('/Users/tobias/git/pvsfakturacalculator');
        return launchOptions;
      });
    },
    // testIsolation: false, // disable testIsolation (clean up all cookies to speed up tests, must make sure test are indepdent by ourself as tradeoff
  },
});
