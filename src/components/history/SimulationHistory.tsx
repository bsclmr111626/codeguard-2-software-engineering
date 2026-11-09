import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  TrendingDown,
  Layers,
  X,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { SimulationRecord, RiskLevel } from '../../types';

interface SimulationHistoryProps {
  history: SimulationRecord[];
  onSelectRunForReplay?: (record: SimulationRecord) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const SimulationHistory: React.FC<SimulationHistoryProps> = ({
  history,
  onSelectRunForReplay,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<SimulationRecord | null>(null);

  const filteredHistory = history.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.scenarioName.toLowerCase().includes(q) ||
        item.userName.toLowerCase().includes(q) ||
        item.entryPointStage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return 'text-red-400 bg-red-950/80 border-red-800/80';
      case 'High':
        return 'text-amber-300 bg-amber-950/80 border-amber-800/80';
      case 'Medium':
        return 'text-sky-300 bg-sky-950/80 border-sky-800/80';
      case 'Low':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80';
    }
  };

  const handleExportHistoryCSV = () => {
    const headers = [
      'Timestamp',
      'User',
      'Role',
      'Scenario',
      'Entry Point',
      'Baseline Score',
      'Baseline Level',
      'Mitigated Score',
      'Mitigated Level',
      'Risk Reduction Pct',
      'Applied Controls',
    ];

    const rows = filteredHistory.map((h) => [
      h.timestamp,
      `"${h.userName}"`,
      h.userRole,
      `"${h.scenarioName}"`,
      h.entryPointStage,
      h.overallBaselineRisk,
      h.baselineRiskLevel,
      h.overallMitigatedRisk,
      h.mitigatedRiskLevel,
      `${h.riskReductionPct}%`,
      `"${h.appliedControlNames.join('; ')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `codeguard-simulation-history-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('History Exported', `Exported ${filteredHistory.length} simulation records.`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-sky-400" />
            Simulation Audit History & Evidence Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Past Software Supply Chain Attack Simulations, Stage Propagation Results, and Control Baselines
          </p>
        </div>

        <button
          onClick={handleExportHistoryCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export History CSV</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search history by scenario name, analyst, or entry point stage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
          />
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Total Runs: <strong className="text-white">{filteredHistory.length}</strong>
        </span>
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] text-slate-400 uppercase">
                <th className="py-3 px-4">Timestamp & Analyst</th>
                <th className="py-3 px-4">Attack Scenario</th>
                <th className="py-3 px-4">Entry Stage</th>
                <th className="py-3 px-4">Baseline Risk</th>
                <th className="py-3 px-4">Mitigated Risk</th>
                <th className="py-3 px-4">Net Reduction</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    No simulation records found. Run a simulation from the Attack Simulator tab to generate history.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-300 font-semibold font-sans">{item.userName}</div>
                      <div className="text-[10px] text-slate-500">{item.timestamp}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-white font-sans font-medium">{item.scenarioName}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.appliedControlNames.length} controls applied
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sky-400">
                      {item.entryPointStage}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(item.baselineRiskLevel)}`}>
                        {item.overallBaselineRisk} ({item.baselineRiskLevel})
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(item.mitigatedRiskLevel)}`}>
                        {item.overallMitigatedRisk} ({item.mitigatedRiskLevel})
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        -{item.riskReductionPct}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(item);
                        }}
                        className="text-sky-400 hover:text-sky-300 font-sans font-medium flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold">
                  Simulation Audit ID: {selectedRecord.id}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedRecord.scenarioName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">ANALYST</span>
                  <span className="text-white font-bold">{selectedRecord.userName}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">BASELINE RISK</span>
                  <span className="text-red-400 font-bold">{selectedRecord.overallBaselineRisk} / 100</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">MITIGATED RISK</span>
                  <span className="text-emerald-400 font-bold">{selectedRecord.overallMitigatedRisk} / 100</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase font-sans mb-2">
                  5-Stage SDLC Propagation Telemetry
                </h4>
                <div className="space-y-1.5">
                  {selectedRecord.stageResults.map((st) => (
                    <div
                      key={st.stage}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white font-sans">{st.stage}</div>
                        <div className="text-[10px] text-slate-400">{st.findingsNotes}</div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="font-bold text-white tabular-nums">
                          {st.mitigatedRisk}
                        </span>
                        <span className="text-slate-500 text-[10px]"> (was {st.baselineRisk})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase font-sans mb-1.5">
                  Applied Mitigations ({selectedRecord.appliedControlNames.length})
                </h4>
                <div className="space-y-1">
                  {selectedRecord.appliedControlNames.map((name, idx) => (
                    <div key={idx} className="text-sky-300 text-[11px]">
                      ✓ {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
