// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('getByTestId', (id: string) => {
  const selector = `[data-testid="${id}"]`;
  return cy.get(selector);
});

Cypress.Commands.add('findByTestId', { prevSubject: 'element' }, (subject, id) => {
  const selector = `[data-testid^="${id}"]`;
  return cy.wrap(subject, { log: false }).find(selector);
});

Cypress.Commands.add('openLandingPage', () => {
  cy.visit('ords/f?p=2000:1:8982961480578');
});
Cypress.Commands.add('loginViaUi', () => {
  // cy.session('USER', () => {
  const username = Cypress.env('USERNAME');
  const password = Cypress.env('PASSWORD');

  expect(username, 'username was set').to.be.a('string').and.not.be.empty;
  if (typeof password !== 'string' || !password) {
    throw new Error('Missing password value, set using CYPRESS_PASSWORD=...');
  }

  cy.visit('');
  cy.get('#P101_USERNAME').type(username);
  cy.get('#P101_PASSWORD').type(password, { log: false });
  cy.contains('button', 'Anmelden').click();

  cy.contains('a', 'Log Out').should('be.visible');
  // });
});
