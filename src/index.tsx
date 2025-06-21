import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initMonitoring, metrics } from './config/monitoring.config';

// Inicializa o monitoramento em produção e beta
initMonitoring();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Reporta Web Vitals para monitoramento
reportWebVitals(metrics.trackWebVitals); 