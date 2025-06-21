describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('should have no accessibility violations on home page', () => {
    cy.checkA11y();
  });

  it('should have no accessibility violations on practice page', () => {
    cy.visit('/practice');
    cy.checkA11y();
  });

  it('should have no accessibility violations on dashboard page', () => {
    cy.visit('/dashboard');
    cy.checkA11y();
  });

  it('should have no accessibility violations on karaoke page', () => {
    cy.visit('/karaoke');
    cy.checkA11y();
  });

  it('should have no accessibility violations with high contrast mode', () => {
    // Ativa o modo de alto contraste
    cy.get('[aria-label*="contraste"]').click();
    cy.checkA11y();
  });

  it('should have no accessibility violations with dark mode', () => {
    // Ativa o modo escuro
    cy.get('[aria-label*="modo"]').click();
    cy.checkA11y();
  });

  it('should be navigable using keyboard', () => {
    // Testa navegação por teclado
    cy.get('body').tab();
    cy.focused().should('have.attr', 'aria-label').and('include', 'modo');
    
    cy.get('body').tab();
    cy.focused().should('have.attr', 'aria-label').and('include', 'contraste');
    
    // Navega até o botão de login
    cy.get('body').tab().tab();
    cy.focused().should('have.text', 'Login');
  });

  it('should announce theme changes to screen readers', () => {
    // Verifica se as mudanças de tema são anunciadas corretamente
    cy.get('[aria-label*="modo"]').click();
    cy.get('[role="alert"]').should('exist');
    
    cy.get('[aria-label*="contraste"]').click();
    cy.get('[role="alert"]').should('exist');
  });
}); 