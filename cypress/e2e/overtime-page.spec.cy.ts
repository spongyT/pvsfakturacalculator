const SESSION_NAME = 'user_logged_in';

describe('template spec', () => {
  beforeEach(() => {
    cy.loginViaUi();
  });

  xit('should show the overlay after login and moving to "Überstunden" Seite via Nav-Bar', () => {
    cy.contains('.a-TreeView-label', 'Aufwände').click();
    cy.contains('.a-TreeView-label', 'Überstunden').click();
    cy.get('#pfc_root').contains('PVS Fakturarechner');
    checkThePfcContainsPlausibleValues();
  });

  it('should show the overlay after login and moving to "Überstunden" Seite after reload', () => {
    cy.contains('.a-TreeView-label', 'Aufwände').click();
    cy.contains('.a-TreeView-label', 'Überstunden').click();
    cy.reload();
    cy.get('#pfc_root').contains('PVS Fakturarechner');
    checkThePfcContainsPlausibleValues();
  });
});

function checkThePfcContainsPlausibleValues() {}
