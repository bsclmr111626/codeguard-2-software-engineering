import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
} from 'lucide-react';
import { AuditLog, UserAccount } from '../../types';

interface AuditLogViewProps {
  logs: AuditLog[];
  currentUser: UserAccount;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  logs,
  currentUser,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');

  const isAdmin = currentUser.role === 'Administrator';

  const filteredLogs = logs.filter((log) => {
    if (outcomeFilter !== 'all' && log.status !== outcomeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.actor.name.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.resource.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor Name', 'Role', 'Action', 'Resource', 'IP Address', 'Status', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.actor.name,
      l.actor.role,
      `"${l.action}"`,
      `"${l.resource}"`,
      l.ipAddress,
      l.status,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `codeguard-audit-log-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Audit Log Exported', `Exported ${filteredLogs.length} audit records.`, 'success');
  };

  if (!isAdmin) {
    return (
      <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/60 max-w-xl mx-auto my-12 space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Administrator Access Required</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Audit log inspection is restricted to users with the <strong>Administrator</strong> role.
          You are currently signed in as <strong>{currentUser.role}</strong>. Use the persona switcher in the header to simulate the Administrator role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Security Audit Trail & Governance Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-evident activity logs tracking simulations, policy edits, and administrative access
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by actor name, action, resource, or IP address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[11px] text-slate-400 uppercase">Outcome:</span>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Outcomes</option>
            <option value="success">Success</option>
            <option value="flagged">Flagged</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] text-slate-400 uppercase">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-white font-sans">{log.actor.name}</div>
                    <div className="text-[10px] text-slate-500">{log.actor.role}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-sky-300 font-sans">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-300 truncate max-w-xs">
                    {log.resource}
                  </td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {log.status === 'success' && (
                      <span className="text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                        SUCCESS
                      </span>
                    )}
                    {log.status === 'flagged' && (
                      <span className="text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
                        FLAGGED
                      </span>
                    )}
                    {log.status === 'denied' && (
                      <span className="text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/60">
                        DENIED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Storage: SQLite Local Transaction Log D3</span>
          <span>Showing {filteredLogs.length} audit records</span>
        </div>
      </div>
    </div>
  );
};
