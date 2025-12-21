/**
 * Tests E2E pour le Dashboard
 */
describe('Dashboard Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should display dashboard title', () => {
    cy.contains('Tableau de bord').should('be.visible');
  });

  it('should display statistics cards', () => {
    cy.get('[class*="rounded"]').should('have.length.at.least', 1);
  });

  it('should display greeting message', () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      cy.contains('Bonjour').should('be.visible');
    } else if (hour < 18) {
      cy.contains('Bon après-midi').should('be.visible');
    } else {
      cy.contains('Bonsoir').should('be.visible');
    }
  });

  it('should display system status indicator', () => {
    cy.contains('Système actif').should('be.visible');
  });
});

/**
 * Tests E2E pour la page Documents
 */
describe('Documents Page Tests', () => {
  beforeEach(() => {
    cy.visit('/documents');
  });

  it('should display documents page title', () => {
    cy.contains('Documents').should('be.visible');
  });

  it('should display upload zone', () => {
    cy.get('[class*="dropzone"], [class*="upload"]').should('exist');
  });

  it('should have search functionality', () => {
    cy.get('input[placeholder*="Rechercher"]').should('exist');
  });
});

/**
 * Tests E2E pour l'Assistant IA
 */
describe('QA Interface Tests', () => {
  beforeEach(() => {
    cy.visit('/qa');
  });

  it('should display Assistant IA title', () => {
    cy.contains('Assistant IA').should('be.visible');
  });

  it('should display conversation history', () => {
    cy.contains('Historique').should('be.visible');
  });

  it('should display new conversation button', () => {
    cy.contains('Nouvelle conversation').should('be.visible');
  });

  it('should display question input', () => {
    cy.get('input[placeholder*="question"]').should('exist');
  });

  it('should display patient selector', () => {
    cy.get('[class*="dropdown"]').should('exist');
  });

  it('should display suggested questions', () => {
    cy.contains('Questions suggérées').should('be.visible');
  });

  it('should have microphone button for voice input', () => {
    cy.get('button[title*="Parler"]').should('exist');
  });

  it('should have voice toggle button', () => {
    cy.get('button[title*="vocale"]').should('exist');
  });
});

/**
 * Tests E2E pour la page Analytics
 */
describe('Analytics Page Tests', () => {
  beforeEach(() => {
    cy.visit('/analytics');
  });

  it('should display Analytics title', () => {
    cy.contains('Analytics').should('be.visible');
  });

  it('should display period selector', () => {
    cy.contains('7 jours').should('be.visible');
    cy.contains('30 jours').should('be.visible');
  });

  it('should display KPI cards', () => {
    cy.contains('Documents totaux').should('be.visible');
    cy.contains('Questions IA').should('be.visible');
  });

  it('should display charts', () => {
    cy.get('canvas').should('have.length.at.least', 1);
  });

  it('should display insights section', () => {
    cy.contains('Insights').should('be.visible');
  });
});

/**
 * Tests E2E pour la page Aide
 */
describe('Help Page Tests', () => {
  beforeEach(() => {
    cy.visit('/help');
  });

  it('should display Help title', () => {
    cy.contains('Aide').should('be.visible');
  });

  it('should display FAQ tab', () => {
    cy.contains('FAQ').should('be.visible');
  });

  it('should display Guide tab', () => {
    cy.contains('Guide').should('be.visible');
  });

  it('should have search functionality', () => {
    cy.get('input[placeholder*="recherche"], input[placeholder*="Rechercher"]').should('exist');
  });

  it('should display FAQ categories', () => {
    cy.contains('FAQ').click();
    cy.get('[class*="category"], [class*="section"]').should('exist');
  });
});

/**
 * Tests E2E pour le theme toggle
 */
describe('Theme Toggle Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('should toggle dark mode', () => {
    // Trouver et cliquer sur le bouton de thème
    cy.get('button[class*="rounded"]').contains('svg').parent().click({ force: true });
    // Vérifier que le mode a changé
    cy.get('body, html, div').should('satisfy', ($elements) => {
      return $elements.toArray().some(el => 
        el.classList.contains('dark') || 
        window.getComputedStyle(el).backgroundColor.includes('rgb(15')
      );
    });
  });
});
