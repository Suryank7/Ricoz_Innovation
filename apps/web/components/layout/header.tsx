'use client';

import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../../lib/auth-context';
import { LogOut, UserCircle2, ChevronDown, Check, Shield } from 'lucide-react';

export function Header() {
  const { user, logout, switchDemoRole } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
      {/* Platform Title / Status */}
      <div className="flex items-center gap-3">
        <span className="text-slate-500 text-sm font-medium">Workspace</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-semibold text-sm">
          {user?.organization || 'Franchise Expansion Advisory'}
        </span>
      </div>

      {/* Right Controls: Role Persona Switcher & Profile */}
      <div className="flex items-center gap-4">
        {/* Quick Persona Switcher for Stakeholders & Testing */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-250 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
          >
            <Shield className="w-3.5 h-3.5 text-brand-600" />
            <span>Switch Role Persona: <strong className="text-slate-900 capitalize">{user?.role.replace('_', ' ')}</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Simulate User Role Access
              </div>
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = user?.email === acc.email;
                return (
                  <button
                    key={acc.email}
                    onClick={() => {
                      switchDemoRole(acc.email, acc.pass);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition ${
                      isSelected ? 'bg-brand-50/70 text-brand-700 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">{acc.label}</div>
                      <div className="text-[11px] text-slate-400">{acc.email}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User avatar & logout */}
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-6 h-6 text-slate-400" />
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{user.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
