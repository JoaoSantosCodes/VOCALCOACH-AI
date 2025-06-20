import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Theme
import { theme } from './utils/theme';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Karaoke from './pages/Karaoke';

// Components
import Layout from './components/Layout';

// Função de autenticação mock - deve ser substituída pela implementação real
const isAuthenticated = () => {
  return false; // Por enquanto, sempre retorna false
};

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/practice" 
              element={
                <PrivateRoute>
                  <Practice />
                </PrivateRoute>
              } 
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/karaoke" element={<Karaoke />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App; 