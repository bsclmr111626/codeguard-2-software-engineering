import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  ArrowRight,
  Info,
  X,
  Lock,
} from 'lucide-react';
import { Scenario, SdlcStage, RiskLevel, UserAccount } from '../../types';
import { SDLC_STAGES } from '../../data/mockData';

interface ScenarioManagementProps {
  scenarios: Scenario[];
  currentUser: UserAccount;
  onAddScenario: (scenario: Scenario) => void;
  onDeleteScenario: (id: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const ScenarioManagement: React.FC<ScenarioManagementProps> = ({
  scenarios,
  currentUser,
  onAddScenario,
  onDeleteScenario,
  onShowToast,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEntryPoint, setNewEntryPoint] = useState<SdlcStage>('IDE');
  const [newSeverity, setNewSeverity] = useState<RiskLevel>('High');
  const [newAttackVector, setNewAttackVector] = useState('');
  const [newRealWorld, setNewRealWorld] = useState('');
  const [newCwe, setNewCwe] = useState('CWE-506: Embedded Malicious Code');

  const isAdmin = currentUser.role === 'Administrator';

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDesc) return;

    // determine propagation from entry point forward
    const entryIdx = SDLC_STAGES.indexOf(newEntryPoint);
    const propagationPath = SDLC_STAGES.slice(entryIdx);

    const baseRisks: Record<SdlcStage, number> = {
      'IDE': 20,
      'Version Control': 20,
      'CI/CD': 20,
      'Software Registry': 20,
      'Production': 20,
    };
    propagationPath.forEach((st) => {
      baseRisks[st] = newSeverity === 'Critical' ? 90 : newSeverity === 'High' ? 75 : 50;
    });

    const created: Scenario = {
      id: `sc-${Date.now()}`,
      name: newName,
      description: newDesc,
      entryPointStage: newEntryPoint,
      baseSeverity: newSeverity,
      propagationPath,
      attackVector: newAttackVector || 'Custom simulated attack vector defined by administrator.',
      realWorldExample: newRealWorld || 'Custom Enterprise Threat Modeling',
      cweMapping: newCwe,
      stageBaseRisks: baseRisks,
    };

    onAddScenario(created);
    setShowAddModal(false);
    setNewName('');
    setNewDesc('');
    setNewAttackVector('');
    setNewRealWorld('');
    onShowToast('Threat Scenario Added', `Created new scenario "${created.name}".`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Threat Scenario Catalog & Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Predefined and Custom Attack Paths traversing the 5 SDLC Stages
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Scenario</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin privileges required to edit scenarios</span>
          </div>
        )}
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400">
                    Entry: {sc.entryPointStage}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{sc.name}</h3>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                    sc.baseSeverity === 'Critical'
                      ? 'text-red-400 bg-red-950/80 border-red-800/80'
                      : 'text-amber-300 bg-amber-950/80 border-amber-800/80'
                  }`}
                >
                  {sc.baseSeverity}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{sc.description}</p>
            </div>

            {/* Propagation Chain */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-mono text-slate-400">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">
                  Attack Propagation Pathway:
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {sc.propagationPath.map((stage, i) => (
                    <React.Fragment key={stage}>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px]">
                        {stage}
                      </span>
                      {i < sc.propagationPath.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-red-500 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                <div>
                  <strong className="text-slate-300">Case Study:</strong> {sc.realWorldExample}
                </div>
                <div className="truncate">
                  <strong className="text-slate-300">CWE:</strong> {sc.cweMapping}
                </div>
              </div>

              {isAdmin && sc.id.startsWith('sc-') && parseInt(sc.id.split('-')[1]) > 10 && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onDeleteScenario(sc.id);
                      onShowToast('Scenario Deleted', `Removed ${sc.name}.`, 'warning');
                    }}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Scenario Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white">Create Custom Attack Scenario</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Scenario Title</label>
                <input
                  type="text"
                  placeholder="e.g. Build Artifact Ransomware Injection"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Attack Entry Point Stage</label>
                <select
                  value={newEntryPoint}
                  onChange={(e) => setNewEntryPoint(e.target.value as SdlcStage)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500 font-mono"
                >
                  {SDLC_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Base Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as RiskLevel)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="Critical">Critical (High propagation rate)</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Scenario Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain how attacker gains access and moves downstream..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Real-World Case Study / Example</label>
                <input
                  type="text"
                  placeholder="e.g. SolarWinds / Target HVAC Vendor Breach"
                  value={newRealWorld}
                  onChange={(e) => setNewRealWorld(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm"
                >
                  Save Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
