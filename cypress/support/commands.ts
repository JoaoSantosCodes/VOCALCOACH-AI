/// <reference types="cypress" />

// Comando para simular permissão do microfone
Cypress.Commands.add('mockUserMedia', () => {
  cy.window().then((win) => {
    cy.stub(win.navigator.mediaDevices, 'getUserMedia')
      .resolves({
        getTracks: () => [{
          stop: () => {},
        }],
      });
  });
});

// Comando para verificar o estado do áudio
Cypress.Commands.add('checkAudioState', (expectedState: 'recording' | 'stopped') => {
  cy.get('[data-testid=audio-status]').should('have.text', expectedState);
});

// Comando para iniciar gravação
Cypress.Commands.add('startRecording', () => {
  cy.get('[data-testid=start-recording]').click();
});

// Comando para parar gravação
Cypress.Commands.add('stopRecording', () => {
  cy.get('[data-testid=stop-recording]').click();
});

// Comando para verificar feedback visual
Cypress.Commands.add('checkVisualFeedback', () => {
  cy.get('[data-testid=timbre-visualizer]').should('be.visible');
  cy.get('[data-testid=volume-indicator]').should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      mockUserMedia(): Chainable<void>;
      checkAudioState(state: 'recording' | 'stopped'): Chainable<void>;
      startRecording(): Chainable<void>;
      stopRecording(): Chainable<void>;
      checkVisualFeedback(): Chainable<void>;
    }
  }
} 