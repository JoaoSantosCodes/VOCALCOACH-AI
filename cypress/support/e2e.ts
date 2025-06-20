import './commands';
import '@testing-library/cypress/add-commands';

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