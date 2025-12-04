import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './UserManagement/Home/Header.jsx';
import HomePage from './UserManagement/Home/HomePage.jsx';
import MembersPage from './UserManagement/Members/MembersPage.jsx';
import ViewPost from './UserManagement/Posts/ViewPost.jsx';
import LoginDialog from './components/common/LoginDialog.jsx';
import Dashboard from './components/AdminManagement/dashboard/Dashboard.jsx';
import Posts from './components/AdminManagement/posts/Posts.jsx';
import AdminEvents from './components/AdminManagement/events/Events.jsx';
import AdminMembers from './components/AdminManagement/members/Members.jsx';
import FileMaintenance from './components/AdminManagement/fileMaintenance/FileMaintenance.jsx';

// Generic protected route (any authenticated user)
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  // Require authenticated user (any Supabase auth user)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main layout wrapper for public pages
const MainLayout = ({
  children,
  onLoginClick,
  loginOpen,
  setLoginOpen,
  routeLoading,
  setRouteLoading,
}) => {
  const location = useLocation();

  useEffect(() => {
    if (!routeLoading) return;
    const timer = setTimeout(() => setRouteLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname, routeLoading, setRouteLoading]);

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden text-white"
      style={{
        backgroundImage:
          'linear-gradient(135deg, #020202 0%, #0a2b0a 35%, #0b0b0b 65%, #2b0000 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1 pt-24">
            <Header onLoginClick={onLoginClick} onRouteChangeStart={() => setRouteLoading(true)} />
            {children}
          </div>
        </div>
      </div>
      {routeLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Loading</p>
        </div>
      )}
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <RequireAuth>
                <Posts />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/events"
            element={
              <RequireAuth>
                <AdminEvents />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/members"
            element={
              <RequireAuth>
                <AdminMembers />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/file-maintenance"
            element={
              <RequireAuth>
                <FileMaintenance />
              </RequireAuth>
            }
          />
          <Route
            path="/"
            element={
              <MainLayout
                onLoginClick={() => setLoginOpen(true)}
                loginOpen={loginOpen}
                setLoginOpen={setLoginOpen}
                routeLoading={routeLoading}
                setRouteLoading={setRouteLoading}
              >
                <HomePage />
              </MainLayout>
            }
          />
          <Route
            path="/members"
            element={
              <MainLayout
                onLoginClick={() => setLoginOpen(true)}
                loginOpen={loginOpen}
                setLoginOpen={setLoginOpen}
                routeLoading={routeLoading}
                setRouteLoading={setRouteLoading}
              >
                <MembersPage />
              </MainLayout>
            }
          />
          <Route
            path="/posts"
            element={
              <MainLayout
                onLoginClick={() => setLoginOpen(true)}
                loginOpen={loginOpen}
                setLoginOpen={setLoginOpen}
                routeLoading={routeLoading}
                setRouteLoading={setRouteLoading}
              >
                <ViewPost />
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
