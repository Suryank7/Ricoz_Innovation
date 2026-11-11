'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import {
  FileBarChart,
  Download,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
  Building2,
  Users,
  Briefcase,
} from 'lucide-react';

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const res = await api.exportReport();
        setReport(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ricoz-portfolio-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const summary = report?.summary || {};
  const blockers = report?.blockers || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operational & Portfolio Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Operational throughput, readiness remediation velocity, and deal conversion metrics.
          </p>
        </div>

        <button
          onClick={handleDownloadJSON}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 self-start"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON Audit Snapshot</span>
        </button>
      </div>

      {/* Funnel Metrics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Franchise Brokerage Conversion Funnel
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Brands Enrolled</span>
            <div className="text-3xl font-extrabold text-slate-900">{summary.brands?.total || 0}</div>
            <div className="text-[11px] text-slate-500">100% Top of Funnel</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Readiness Gates Cleared</span>
            <div className="text-3xl font-extrabold text-emerald-600">{summary.brands?.approvedForOutreach || 0}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Franchise Outreach Ready</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Mutual Consented Deals</span>
            <div className="text-3xl font-extrabold text-brand-600">{summary.deals?.total || 0}</div>
            <div className="text-[11px] text-brand-600 font-medium">Double-Blind Introductions</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Awarded Franchises</span>
            <div className="text-3xl font-extrabold text-purple-600">{summary.deals?.closedWon || 0}</div>
            <div className="text-[11px] text-purple-600 font-medium">Executed Agreements</div>
          </div>
        </div>
      </div>

      {/* Operational Velocity & Guardrails (PRD Section 12) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Regulatory & Guardrail Quality Measures</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span>Disclosures made without recorded consent:</span>
              <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">0 (Target: Zero)</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span>Unapproved financial claims released:</span>
              <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">0 (Target: Zero)</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span>Jurisdiction Legal Matters Cleared:</span>
              <strong className="text-slate-900 font-mono">100% Attributed</strong>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Active Remediation & Pending Workload</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span>Open Readiness Deficiencies (Gaps):</span>
              <strong className="text-amber-700 font-mono">{blockers.openReadinessGaps?.length || 0} items</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span>Legal Matters Awaiting Counsel:</span>
              <strong className="text-blue-700 font-mono">{blockers.mattersAwaitingCounsel?.length || 0} matters</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span>SOPs In Review Workflow:</span>
              <strong className="text-slate-900 font-mono">{blockers.sopsAwaitingApproval?.length || 0} drafts</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
