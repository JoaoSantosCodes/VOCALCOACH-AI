import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Practice from '../../pages/Practice';

// Mock dos componentes que não queremos testar
jest.mock('../../components/VoiceAnalysis/VoiceCapture', () => {
  return function MockVoiceCapture() {
    return <div data-testid="voice-capture">Voice Capture Component</div>;
  };
});

jest.mock('../../components/VoiceAnalysis/TimbreVisualizer', () => {
  return function MockTimbreVisualizer() {
    return <div data-testid="timbre-visualizer">Timbre Visualizer Component</div>;
  };
});

jest.mock('../../components/VoiceExercise/ExerciseList', () => {
  return function MockExerciseList({ onSelect }: { onSelect: (exercise: any) => void }) {
    return (
      <div data-testid="exercise-list">
        <button onClick={() => onSelect({ id: 1, name: 'Test Exercise' })}>
          Select Exercise
        </button>
      </div>
    );
  };
});

jest.mock('../../components/VoiceExercise/ExerciseGuide', () => {
  return function MockExerciseGuide({ onComplete }: { onComplete: () => void }) {
    return (
      <div data-testid="exercise-guide">
        <button onClick={onComplete}>Complete Exercise</button>
      </div>
    );
  };
});

describe('Practice Component', () => {
  const renderPractice = () => {
    return render(
      <BrowserRouter>
        <Practice />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderPractice();
    expect(screen.getByTestId('exercise-list')).toBeInTheDocument();
  });

  it('shows exercise guide when exercise is selected', () => {
    renderPractice();
    
    // Seleciona um exercício
    fireEvent.click(screen.getByText('Select Exercise'));
    
    // Verifica se o guia de exercício é mostrado
    expect(screen.getByTestId('exercise-guide')).toBeInTheDocument();
  });

  it('shows analysis when exercise is completed', () => {
    renderPractice();
    
    // Seleciona um exercício
    fireEvent.click(screen.getByText('Select Exercise'));
    
    // Completa o exercício
    fireEvent.click(screen.getByText('Complete Exercise'));
    
    // Verifica se os componentes de análise são mostrados
    expect(screen.getByTestId('voice-capture')).toBeInTheDocument();
    expect(screen.getByTestId('timbre-visualizer')).toBeInTheDocument();
  });

  it('allows returning to exercise list', () => {
    renderPractice();
    
    // Seleciona um exercício
    fireEvent.click(screen.getByText('Select Exercise'));
    
    // Completa o exercício
    fireEvent.click(screen.getByText('Complete Exercise'));
    
    // Volta para a lista
    fireEvent.click(screen.getByText('Voltar para Lista'));
    
    // Verifica se voltou para a lista de exercícios
    expect(screen.getByTestId('exercise-list')).toBeInTheDocument();
  });
}); 