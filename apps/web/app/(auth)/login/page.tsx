'use client';

import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Loader2, KeyRound, Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login, switchDemoRole } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accEmail: string, accPass: string) => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoRole(accEmail, accPass);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 text-slate-100">
      <div className="w-full max-w-md space-y-8">
        {/* Brand identity */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 text-white font-bold text-2xl shadow-lg shadow-brand-500/20 mb-2">
            R
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Ricoz Franchise Platform</h1>
          <p className="text-sm text-slate-400">
            Franchise Development & Expansion Brokerage Workspace
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adviser@ricoz.com"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition shadow-md shadow-brand-600/30 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In to Workspace'}
            </button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="pt-4 border-t border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <KeyRound className="w-3.5 h-3.5 text-brand-400" /> One-Click Role Simulator
              </span>
              <span className="text-[10px] text-slate-400">Pilot Accounts</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email, acc.pass)}
                  className="p-2.5 bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-left transition group"
                >
                  <div className="font-medium text-slate-200 group-hover:text-brand-400 truncate">
                    {acc.label}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize truncate">
                    {acc.role.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Digital Personal Data Protection (DPDP) Act 2023 Compliant Governance
        </p>
      </div>
    </div>
  );
}
