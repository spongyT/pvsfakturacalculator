export {};

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(id: string): Chainable<JQuery>;
      findByTestId(subject: JQueryWithSelector, id: string): Chainable<JQuery>;
      /**
       * Login in via UI
       */
      loginViaUi(): void;
      openLandingPage(): void;
    }
  }
}
