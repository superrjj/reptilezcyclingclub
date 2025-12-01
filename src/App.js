import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './UserManagement/Home/Header.jsx';
import HomePage from './UserManagement/Home/HomePage.jsx';
import MembersPage from './UserManagement/Members/MembersPage.jsx';
import ViewPost from './UserManagement/Posts/ViewPost.jsx';
import LoginDialog from './components/common/LoginDialog.jsx';
import Dashboard from './components/AdminManagement/dashboard/Dashboard.jsx';
import Posts from './components/AdminManagement/posts/Posts.jsx';

// Protected route for admin dashboard
const ProtectedAdminRoute = () => {
  const { user, loading } = useAuth();
  const isAdmin = localStorage.getItem('adminLoggedIn') === 'true' || (user && (user.isAdmin || user.email === 'admin@reptilez.com'));

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Dashboard />;
};

// Protected route for admin posts
const ProtectedPostsRoute = () => {
  const { user, loading } = useAuth();
  const isAdmin = localStorage.getItem('adminLoggedIn') === 'true' || (user && (user.isAdmin || user.email === 'admin@reptilez.com'));

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Posts />;
};

// Main layout wrapper for public pages
const MainLayout = ({ children, onLoginClick, loginOpen, setLoginOpen }) => {
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

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<ProtectedAdminRoute />} />
          <Route path="/admin/posts" element={<ProtectedPostsRoute />} />
          <Route path="/" element={
            <MainLayout onLoginClick={() => setLoginOpen(true)} loginOpen={loginOpen} setLoginOpen={setLoginOpen}>
              <HomePage />
            </MainLayout>
          } />
          <Route path="/members" element={
            <MainLayout onLoginClick={() => setLoginOpen(true)} loginOpen={loginOpen} setLoginOpen={setLoginOpen}>
              <MembersPage onLoginClick={() => setLoginOpen(true)} />
            </MainLayout>
          } />
          <Route path="/posts" element={
            <MainLayout onLoginClick={() => setLoginOpen(true)} loginOpen={loginOpen} setLoginOpen={setLoginOpen}>
              <ViewPost />
            </MainLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
