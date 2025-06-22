import './commands';

// Desativa o log de fetch/XHR requests para manter os logs limpos
const app = window.top;
if (app) {
  app.document.addEventListener('DOMContentLoaded', () => {
    const style = app.document.createElement('style');
    style.innerHTML = `
      .command-name-request,
      .command-name-xhr {
        display: none;
      }
    `;
    app.document.head.appendChild(style);
  });
}

// Ignora erros não críticos do React
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver') || err.message.includes('act(...)')) {
    return false;
  }
  return true;
});

// Adiciona comando personalizado para navegação por teclado
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  const tab = (subject) => {
    cy.wrap(subject).trigger('keydown', {
      keyCode: 9,
      which: 9,
      key: 'Tab',
      shiftKey: false
    });
  };

  if (subject) {
    tab(subject);
  } else {
    tab(cy.focused());
  }
});

// Comando personalizado para verificar se elemento está visível
Cypress.Commands.add('shouldBeVisible', (selector) => {
  cy.get(selector).should('be.visible');
});

// Comando personalizado para verificar se elemento existe
Cypress.Commands.add('shouldExist', (selector) => {
  cy.get(selector).should('exist');
});

// Comando personalizado para fazer login
Cypress.Commands.add('login', (email, password) => {
  cy.get('[data-testid="nav-login"]').click();
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-submit"]').click();
});

// Comando personalizado para verificar API
Cypress.Commands.add('checkApiHealth', () => {
  cy.request('GET', 'http://localhost:3000/health').then((response) => {
    expect(response.status).to.eq(200);
  });
}); 