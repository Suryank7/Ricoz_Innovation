'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import {
  Settings,
  Shield,
  ShieldCheck,
  User,
  History,
  Lock,
  Eye,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Key,
} from 'lucide-react';

export default function SettingsAndAuditPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'rbac' | 'audit' | 'security'>('audit');

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [entityFilter, setEntityFilter] = useState('');
  const [searchActor, setSearchActor] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const params: any = {};
      if (entityFilter) params.targetEntity = entityFilter;
      const res = await api.getAuditTrail(params);
      setAuditLogs(res?.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab, entityFilter]);

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchActor) return true;
    const term = searchActor.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.targetEntity?.toLowerCase().includes(term) ||
      log.actorEmail?.toLowerCase().includes(term) ||
      log.actorRole?.toLowerCase().includes(term) ||
      log.targetId?.toLowerCase().includes(term)
    );
  });

  const rolesMatrix = [
    {
      role: 'brokerage_admin',
      label: 'Brokerage Administrator',
      scope: 'Global Read/Write, Human Verification Approvals, Master Config',
      permissions: ['Manage all brands', 'Approve/Reject Readiness Gates', 'Verify Investor Net Worth', 'View Full Audit Trail', 'Configure Jurisdiction Checklists'],
    },
    {
      role: 'franchise_adviser',
      label: 'Franchise Expansion Adviser',
      scope: 'Advisory Portfolio, Readiness Scoring, Investor Matching',
      permissions: ['Score readiness dimensions', 'Log and remediate gaps', 'Run matching algorithm', 'Propose double-blind matches', 'Manage Deal Rooms'],
    },
    {
      role: 'sop_specialist',
      label: 'SOP & Operations Specialist',
      scope: 'Operational Documentation, Repeatability Manuals',
      permissions: ['Draft & update SOPs', 'Manage version history', 'Approve operational SOPs', 'Download operations playbook'],
    },
    {
      role: 'external_counsel',
      label: 'External Legal Counsel',
      scope: 'Jurisdiction Legal Due Diligence, Counsel Review Notes',
      permissions: ['Review FDD & agreements', 'Toggle checklist items', 'Record formal counsel review', 'Flag legal contingencies'],
    },
    {
      role: 'brand_owner',
      label: 'Brand Owner / Founder',
      scope: 'Strict Single-Tenant Isolation (Own Brand Only)',
      permissions: ['Upload operational evidence', 'Review expansion proposition', 'Sign off on teaser', 'Accept/Decline investor match requests'],
    },
    {
      role: 'investor',
      label: 'Prospective Franchisee / Investor',
      scope: 'Strict Privacy Sandbox (Consented Deal Rooms Only)',
      permissions: ['Manage investment profile', 'Review blinded brand teasers', 'Sign consent for mutual reveal', 'Access private Deal Room documents'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-brand-600" />
            Platform Settings & Governance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Role-Based Access Control, Tenant Isolation Policies, and Immutable Audit Ledger.
          </p>
        </div>

        {/* Tab navigation pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rbac'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            RBAC & Roles
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'security'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tenant Isolation
          </button>
        </div>
      </div>

      {/* Tab Content: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Audit Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search action, actor, target..."
                  value={searchActor}
                  onChange={(e) => setSearchActor(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">All Entities</option>
                <option value="brand">Brand</option>
                <option value="gate">Readiness Gate</option>
                <option value="sop">SOP Manual</option>
                <option value="legal">Legal Matter</option>
                <option value="match">Match Engine</option>
                <option value="deal">Deal Room</option>
                <option value="investor">Investor CRM</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="text-xs text-slate-500">
                Showing {filteredLogs.length} immutable events
              </span>
              <button
                onClick={loadAuditLogs}
                disabled={loadingAudit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 font-medium transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Target ID</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 font-sans">
                        No audit records matched your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, idx) => (
                      <tr key={log._id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                          <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 text-[11px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 capitalize font-sans">
                          {log.targetEntity}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 text-[11px] truncate max-w-[140px]">
                          {log.targetId || '-'}
                        </td>
                        <td className="py-2.5 px-4 font-sans">
                          <div className="text-slate-900 font-medium text-[11px]">
                            {log.actorEmail || 'System'}
                          </div>
                          <div className="text-slate-400 text-[10px] capitalize">
                            {log.actorRole?.replace('_', ' ') || 'Internal'}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right font-sans">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-xs font-medium hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: RBAC & ROLES */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="bg-brand-50 border border-brand-200 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
            <div className="text-xs text-brand-900 leading-relaxed">
              <span className="font-semibold">Role-Based Access Control (RBAC):</span> All API endpoints strictly enforce role authorization via server-side middleware. Client-side navigation guards reflect the underlying cryptographic JWT token claims.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rolesMatrix.map((item) => (
              <div
                key={item.role}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-sm">{item.label}</h3>
                  <code className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    {item.role}
                  </code>
                </div>
                <p className="text-xs text-slate-500 italic">{item.scope}</p>
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Key Entitlements
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {item.permissions.map((perm, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: MY PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-2xl space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-brand-500/20">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Authorized User'}</h2>
              <p className="text-xs text-slate-500 font-mono">{user?.email || 'user@ricoz.com'}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 capitalize">
                <Shield className="w-3 h-3" />
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-500 font-medium">Unique Identity (UUID)</label>
              <div className="mt-1 font-mono text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {user?.id || '67c8b0000000000000000001'}
              </div>
            </div>

            <div>
              <label className="text-slate-500 font-medium">Session Status</label>
              <div className="mt-1 flex items-center gap-2 text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                Cryptographically Authenticated (JWT RS256 Bearer)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: TENANT ISOLATION */}
      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-200">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Multi-Tenant Boundary Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Adherence to India DPDP 2023 and International Commercial Confidentiality Standards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                Brand Owner Tenant Wall
              </div>
              <p className="text-slate-600 leading-relaxed">
                Brand owners have strict tenant isolation enforced at the database query level via <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">enforceBrandTenant</code> middleware. A brand owner cannot query or inspect any competitor brands, SOPs, financial models, or legal matters.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                Double-Blind Matching Privacy
              </div>
              <p className="text-slate-600 leading-relaxed">
                Matches are generated with anonymized aliases (e.g., <span className="font-mono">INV-MUM-001</span> and <span className="font-mono">BRD-FNB-992</span>). Identity, legal incorporation, telephone numbers, and email addresses are cryptographically locked until bilateral mutual consent is executed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Inspect Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">Audit Event Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Action</span>
                  <div className="font-semibold text-slate-900">{selectedLog.action}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Entity</span>
                  <div className="font-semibold text-slate-900 capitalize">{selectedLog.targetEntity}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Actor</span>
                  <div className="font-mono text-slate-800">{selectedLog.actorEmail || 'System'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Timestamp</span>
                  <div className="font-mono text-slate-600">
                    {new Date(selectedLog.createdAt).toISOString()}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase">Target ID</span>
                <div className="font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 break-all">
                  {selectedLog.targetId}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase">Event Metadata & Payload</span>
                <pre className="font-mono text-[11px] bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto max-h-56">
                  {JSON.stringify(selectedLog.metadata || selectedLog.changes || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
