describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should navigate to home page', () => {
    cy.get('[data-testid="nav-home"]').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should navigate to practice page', () => {
    cy.get('[data-testid="nav-practice"]').click()
    cy.url().should('include', '/practice')
  })

  it('should navigate to dashboard', () => {
    cy.get('[data-testid="nav-dashboard"]').click()
    cy.url().should('include', '/dashboard')
  })

  it('should have working logo link', () => {
    cy.get('[data-testid="logo"]').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should show login modal when clicking login', () => {
    cy.get('[data-testid="nav-login"]').click()
    cy.get('[data-testid="login-modal"]').should('be.visible')
  })
}) 