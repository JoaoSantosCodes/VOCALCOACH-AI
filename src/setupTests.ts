import '@testing-library/jest-dom';

// Mock do MediaStream para testes de áudio
window.MediaStream = jest.fn().mockImplementation(() => ({
  getTracks: () => [{
    stop: jest.fn()
  }]
}));

// Mock do getUserMedia
Object.defineProperty(window.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockImplementation(() =>
      Promise.resolve(new window.MediaStream())
    )
  }
}); 