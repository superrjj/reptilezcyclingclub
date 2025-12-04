import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onLoginClick }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [maintenanceVisible, setMaintenanceVisible] = useState(false);

  useEffect(() => {
    setIsAdmin(!!(user && user.isAdmin));
  }, [user]);

  useEffect(() => {
    if (!maintenanceVisible) return;
    const timer = setTimeout(() => setMaintenanceVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [maintenanceVisible]);

  const handleLogout = async () => {
    await signOut();
    setIsAdmin(false);
    window.location.reload();
  };

  const handleMaintenanceClick = () => {
    setMaintenanceVisible(true);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-solid border-primary/30 bg-background-dark/95 backdrop-blur">
      {maintenanceVisible && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl border border-primary/50 bg-black/90 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          Under Maintenance (Hindi pa po tapos) by Dev Harvee
        </div>
      )}
      <div className="mx-auto flex max-w-[960px] items-center justify-between whitespace-nowrap px-4 py-4 sm:px-10">
        <Link to="/" className="flex items-center gap-4 text-white">
          <img
            src="/rcc1.png"
            alt="Reptilez Cycling Club logo"
            className="h-8 w-8 rounded-full object-contain"
          />
          <img
            src="/rcc2.png"
            alt="Reptilez Cycling Club logo"
            className="h-8 w-8 rounded-full object-contain"
          />
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Reptilez Cycling Club</h2>
        </Link>
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <Link to="/" className={`text-sm font-medium leading-normal transition-colors ${
              location.pathname === '/' ? 'text-primary' : 'text-white hover:text-primary'
            }`}>
              Home
            </Link>
            <Link
              to="/posts"
              className={`text-sm font-medium leading-normal transition-colors ${
                location.pathname === '/posts' ? 'text-primary' : 'text-white hover:text-primary'
              }`}
            >
              Posts
            </Link>
            <button
              type="button"
              onClick={handleMaintenanceClick}
              className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Events
            </button>
            <Link to="/members" className={`text-sm font-medium leading-normal transition-colors ${
              location.pathname === '/members' ? 'text-primary' : 'text-white hover:text-primary'
            }`}>
              Members
            </Link>
            <button
              type="button"
              onClick={handleMaintenanceClick}
              className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              About Us
            </button>
          </div>
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <span className="text-primary text-sm font-medium">Admin</span>
              <button
                onClick={handleLogout}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-600 transition-colors"
              >
                <span className="truncate">LOGOUT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-700 transition-colors"
            >
              <span className="truncate">LOGIN</span>
            </button>
          )}
        </div>
        <div className="md:hidden">
          <button className="text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

