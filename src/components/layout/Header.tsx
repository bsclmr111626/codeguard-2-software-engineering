import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  UploadCloud,
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';

interface HeaderProps {
  activeTab: string;
  currentUser: UserAccount;
  onOpenCommandPalette: () => void;
  onNavigate: (tab: string) => void;
  onSelectUserRole: (role: UserRole) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  onOpenCommandPalette,
  onNavigate,
  onSelectUserRole,
  onLogout,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'scanner':
        return 'Project Upload & 5-Stage Security Scanner';
      case 'simulator':
        return '5-Stage Attack Propagation Simulator';
      case 'history':
        return 'Simulation History & Evidence Log';
      case 'scenarios':
        return 'Threat Scenario Catalog';
      case 'mitigations':
        return 'Preventive Controls & Mitigations';
      case 'audit':
        return 'System Audit Trail (Admin)';
      case 'users':
        return 'User & Role-Based Access Control';
      default:
        return 'Supply Chain Security';
    }
  };

  const roles: UserRole[] = ['Administrator', 'Learner / Analyst', 'Guest'];

  return (
    <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-6">
      {/* Zone 1: Breadcrumbs Trail */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          CodeGuard
        </span>
        <span className="text-slate-600 font-normal">/</span>
        <h1 className="text-sm font-medium text-slate-200 truncate">
          {getBreadcrumbTitle()}
        </h1>
      </div>

      {/* Zone 2: Actions & Persona Quick Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Search affordance (Cmd+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors text-xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Primary Action Button: Upload & Scan */}
        <button
          onClick={() => onNavigate('scanner')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Scan Project</span>
        </button>

        {/* User Account / Persona Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/40 transition-colors"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-sky-950 border border-sky-600 flex items-center justify-center text-xs font-bold text-sky-300">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="hidden lg:flex flex-col text-left text-xs leading-tight pr-1">
              <span className="font-semibold text-slate-200 whitespace-nowrap">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-sky-400 font-mono">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-40 text-xs">
              <div className="px-3 py-2 border-b border-slate-800/80 mb-2">
                <p className="font-semibold text-white">{currentUser.name}</p>
                <p className="text-slate-400 font-mono text-[11px] truncate">{currentUser.email}</p>
                <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {currentUser.department}
                </div>
              </div>

              {/* Persona Switcher for Quick Review */}
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Switch Role Mode
              </div>
              <div className="space-y-0.5 my-1">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onSelectUserRole(r);
                      setProfileOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                      currentUser.role === r
                        ? 'bg-sky-950/60 text-sky-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{r}</span>
                    {currentUser.role === r && (
                      <span className="text-[10px] text-sky-400 font-mono">Active</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-800/80 pt-1 mt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('users');
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Users & Access</span>
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-red-400 hover:bg-red-950/40 hover:text-red-300 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
