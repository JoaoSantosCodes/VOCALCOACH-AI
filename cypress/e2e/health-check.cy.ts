describe('Health Check', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the application', () => {
    cy.get('body').should('be.visible')
  })

  it('should have proper title', () => {
    cy.title().should('contain', 'VocalCoach AI')
  })

  it('should have navigation elements', () => {
    cy.get('nav').should('exist')
    cy.get('header').should('exist')
  })

  it('should have main content area', () => {
    cy.get('main').should('exist')
  })
}) 