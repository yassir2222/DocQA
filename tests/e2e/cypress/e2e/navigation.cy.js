/**
 * Tests E2E pour la navigation principale
 */
describe('Navigation Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should redirect to dashboard', () => {
    cy.url().should('include', '/dashboard');
  });

  it('should display sidebar navigation', () => {
    cy.get('aside').should('be.visible');
    cy.contains('Tableau de bord').should('be.visible');
    cy.contains('Documents').should('be.visible');
    cy.contains('Assistant IA').should('be.visible');
  });

  it('should navigate to Documents page', () => {
    cy.contains('Documents').click();
    cy.url().should('include', '/documents');
  });

  it('should navigate to Patients page', () => {
    cy.contains('Patients').click();
    cy.url().should('include', '/patients');
  });

  it('should navigate to Assistant IA page', () => {
    cy.contains('Assistant IA').click();
    cy.url().should('include', '/qa');
  });

  it('should navigate to Synthesis page', () => {
    cy.contains('Synthèse').click();
    cy.url().should('include', '/synthesis');
  });

  it('should navigate to Analytics page', () => {
    cy.contains('Analytics').click();
    cy.url().should('include', '/analytics');
  });

  it('should navigate to Audit page', () => {
    cy.contains("Journal d'audit").click();
    cy.url().should('include', '/audit');
  });

  it('should navigate to Help page', () => {
    cy.contains('Aide').click();
    cy.url().should('include', '/help');
  });

  it('should navigate to Settings page', () => {
    cy.contains('Paramètres').click();
    cy.url().should('include', '/settings');
  });
});

/**
 * Tests E2E pour la Command Palette
 */
describe('Command Palette Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should open command palette with Ctrl+K', () => {
    cy.get('body').type('{ctrl}k');
    cy.get('input[placeholder*="Rechercher"]').should('be.visible');
  });

  it('should close command palette with Escape', () => {
    cy.get('body').type('{ctrl}k');
    cy.get('input[placeholder*="Rechercher"]').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('input[placeholder*="Rechercher"]').should('not.exist');
  });

  it('should search and navigate to page', () => {
    cy.get('body').type('{ctrl}k');
    cy.get('input[placeholder*="Rechercher"]').type('Documents');
    cy.contains('Documents').click();
    cy.url().should('include', '/documents');
  });

  it('should open via search button click', () => {
    cy.contains('Rechercher').click();
    cy.get('input[placeholder*="Rechercher"]').should('be.visible');
  });
});
