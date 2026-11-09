import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Zap,
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';

interface AuthPagesProps {
  onLogin: (user: UserAccount) => void;
  availableUsers: UserAccount[];
}

export const AuthPages: React.FC<AuthPagesProps> = ({ onLogin, availableUsers }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('denzel.otunga@codeguard.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Software Supply Chain Security');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Learner / Analyst');
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter an email address.');
      return;
    }

    if (requires2FA) {
      if (twoFactorCode.length < 6) {
        setErrorMsg('Please enter the 6-digit TOTP verification code.');
        return;
      }
      const matched =
        availableUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
        availableUsers[0];
      onLogin(matched);
      return;
    }

    const matched = availableUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched && matched.twoFactorEnabled) {
      setRequires2FA(true);
      return;
    }

    if (matched) {
      onLogin(matched);
    } else {
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: fullName || email.split('@')[0],
        email: email,
        role: selectedRole,
        twoFactorEnabled: selectedRole === 'Administrator',
        status: 'active',
        lastActive: 'Just now',
        createdDate: new Date().toISOString().split('T')[0],
        department: department,
      };
      onLogin(newUser);
    }
  };

  const handleQuickPersona = (user: UserAccount) => {
    setEmail(user.email);
    setPassword('SecurePass2026!');
    onLogin(user);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-3 shadow-lg shadow-sky-950/50">
            <Shield className="w-6 h-6 fill-sky-400/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">CodeGuard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Software Supply Chain Attack Simulator (5-Stage SDLC)
          </p>
        </div>

        {/* Quick Demo Switcher Strip */}
        <div className="mb-6 p-3 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Demo Roles & Actors
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1-click login</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {availableUsers.slice(0, 4).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickPersona(user)}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:border-slate-700 text-left transition-all group"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-sky-400 shrink-0">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-sky-400 font-mono truncate">{user.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setRequires2FA(false);
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRequires2FA(false);
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {requires2FA ? (
            /* 2FA Step */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sky-500/10 text-sky-400 mb-1 border border-sky-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-400">
                  Enter the 6-digit TOTP code for {email}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] font-mono text-lg py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Verify & Complete Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setRequires2FA(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 transition-colors"
              >
                ← Back to standard credentials
              </button>
            </form>
          ) : (
            /* Main Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Dr. Jordan Hayes"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Target Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    >
                      <option value="Learner / Analyst">Learner / Analyst (Runs simulations & views history)</option>
                      <option value="Administrator">Administrator (Manages scenarios, controls, audit logs)</option>
                      <option value="Guest">Guest (Limited evaluation access)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Department / Organization
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Security Engineering"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Corporate / University Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="name@university.edu or name@corp.internal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  {mode === 'login' && (
                    <span className="text-[11px] text-sky-400 hover:text-sky-300 cursor-pointer">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm mt-2"
              >
                <span>{mode === 'login' ? 'Authenticate Session' : 'Register Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>CodeGuard Supply Chain Risk Simulator</span>
        </div>
      </div>
    </div>
  );
};
