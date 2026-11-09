import React from 'react';
import {
  UploadCloud,
  Play,
  History,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Users2,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
} from 'lucide-react';
import { UserAccount } from '../../types';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  historyCount: number;
  scenariosCount: number;
  currentUser: UserAccount;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  collapsed,
  onToggleCollapse,
  historyCount,
  scenariosCount,
  currentUser,
  onLogout,
}) => {
  const isAdmin = currentUser.role === 'Administrator';

  const navItems = [
    {
      id: 'scanner',
      label: 'Upload & Scan Project',
      icon: UploadCloud,
      badge: 'Scanner',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'simulator',
      label: 'Attack Simulator',
      icon: Play,
      badge: '5 Stages',
      badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    },
    {
      id: 'history',
      label: 'Simulation History',
      icon: History,
      badge: `${historyCount} runs`,
      badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700/60',
    },
    {
      id: 'scenarios',
      label: 'Threat Scenarios',
      icon: ShieldAlert,
      badge: `${scenariosCount} vectors`,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
    },
    {
      id: 'mitigations',
      label: 'Preventive Controls',
      icon: ShieldCheck,
      badge: 'Defenses',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: FileText,
      badge: isAdmin ? 'Admin' : 'Restricted',
      badgeColor: isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users2,
      badge: null,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 select-none z-30 shrink-0 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Shield className="w-4 h-4 fill-sky-400/20" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-tight text-white font-sans truncate">
                CodeGuard
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 truncate">
                Supply Chain Security
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Shield className="w-5 h-5 fill-sky-400/20" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div
          className={`px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${
            collapsed ? 'text-center' : ''
          }`}
        >
          {collapsed ? '•••' : 'Core Workspace'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-sky-700 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Uncollapse button when collapsed */}
      {collapsed && (
        <div className="p-2 border-t border-slate-800/80 flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Info / Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Active Role
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {currentUser.role}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-sky-950 border border-sky-600 flex items-center justify-center text-xs font-bold text-sky-300 shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {currentUser.department}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
