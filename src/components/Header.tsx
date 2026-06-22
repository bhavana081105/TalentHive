import React, { useState } from 'react';
import { User, LogIn, Settings, LogOut, Shield, Briefcase, HelpCircle, Search } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  onNavigate: (view: string) => void;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentView: string;
  supabaseConnected?: boolean;
  supabaseChecking?: boolean;
}

export default function Header({
  currentUser,
  onLogout,
  onOpenLogin,
  onNavigate,
  onOpenSettings,
  searchQuery,
  onSearchChange,
  currentView,
  supabaseConnected = false,
  supabaseChecking = false,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Top-Left Logo & Status Badge Group */}
        <div className="flex items-center gap-2 md:gap-3">
          <div 
            id="logo-container"
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => {
              onSearchChange('');
              onNavigate('home');
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-250 transition-all group-hover:scale-105">
              <span className="font-bold text-lg tracking-tight">H</span>
            </div>
            <div className="hidden xs:block">
              <span className="text-lg font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent opacity-90">
                Talent Hive
              </span>
              <span className="block text-[8px] text-slate-400 font-bold tracking-wider uppercase">
                Community Service Guild
              </span>
            </div>
          </div>

          {/* Database Connection Info Pill */}
          <div 
            className="flex items-center gap-1.5 border border-slate-150 bg-slate-50 rounded-full px-2.5 py-0.5 shadow-3xs" 
            title={supabaseConnected ? "Successfully connected to Supabase Live Database." : "Using offline replication. Create and configure tables in Supabase to sync automatically."}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${supabaseChecking ? 'bg-amber-400 animate-pulse' : (supabaseConnected ? 'bg-emerald-500' : 'bg-red-400')}`} />
            <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-tight hidden sm:inline-block">
              {supabaseChecking ? 'Verifying...' : (supabaseConnected ? 'Database Connected' : 'Local Sandbox')}
            </span>
            <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-tight sm:hidden">
              {supabaseChecking ? 'Verifying' : (supabaseConnected ? 'Connected' : 'Local')}
            </span>
          </div>
        </div>

        {/* Center Navigation Bar (Home, About, and Search Bar) */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center max-w-xl mx-2">
          <div className="flex gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={() => {
                onSearchChange('');
                onNavigate('home');
              }}
              className={`px-2 md:px-3.5 py-1.5 text-xs md:text-sm font-semibold rounded-xl transition-all ${
                currentView === 'home'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-550 hover:text-slate-905 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('about');
              }}
              className={`px-2 md:px-3.5 py-1.5 text-xs md:text-sm font-semibold rounded-xl transition-all ${
                currentView === 'about'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-550 hover:text-slate-905 hover:bg-slate-50'
              }`}
            >
              About
            </button>
          </div>

          {/* Compact Integrated Search Bar */}
          <div className="relative flex-1 min-w-[120px] max-w-xs">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'search') {
                  onNavigate('search');
                }
              }}
              onFocus={() => {
                if (currentView !== 'search') {
                  onNavigate('search');
                }
              }}
              placeholder="Search specialists..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Top-Right: Profile cluster (with Settings beside it) */}
        <div className="flex items-center gap-2 shrink-0 relative">
          {currentUser ? (
            <div className="flex items-center gap-2">
              
              {/* Profile icon labeled 'My Profile' */}
              <button
                id="header-my-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-150 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full object-cover border border-slate-100"
                  referrerPolicy="no-referrer"
                />
                <span className="hidden leading-none md:inline">My Profile</span>
                <span className="md:hidden">Profile</span>
              </button>

              {/* Profile Settings Beside Profile Icon */}
              <button
                id="header-settings-btn"
                onClick={onOpenSettings}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-150 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer"
                title="Account Settings"
              >
                <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-xl border border-slate-100 shadow-xl py-2 z-50 animate-in fade-in-50 slide-in-from-top-3 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 text-slate-705">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        const targetView = currentUser.role === 'Admin' ? 'admin-dashboard' : (currentUser.role === 'Worker' ? 'dashboard' : 'my-bookings');
                        onNavigate(targetView);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 hover:text-slate-900 transition-colors"
                    >
                      {currentUser.role === 'Admin' ? (
                        <>
                          <Shield className="w-4 h-4 text-purple-600" />
                          <span>Admin Control Console</span>
                        </>
                      ) : currentUser.role === 'Worker' ? (
                        <>
                          <Briefcase className="w-4 h-4 text-blue-550" />
                          <span>Worker Dashboard</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 text-indigo-550" />
                          <span>My Appointments & Bookings</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onOpenSettings();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 hover:text-slate-900 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-450" />
                      <span>Edit Name & Profile Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('about');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 hover:text-slate-900 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-450" />
                      <span>About Vision Story</span>
                    </button>

                    <div className="border-t border-slate-50 my-1" />

                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}

            </div>
          ) : (
            <div className="flex items-center gap-2">
              
              {/* Guest Profile icon labeled 'My Profile' */}
              <button
                id="header-guest-profile-btn"
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-150 bg-white hover:bg-slate-50 text-slate-705 text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer"
              >
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400" />
                <span>My Profile</span>
              </button>

              {/* Guest Settings Beside Profile Icon */}
              <button
                id="header-guest-settings-btn"
                onClick={onOpenLogin}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-150 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-805 transition-colors focus:outline-none cursor-pointer"
                title="Sign in to customize"
              >
                <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}
