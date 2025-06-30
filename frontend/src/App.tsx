import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/layout/Header";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import DocumentList from "./components/documents/DocumentList";
import DocumentView from "./components/documents/DocumentView";
import DocumentEditor from "./components/documents/DocumentEditor";
import "./App.css";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Header onSearch={handleSearch} />
              <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <DocumentList searchQuery={searchQuery} />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/new"
          element={
            <ProtectedRoute>
              <Header onSearch={handleSearch} />
              <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <DocumentEditor />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <Header onSearch={handleSearch} />
              <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <DocumentView />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/:id/edit"
          element={
            <ProtectedRoute>
              <Header onSearch={handleSearch} />
              <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <DocumentEditor />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
