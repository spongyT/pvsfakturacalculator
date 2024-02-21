export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login in via UI
       */
      loginViaUi(): void;
      openLandingPage(): void;
    }
  }
}
