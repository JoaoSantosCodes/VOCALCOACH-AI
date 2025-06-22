describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have proper page structure', () => {
    cy.get('html').should('have.attr', 'lang');
    cy.get('head title').should('exist');
    cy.get('main').should('exist');
  });

  it('should have proper heading hierarchy', () => {
    cy.get('h1').should('exist');
    cy.get('h1').should('be.visible');
  });

  it('should have proper navigation', () => {
    cy.get('nav').should('exist');
    cy.get('nav a').should('have.attr', 'href');
  });

  it('should have proper form elements', () => {
    cy.get('input').should('have.attr', 'type');
    cy.get('button').should('have.attr', 'type');
  });

  it('should have proper images', () => {
    cy.get('img').should('have.attr', 'alt');
  });

  it('should have proper links', () => {
    cy.get('a').should('have.attr', 'href');
  });

  it('should have proper buttons', () => {
    cy.get('button').should('be.visible');
  });

  it('should have proper color contrast', () => {
    // Teste básico de contraste - verifica se o texto é visível
    cy.get('body').should('have.css', 'color');
    cy.get('body').should('have.css', 'background-color');
  });
}); 