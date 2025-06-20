import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Karaoke from './pages/Karaoke';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/Auth/PrivateRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { 
        path: "/", 
        element: <Home /> 
      },
      { 
        path: "/dashboard", 
        element: <PrivateRoute><Dashboard /></PrivateRoute> 
      },
      { 
        path: "/practice", 
        element: <PrivateRoute><Practice /></PrivateRoute> 
      },
      { 
        path: "/karaoke", 
        element: <PrivateRoute><Karaoke /></PrivateRoute> 
      }
    ]
  }
]);

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <RouterProvider router={router} />
    </>
  );
};

export default App; 