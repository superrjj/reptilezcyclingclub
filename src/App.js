import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './UserManagement/Home/Header.jsx';
import HomePage from './UserManagement/Home/HomePage.jsx';
import MembersPage from './UserManagement/Members/MembersPage.jsx';
import ViewPost from './UserManagement/Posts/ViewPost.jsx';
import EventsPage from './UserManagement/Events/EventsPage.jsx';
import AboutUsPage from './UserManagement/AboutUs/AboutUsPage.jsx';
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
const MainLayout = ({ children, onLoginClick, loginOpen, setLoginOpen }) => {
  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-reptilez-white-50 via-reptilez-white-100 to-reptilez-green-50"
      style={{
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="w-full flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col w-full flex-1 pt-24">
            <Header onLoginClick={onLoginClick} />
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
                  onLoginClick={() => setLoginOpen(true)}
                  loginOpen={loginOpen}
                  setLoginOpen={setLoginOpen}
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
                >
                  <ViewPost />
                </MainLayout>
              }
            />
            {/* Single Post View Route */}
            <Route
              path="/posts/:postId"
              element={
                <MainLayout
                  onLoginClick={() => setLoginOpen(true)}
                  loginOpen={loginOpen}
                  setLoginOpen={setLoginOpen}
                >
                  <ViewPost singleView={true} />
                </MainLayout>
              }
            />
            <Route
              path="/events"
              element={
                <MainLayout
                  onLoginClick={() => setLoginOpen(true)}
                  loginOpen={loginOpen}
                  setLoginOpen={setLoginOpen}
                >
                  <EventsPage />
                </MainLayout>
              }
            />
            <Route
              path="/about-us"
              element={
                <MainLayout
                  onLoginClick={() => setLoginOpen(true)}
                  loginOpen={loginOpen}
                  setLoginOpen={setLoginOpen}
                >
                  <AboutUsPage />
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