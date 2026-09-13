import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout, BuyerLayout } from './components/layout/Layout';
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { CropsPage } from './pages/Crops/CropsPage';
import { MarketPage } from './pages/Market/MarketPage';
import { BuyersPage } from './pages/Buyers/BuyersPage';
import { RecommendationPage } from './pages/Recommendation/RecommendationPage';
import { DealsPage } from './pages/Deals/DealsPage';
import { BuyerDashboardPage } from './pages/buyer/BuyerDashboardPage';
import { RequirementsPage } from './pages/buyer/RequirementsPage';
import { OrdersPage } from './pages/buyer/OrdersPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          color: '#18362e',
          fontFamily: 'Work Sans, sans-serif',
          background: '#fcfcf8',
        }}
      >
        <p>Loading HaatLink session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicAuthRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === 'buyer' ? '/buyer/dashboard' : '/dashboard'}
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicAuthRoute>
                    <LoginPage />
                  </PublicAuthRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/crops" element={<CropsPage />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/buyers" element={<BuyersPage />} />
                <Route
                  path="/recommendation"
                  element={<RecommendationPage />}
                />
                <Route path="/deals" element={<DealsPage />} />
              </Route>
              <Route
                path="/buyer"
                element={
                  <ProtectedRoute>
                    <BuyerLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<BuyerDashboardPage />} />
                <Route path="requirements" element={<RequirementsPage />} />
                <Route path="orders" element={<OrdersPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
