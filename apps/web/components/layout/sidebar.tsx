'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Scale,
  Users,
  GitCompare,
  Briefcase,
  FileBarChart,
  Settings,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { name: 'Portfolio', href: '/', icon: LayoutDashboard, roles: ['brokerage_admin', 'franchise_adviser', 'platform_admin'] },
    { name: 'Brands', href: '/brands', icon: Building2 },
    { name: 'SOP Library', href: '/sops', icon: BookOpen },
    { name: 'Legal Readiness', href: '/legal', icon: Scale },
    { name: 'Investors CRM', href: '/investors', icon: Users, roles: ['brokerage_admin', 'franchise_adviser', 'platform_admin', 'investor'] },
    { name: 'Matches & Consent', href: '/matches', icon: GitCompare },
    { name: 'Deals & Rooms', href: '/deals', icon: Briefcase },
    { name: 'Reports', href: '/reports', icon: FileBarChart, roles: ['brokerage_admin', 'franchise_adviser', 'platform_admin'] },
    { name: 'Settings & Audit', href: '/settings', icon: Settings },
  ];

  const visibleNav = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!user) return true;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-500/20">
          R
        </div>
        <div>
          <h1 className="text-white font-semibold text-base leading-tight tracking-tight">Ricoz Platform</h1>
          <p className="text-slate-400 text-xs font-mono">Franchise Advisory</p>
        </div>
      </div>

      {/* Tenant Scope / Role Context Badge */}
      {user && (
        <div className="mx-4 my-3 p-3 bg-slate-850 rounded-lg border border-slate-750 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium uppercase tracking-wider text-[10px]">Session Scope</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-white font-medium truncate">{user.name}</div>
          <div className="text-brand-400 font-mono text-[11px] capitalize">
            {user.role.replace('_', ' ')}
          </div>
          {user.role === 'brand_owner' && (
            <div className="text-amber-400 text-[10px] flex items-center gap-1 mt-1 font-medium">
              <Lock className="w-3 h-3" /> Tenant Boundary Active
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>DPDP 2023 Standard</span>
        <span className="font-mono text-[11px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">v1.0</span>
      </div>
    </aside>
  );
}
