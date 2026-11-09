import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Lock,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { MitigationControl, SdlcStage, UserAccount } from '../../types';
import { SDLC_STAGES } from '../../data/mockData';

interface MitigationManagementProps {
  mitigations: MitigationControl[];
  currentUser: UserAccount;
  onAddMitigation: (control: MitigationControl) => void;
  onDeleteMitigation: (id: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const MitigationManagement: React.FC<MitigationManagementProps> = ({
  mitigations,
  currentUser,
  onAddMitigation,
  onDeleteMitigation,
  onShowToast,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReduction, setNewReduction] = useState(70);
  const [newStages, setNewStages] = useState<SdlcStage[]>(['CI/CD']);
  const [newGuide, setNewGuide] = useState('');
  const [newCost, setNewCost] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const isAdmin = currentUser.role === 'Administrator';

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDesc || newStages.length === 0) return;

    const created: MitigationControl = {
      id: `mit-${Date.now()}`,
      code: newCode || `CTRL-${Math.floor(Math.random() * 90 + 10)}`,
      name: newName,
      description: newDesc,
      targetStages: newStages,
      riskReductionPct: newReduction,
      implementationGuide: newGuide || 'Verify configuration baseline against CIS software supply chain benchmarks.',
      costComplexity: newCost,
      isRecommendedFor: ['sc-1', 'sc-2', 'sc-3'],
    };

    onAddMitigation(created);
    setShowAddModal(false);
    setNewName('');
    setNewDesc('');
    setNewCode('');
    setNewGuide('');
    onShowToast('Control Registered', `Added preventive control "${created.name}".`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Preventive Controls & Mitigation Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Defense-in-Depth Mechanisms targeting the 5 SDLC Supply Chain Stages
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Preventive Control</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin privileges required to edit controls</span>
          </div>
        )}
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mitigations.map((ctrl) => (
          <div
            key={ctrl.id}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-sky-400">
                  {ctrl.code}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                  -{ctrl.riskReductionPct}% Risk
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5">{ctrl.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{ctrl.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="space-y-1 font-mono">
                <span className="text-slate-500 text-[10px] uppercase block">Target Stages:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ctrl.targetStages.map((st) => (
                    <span
                      key={st}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px]"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                <span className="text-slate-300 font-bold block mb-0.5">Implementation:</span>
                <p className="line-clamp-2">{ctrl.implementationGuide}</p>
              </div>

              {isAdmin && ctrl.id.startsWith('mit-') && parseInt(ctrl.id.split('-')[1]) > 10 && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onDeleteMitigation(ctrl.id);
                      onShowToast('Control Deleted', `Removed ${ctrl.name}.`, 'warning');
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

      {/* Add Control Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white">Register Preventive Mitigation Control</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-slate-300 font-medium mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="CTRL-08"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Control Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Automated SLSA Provenance Check"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target SDLC Stages</label>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {SDLC_STAGES.map((stage) => (
                    <label key={stage} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStages.includes(stage)}
                        onChange={(e) => {
                          if (e.target.checked) setNewStages([...newStages, stage]);
                          else setNewStages(newStages.filter((s) => s !== stage));
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                      />
                      <span className="text-slate-300">{stage}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Risk Reduction (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={90}
                    value={newReduction}
                    onChange={(e) => setNewReduction(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cost / Complexity</label>
                  <select
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500 font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="How does this control defend the software factory?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Implementation Guide</label>
                <input
                  type="text"
                  placeholder="e.g. Set up branch rules with minimum 2 reviewers in GitHub"
                  value={newGuide}
                  onChange={(e) => setNewGuide(e.target.value)}
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
                  Save Control
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
