describe('Voice Recording Flow', () => {
  beforeEach(() => {
    cy.visit('/practice');
    cy.mockUserMedia();
  });

  it('should complete a full recording session', () => {
    // Verifica estado inicial
    cy.checkAudioState('stopped');

    // Inicia gravação
    cy.startRecording();
    cy.checkAudioState('recording');
    cy.checkVisualFeedback();

    // Espera alguns segundos de gravação
    cy.wait(3000);

    // Para gravação
    cy.stopRecording();
    cy.checkAudioState('stopped');

    // Verifica feedback após gravação
    cy.get('[data-testid=recording-feedback]').should('be.visible');
  });

  it('should handle microphone permissions correctly', () => {
    // Simula negação de permissão
    cy.window().then((win) => {
      cy.stub(win.navigator.mediaDevices, 'getUserMedia')
        .rejects(new Error('Permission denied'));
    });

    cy.startRecording();
    cy.get('[data-testid=permission-error]').should('be.visible');
  });

  it('should display visual feedback during recording', () => {
    cy.startRecording();
    
    // Verifica elementos visuais
    cy.get('[data-testid=timbre-visualizer]')
      .should('be.visible')
      .and('have.css', 'opacity')
      .and('not.equal', '0');

    cy.get('[data-testid=volume-indicator]')
      .should('be.visible')
      .and('have.css', 'height')
      .and('not.equal', '0px');

    cy.stopRecording();
  });

  it('should handle audio processing correctly', () => {
    cy.startRecording();

    // Verifica processamento de áudio
    cy.get('[data-testid=pitch-value]').should('not.equal', '0');
    cy.get('[data-testid=clarity-value]').should('not.equal', '0');
    cy.get('[data-testid=snr-value]').should('exist');

    cy.stopRecording();
  });
}); 