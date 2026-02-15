import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, Plus, User } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show layout on public invitation pages
  if (location.pathname.startsWith('/invitation/')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-serif font-bold shadow-sm group-hover:bg-indigo-700 transition-colors">
                  UD
                </div>
                <span className="text-lg sm:text-xl font-serif font-bold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                  Undangan<span className="hidden sm:inline"> Digital</span>
                </span>
              </Link>
            </div>

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-100 shadow-sm">
                  <div className="bg-indigo-100 p-1 rounded-full mr-0 sm:mr-2">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span className="hidden sm:inline max-w-[150px] truncate" title={user.email}>{user.email}</span>
                </div>

                <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 group"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden md:inline text-sm font-medium">Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};