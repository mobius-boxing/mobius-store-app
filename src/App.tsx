import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import './i18n/config';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Protected */}
              <Route
                path="/catalog"
                element={
                  <ProtectedRoute>
                    <Catalog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:uuid"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />

              {/* Default + catch-all → catalog (ProtectedRoute bounces to /login if needed) */}
              <Route path="/" element={<Navigate to="/catalog" replace />} />
              <Route path="*" element={<Navigate to="/catalog" replace />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
