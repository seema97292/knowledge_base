import { useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./components/auth/ForgotPassword";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import RegistrationSuccess from "./components/auth/RegistrationSuccess";
import ResendVerification from "./components/auth/ResendVerification";
import VerifyEmail from "./components/auth/VerifyEmail";
import DocumentEditor from "./components/documents/DocumentEditor";
import DocumentList from "./components/documents/DocumentList";
import DocumentView from "./components/documents/DocumentView";
import DocumentVersions from "./components/documents/DocumentVersions";
import DocumentVersionView from "./components/documents/DocumentVersionView";
import DocumentVersionCompare from "./components/documents/DocumentVersionCompare";
import ShareDocument from "./components/documents/ShareDocument";
import Header from "./components/layout/Header";
import { AuthProvider, useAuth } from "./hooks/useAuth";

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
        <Route
          path="/registration-success"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <RegistrationSuccess />
            )
          }
        />
        <Route
          path="/verify-email/:token"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <VerifyEmail />
          }
        />
        <Route
          path="/resend-verification"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <ResendVerification />
            )
          }
        />

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
            <>
              <Header onSearch={handleSearch} />
              <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <DocumentView />
              </main>
            </>
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

        <Route
          path="/documents/:id/share"
          element={
            <ProtectedRoute>
              <Header onSearch={handleSearch} />
              <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <ShareDocument />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/:id/versions"
          element={
            <ProtectedRoute>
              <Header onSearch={handleSearch} />
              <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <DocumentVersions />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/:id/versions/:versionId"
          element={
            <ProtectedRoute>
              <Header onSearch={handleSearch} />
              <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <DocumentVersionView />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/:id/versions/:versionId/compare"
          element={
            <ProtectedRoute>
              <Header onSearch={handleSearch} />
              <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <DocumentVersionCompare />
              </main>
            </ProtectedRoute>
          }
        />

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
