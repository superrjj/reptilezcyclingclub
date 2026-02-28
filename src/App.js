import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './UserManagement/Home/Header.jsx';
import HomePage from './UserManagement/Home/HomePage.jsx';
import ViewPost from './UserManagement/Posts/ViewPost.jsx';
import LoginDialog from './components/common/LoginDialog.jsx';
import Dashboard from './components/AdminManagement/dashboard/Dashboard.jsx';
import Posts from './components/AdminManagement/posts/Posts.jsx';
import AdminEvents from './components/AdminManagement/events/Events.jsx';
import AdminMembers from './components/AdminManagement/members/Members.jsx';
import FileMaintenance from './components/AdminManagement/fileMaintenance/FileMaintenance.jsx';
import MaintenanceScreen from './components/common/MaintenanceScreen.jsx';

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
const MainLayout = ({ children, onLongPressTitle, loginOpen, setLoginOpen }) => {
  const [showGreeting, setShowGreeting] = useState(true);
  const headerOffset = showGreeting ? 40 : 0;

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-reptilez-white-50 via-reptilez-white-100 to-reptilez-green-50"
      style={{
        backgroundAttachment: 'fixed',
      }}
    >
      {showGreeting && (
        <div className="fixed inset-x-0 top-0 z-[60] bg-[#FEF3C7] border-b border-[#FACC15] text-[#92400E]">
          <div className="mx-auto flex w-full items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-2 text-xs sm:text-sm">
            <span className="font-medium tracking-wide">
              Welcome to Reptilez Cycling Club
            </span>
            <button
              type="button"
              onClick={() => setShowGreeting(false)}
              className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#FACC15] bg-[#FEF3C7] text-[#92400E] hover:bg-[#FACC15] hover:text-[#78350F] transition-colors"
              aria-label="Close welcome message"
            >
              <span className="material-symbols-outlined text-base leading-none">
                close
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="layout-container flex h-full grow flex-col">
        <div className="w-full flex flex-1 justify-center">
          <div
            className="layout-content-container flex flex-col w-full flex-1"
            style={{ paddingTop: `calc(6rem + ${headerOffset}px)` }}
          >
            <Header onLongPressTitle={onLongPressTitle} offsetTop={headerOffset} />
            {children}
          </div>
        </div>
      </div>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  // TEMPORARY: Set to false to disable maintenance screen
  const MAINTENANCE_MODE = false;

  return (
    <AuthProvider>
      {MAINTENANCE_MODE && <MaintenanceScreen />}
      {!MAINTENANCE_MODE && (
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
                  onLongPressTitle={() => setLoginOpen(true)}
                  loginOpen={loginOpen}
                  setLoginOpen={setLoginOpen}
                >
                  <HomePage />
                </MainLayout>
              }
            />
            {/* Single Post View Route */}
            <Route
              path="/posts/:postId"
              element={
                <MainLayout
                  onLongPressTitle={() => setLoginOpen(true)}
                  loginOpen={loginOpen}
                  setLoginOpen={setLoginOpen}
                >
                  <ViewPost singleView={true} />
                </MainLayout>
              }
            />
          </Routes>
        </Router>
      )}
    </AuthProvider>
  );
}

export default App;
