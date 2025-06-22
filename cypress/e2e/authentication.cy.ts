describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should open login modal', () => {
    cy.get('[data-testid="nav-login"]').click()
    cy.get('[data-testid="login-modal"]').should('be.visible')
    cy.get('[data-testid="login-form"]').should('exist')
  })

  it('should show validation errors for empty form', () => {
    cy.get('[data-testid="nav-login"]').click()
    cy.get('[data-testid="login-submit"]').click()
    cy.get('[data-testid="error-message"]').should('be.visible')
  })

  it('should handle invalid credentials', () => {
    cy.get('[data-testid="nav-login"]').click()
    cy.get('[data-testid="email-input"]').type('invalid@email.com')
    cy.get('[data-testid="password-input"]').type('wrongpassword')
    cy.get('[data-testid="login-submit"]').click()
    cy.get('[data-testid="error-message"]').should('be.visible')
  })

  it('should close modal when clicking outside', () => {
    cy.get('[data-testid="nav-login"]').click()
    cy.get('[data-testid="login-modal"]').should('be.visible')
    cy.get('body').click(0, 0)
    cy.get('[data-testid="login-modal"]').should('not.be.visible')
  })

  it('should have proper form fields', () => {
    cy.get('[data-testid="nav-login"]').click()
    cy.get('[data-testid="email-input"]').should('exist')
    cy.get('[data-testid="password-input"]').should('exist')
    cy.get('[data-testid="login-submit"]').should('exist')
  })
}) 