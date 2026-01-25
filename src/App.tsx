import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import Welcome from './components/Welcome';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EditProfile from './components/auth/EditProfile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ItemList from './components/items/ItemList';
import ItemDetail from './components/items/ItemDetail';
import ItemForm from './components/items/ItemForm';
import UserList from './components/users/UserList';
import UserDetail from './components/users/UserDetail';
import Dashboard from './components/reports/Dashboard';
import ValuationReport from './components/reports/ValuationReport';
import MovementReport from './components/reports/MovementReport';
import CustomReport from './components/reports/CustomReport';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AlertProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Welcome />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <EditProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="items"
                  element={
                    <ProtectedRoute>
                      <ItemList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="items/new"
                  element={
                    <ProtectedRoute>
                      <ItemForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="items/:id"
                  element={
                    <ProtectedRoute>
                      <ItemDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="items/:id/edit"
                  element={
                    <ProtectedRoute>
                      <ItemForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute requireAdmin>
                      <UserList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users/:id"
                  element={
                    <ProtectedRoute>
                      <UserDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports/valuation"
                  element={
                    <ProtectedRoute>
                      <ValuationReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports/movement"
                  element={
                    <ProtectedRoute>
                      <MovementReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports/custom"
                  element={
                    <ProtectedRoute>
                      <CustomReport />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </AlertProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
