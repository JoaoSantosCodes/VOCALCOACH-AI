import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { PrivateRoute } from '@components/Auth/PrivateRoute';

// Lazy loaded components
const Home = React.lazy(() => import('@/pages/Home'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Practice = React.lazy(() => import('@/pages/Practice'));
const Karaoke = React.lazy(() => import('@/pages/Karaoke'));

// Loading fallback component
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="background.default"
  >
    <CircularProgress />
  </Box>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <PrivateRoute>
              <Practice />
            </PrivateRoute>
          }
        />
        <Route
          path="/karaoke"
          element={
            <PrivateRoute>
              <Karaoke />
            </PrivateRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}; 