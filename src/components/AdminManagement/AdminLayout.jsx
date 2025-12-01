import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-dark text-white">
      <div className="flex h-screen">
        {/* SideNavBar */}
        <aside className="w-64 flex-shrink-0 bg-background-dark border-r border-primary/30 h-full overflow-y-auto">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-center px-3 py-2">
                <img
                  src="/rcc2.png"
                  alt="Reptilez Cycling Club logo"
                  className="size-10 rounded-full object-contain"
                />
                <div className="flex flex-col">
                  <h1 className="text-white text-base font-medium leading-normal">Reptilez CC</h1>
                  <p className="text-primary/70 text-sm font-normal leading-normal">Admin Panel</p>
                </div>
              </div>
              
              <nav className="flex flex-col gap-2 mt-4">
                <a 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/admin') 
                      ? 'bg-primary/20 text-white' 
                      : 'text-white hover:bg-white/5'
                  }`}
                  href="/admin"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin'); 
                  }}
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <p className="text-sm font-medium leading-normal">Dashboard</p>
                </a>
                <a 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/admin/posts') 
                      ? 'bg-primary/20 text-white' 
                      : 'text-white hover:bg-white/5'
                  }`}
                  href="/admin/posts"
                  onClick={(e) => { e.preventDefault(); navigate('/admin/posts'); }}
                >
                  <span className="material-symbols-outlined" style={isActive('/admin/posts') ? { fontVariationSettings: "'FILL' 1" } : {}}>article</span>
                  <p className="text-sm font-medium leading-normal">Posts</p>
                </a>
                <a 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/5 transition-colors" 
                  href="/admin/events"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin/events'); 
                  }}
                >
                  <span className="material-symbols-outlined">event</span>
                  <p className="text-sm font-medium leading-normal">Events</p>
                </a>
                <a 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/5 transition-colors" 
                  href="/admin/members"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate('/admin/members'); 
                  }}
                >
                  <span className="material-symbols-outlined">group</span>
                  <p className="text-sm font-medium leading-normal">Members</p>
                </a>
              </nav>
            </div>
            
            <div className="flex flex-col gap-1">
              <a 
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/5 transition-colors" 
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                <span className="material-symbols-outlined">settings</span>
                <p className="text-sm font-medium leading-normal">Settings</p>
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/5 transition-colors text-left w-full"
              >
                <span className="material-symbols-outlined">logout</span>
                <p className="text-sm font-medium leading-normal">Logout</p>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;

