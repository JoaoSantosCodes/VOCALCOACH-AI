import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import config from './config/monitoring.config';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Reporta Web Vitals para monitoramento, se configurado
if (config.metrics && typeof config.metrics === 'object') {
  reportWebVitals();
} 