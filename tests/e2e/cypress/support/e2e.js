// ***********************************************************
// Cypress E2E Support File
// ***********************************************************

// Import commands.js using ES2015 syntax:
// import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // on uncaught exceptions from the application
  return false;
});

// Custom commands
Cypress.Commands.add('login', (username, password) => {
  // Implement login if authentication is added
  cy.log('Login command - not yet implemented');
});

Cypress.Commands.add('visitPage', (pageName) => {
  const routes = {
    dashboard: '/dashboard',
    documents: '/documents',
    patients: '/patients',
    qa: '/qa',
    synthesis: '/synthesis',
    analytics: '/analytics',
    audit: '/audit',
    help: '/help',
    settings: '/settings'
  };
  
  const route = routes[pageName] || `/${pageName}`;
  cy.visit(route);
});

Cypress.Commands.add('openCommandPalette', () => {
  cy.get('body').type('{ctrl}k');
});

Cypress.Commands.add('closeCommandPalette', () => {
  cy.get('body').type('{esc}');
});

Cypress.Commands.add('searchInCommandPalette', (query) => {
  cy.openCommandPalette();
  cy.get('input[placeholder*="Rechercher"]').type(query);
});

// Before each test hook
beforeEach(() => {
  // Clear local storage except for theme preference
  cy.window().then((win) => {
    const theme = win.localStorage.getItem('theme');
    win.localStorage.clear();
    if (theme) {
      win.localStorage.setItem('theme', theme);
    }
  });
});
