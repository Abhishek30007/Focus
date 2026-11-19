import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Home, 
  Brain, 
  Sparkles, 
  LineChart, 
  Settings, 
  LogOut, 
  Bell, 
  User,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch unread notifications count
  const fetchNotificationsCount = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        const unread = res.data.data.filter(n => !n.read).length;
        setUnreadNotifications(unread);
      }
    } catch (err) {
      console.error('Failed to load notifications count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotificationsCount();
      const interval = setInterval(fetchNotificationsCount, 45000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Sessions', path: '/sessions', icon: Brain },
    { name: 'AI Coach', path: '/ai', icon: Sparkles },
    { name: 'Analytics', path: '/progress', icon: LineChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-forest-950 text-slate-100 overflow-x-hidden">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-forest-900 border-r border-slate-800/40 p-5 shrink-0 justify-between">
        <div>
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 mb-8 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-limeAccent-400 to-forest-500 flex items-center justify-center shadow-lg shadow-limeAccent-400/20">
              <Brain className="w-5 h-5 text-forest-950" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-limeAccent-400 bg-clip-text text-transparent">FocusFlow</span>
              <span className="block text-[9px] uppercase font-semibold text-limeAccent-400 tracking-widest -mt-1">Varanasi Concept</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                      isActive 
                        ? 'bg-gradient-to-r from-forest-800 to-forest-800/40 text-limeAccent-400 border-l-4 border-limeAccent-400 shadow-md shadow-limeAccent-400/5' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-forest-800/30'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-800/40 pt-4 space-y-3">
          <Link to="/settings" className="flex items-center gap-3 p-2 rounded-xl hover:bg-forest-800/20 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-forest-800 border border-slate-700/50 flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-limeAccent-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'Practitioner'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </Link>
          
          <button 
            onClick={handleLogout}
            id="desktop-logout-button"
            className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION */}
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-forest-900/90 border-b border-slate-800/30 sticky top-0 z-40 backdrop-blur-md">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-limeAccent-400 to-forest-500 flex items-center justify-center shadow-md">
            <Brain className="w-4.5 h-4.5 text-forest-950" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">FocusFlow</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <Link to="/settings" className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
            <Bell className="w-5.5 h-5.5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-limeAccent-400 text-forest-950 text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </Link>
          
          {/* Mobile Profile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Dropdown (Profile Info + Logout) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[61px] bg-forest-950/95 backdrop-blur-lg z-30 p-5 flex flex-col justify-between border-t border-slate-800/30 animate-fade-in">
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-forest-900/40 p-4 rounded-2xl border border-slate-850">
              <div className="w-12 h-12 rounded-full bg-forest-800 flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-limeAccent-400" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-200">{user?.name}</h4>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-lg transition-colors ${
                      location.pathname === item.path 
                        ? 'bg-forest-800 text-limeAccent-400' 
                        : 'text-slate-400 hover:text-slate-250'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            id="mobile-logout-button"
            className="flex items-center justify-center gap-3 w-full bg-red-950/30 text-red-400 py-3.5 rounded-xl font-bold border border-red-900/30 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-forest-900/95 border-t border-slate-800/35 flex justify-around items-center px-4 z-40 backdrop-blur-md pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-14 h-full relative transition-colors ${
                isActive ? 'text-limeAccent-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-1 truncate">{item.name}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-limeAccent-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. MAIN PAGE CONTAINER */}
      <main className="flex-1 p-5 md:p-8 pb-24 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
