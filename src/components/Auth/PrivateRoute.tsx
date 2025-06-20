import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();
  
  // Verificar se existe um token no localStorage
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    // Redirecionar para a página inicial com o state para saber de onde veio
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 