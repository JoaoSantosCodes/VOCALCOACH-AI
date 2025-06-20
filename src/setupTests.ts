// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Polyfills necessários
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock do requestAnimationFrame e cancelAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock do matchMedia
global.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// Mock completo do AudioContext
class AnalyserNode {
  constructor() {
    this.frequencyBinCount = 1024;
    this.fftSize = 2048;
  }

  connect() {}
  disconnect() {}
  getByteFrequencyData(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  getFloatTimeDomainData(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = (Math.random() * 2) - 1;
    }
  }
}

class AudioContextMock {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.destination = {};
  }

  createAnalyser() {
    return new AnalyserNode();
  }

  createMediaStreamSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }

  close() {
    this.state = 'closed';
  }
}

global.AudioContext = AudioContextMock;
global.webkitAudioContext = AudioContextMock;

// Mock do MediaRecorder
class MediaRecorderMock {
  constructor() {
    this.state = 'inactive';
    this.ondataavailable = null;
    this.onerror = null;
    this.onstart = null;
    this.onstop = null;
  }

  start() {
    this.state = 'recording';
    if (this.onstart) this.onstart();
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
    if (this.ondataavailable) {
      this.ondataavailable(new Event('dataavailable'));
    }
  }
}

global.MediaRecorder = MediaRecorderMock;

// Mock do MediaStream
class MediaStreamMock {
  constructor() {
    this.active = true;
    this.tracks = [
      {
        kind: 'audio',
        enabled: true,
        stop: jest.fn(),
      },
    ];
  }

  getTracks() {
    return this.tracks;
  }

  getAudioTracks() {
    return this.tracks.filter(track => track.kind === 'audio');
  }
}

global.MediaStream = MediaStreamMock;

// Mock do navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockImplementation(() => Promise.resolve(new MediaStreamMock())),
    enumerateDevices: jest.fn().mockImplementation(() => Promise.resolve([])),
  },
  writable: true,
});

// Mock @react-spring/web
jest.mock('@react-spring/web', () => {
  const React = require('react');
  return {
    useSpring: () => ({ opacity: 1, transform: 'translate3d(0,0px,0)', y: 0, rotate: 0 }),
    animated: {
      div: ({ children, style, ...props }) => React.createElement('div', { 'data-testid': 'animated-div', style, ...props }, children),
    },
    useTransition: (item) => {
      const transitions = [(style, i) => (
        React.createElement('div', { 'data-testid': 'animated-div', style }, i)
      )];
      transitions.map = (fn) => [fn({ opacity: 1, transform: 'translate3d(0,0px,0)' }, item)];
      return transitions;
    },
    config: {
      default: {},
      gentle: {},
      wobbly: {},
      stiff: {},
      slow: {},
      molasses: {},
    },
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
}); 