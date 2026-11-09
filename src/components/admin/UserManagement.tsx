import React, { useState } from 'react';
import {
  Users2,
  Shield,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Lock,
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';

interface UserManagementProps {
  users: UserAccount[];
  currentUser: UserAccount;
  onAddUser: (user: UserAccount) => void;
  onUpdateUserRole: (id: string, role: UserRole) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUserRole,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Learner / Analyst');
  const [inviteDept, setInviteDept] = useState('Platform Engineering');

  const isAdmin = currentUser.role === 'Administrator';

  const filteredUsers = users.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      twoFactorEnabled: inviteRole === 'Administrator',
      status: 'pending',
      lastActive: 'Invited',
      createdDate: new Date().toISOString().split('T')[0],
      department: inviteDept,
    };

    onAddUser(newUser);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    onShowToast('Invitation Sent', `Invited ${newUser.email} with ${newUser.role} permissions.`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users2 className="w-5 h-5 text-sky-400" />
            User & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage Learner / Analyst, Administrator, and Guest access policies
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite User</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin privileges required to manage team</span>
          </div>
        )}
      </div>

      {/* Search Controls */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
          />
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Total Users: <strong className="text-white">{filteredUsers.length}</strong>
        </span>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-mono text-slate-400 uppercase">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role Permission</th>
                <th className="py-3 px-4">Department / Team</th>
                <th className="py-3 px-4">2FA Enforced</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                    {isAdmin ? (
                      <select
                        value={u.role}
                        onChange={(e) => {
                          onUpdateUserRole(u.id, e.target.value as UserRole);
                          onShowToast('Role Updated', `Updated role for ${u.name} to ${e.target.value}.`, 'info');
                        }}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-sky-300 font-medium focus:outline-none focus:border-sky-500"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Learner / Analyst">Learner / Analyst</option>
                        <option value="Guest">Guest</option>
                      </select>
                    ) : (
                      <span className="text-sky-300 font-semibold">{u.role}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                    {u.department}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {u.twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
                        <XCircle className="w-3.5 h-3.5" />
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                    {u.status === 'active' && <span className="text-emerald-400 font-semibold">Active</span>}
                    {u.status === 'pending' && <span className="text-amber-400">Invite Sent</span>}
                    {u.status === 'suspended' && <span className="text-red-400">Suspended</span>}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap text-slate-400 font-mono text-[11px]">
                    {u.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white">Invite User</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Angie Marie"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="angie.marie@codeguard.internal"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="Learner / Analyst">Learner / Analyst</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
