describe('Backend API', () => {
  const apiUrl = Cypress.env('apiUrl')
  const backendUrl = Cypress.env('backendUrl')

  it('should have health endpoint working', () => {
    cy.request(`${backendUrl}/health`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('status')
      expect(response.body.status).to.eq('OK')
    })
  })

  it('should have API status endpoint working', () => {
    cy.request(`${apiUrl}/status`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('status')
      expect(response.body).to.have.property('uptime')
    })
  })

  it('should have test endpoint working', () => {
    cy.request(`${backendUrl}/api/test`).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('message')
    })
  })

  it('should handle 404 errors properly', () => {
    cy.request({
      url: `${backendUrl}/api/nonexistent`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404)
    })
  })
}) 