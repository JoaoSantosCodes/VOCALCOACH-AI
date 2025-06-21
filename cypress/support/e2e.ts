import './commands';
import '@testing-library/cypress/add-commands';
import 'cypress-axe';

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

// Configura regras personalizadas do axe
beforeEach(() => {
  cy.configureAxe({
    rules: [
      {
        id: 'color-contrast',
        enabled: true,
        options: {
          noScroll: true,
        },
      },
    ],
  });
}); 