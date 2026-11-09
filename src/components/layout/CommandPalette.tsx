import React, { useState, useEffect } from 'react';
import { Search, Play, History, ShieldAlert, ShieldCheck, Users, FileText, X } from 'lucide-react';
import { Scenario, MitigationControl, SimulationRecord } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  scenarios: Scenario[];
  mitigations: MitigationControl[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  scenarios,
  mitigations,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredScenarios = scenarios.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase()) ||
      s.entryPointStage.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredMitigations = mitigations.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.code.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const navigationItems = [
    { id: 'simulator', label: '5-Stage Attack Propagation Simulator', icon: Play },
    { id: 'history', label: 'Simulation History & Evidence Log', icon: History },
    { id: 'scenarios', label: 'Threat Scenario Catalog', icon: ShieldAlert },
    { id: 'mitigations', label: 'Preventive Controls & Mitigations', icon: ShieldCheck },
    { id: 'audit', label: 'System Audit Trail (Admin)', icon: FileText },
    { id: 'users', label: 'User & Role Management', icon: Users },
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search attack scenarios, preventive controls, or modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0"
          />
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-2 max-h-96 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Quick Action */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Quick Actions
            </div>
            <button
              onClick={() => {
                onNavigate('simulator');
                onClose();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-sky-400 fill-current" />
                <span className="font-medium">Open 5-Stage Attack Propagation Simulator</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Execute model</span>
            </button>
          </div>

          {/* Navigation */}
          {navigationItems.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Pages & Modules
              </div>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Scenarios */}
          {filteredScenarios.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Attack Scenarios
              </div>
              {filteredScenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    onNavigate('simulator');
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="truncate text-slate-200">{sc.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono ml-2 shrink-0">
                    Entry: {sc.entryPointStage}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Mitigations */}
          {filteredMitigations.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Preventive Controls
              </div>
              {filteredMitigations.map((ctrl) => (
                <button
                  key={ctrl.id}
                  onClick={() => {
                    onNavigate('mitigations');
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-sky-400 font-semibold">{ctrl.code}</span>
                    <span className="truncate text-slate-200">{ctrl.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono ml-2 shrink-0">
                    -{ctrl.riskReductionPct}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Use arrow keys or click to select</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
