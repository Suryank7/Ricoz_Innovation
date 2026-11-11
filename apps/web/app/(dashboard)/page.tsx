'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Link from 'next/link';
import {
  Building2,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function PortfolioDashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [blockers, setBlockers] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, blkRes] = await Promise.all([
          api.getPortfolioSummary(),
          api.getPortfolioBlockers(),
        ]);
        setSummary(sumRes?.data);
        setBlockers(blkRes?.data);
      } catch (err) {
        console.error('Failed to load portfolio dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const brands = summary?.brands || {};
  const investors = summary?.investors || {};
  const deals = summary?.deals || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portfolio Executive Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time readiness progression, governance gates, and qualified investor introduction pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/brands"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <span>Engage Brand</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Brands</span>
            <Building2 className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{brands.total || 0}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{brands.approvedForOutreach || 0} Franchise-Ready Gates Cleared</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Investors CRM</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{investors.total || 0}</div>
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{investors.verifiedQualified || 0} Human Financial Verified</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Deal Rooms</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{deals.active || 0}</div>
          <div className="flex items-center gap-1.5 text-xs text-purple-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{deals.closedWon || 0} Deals Successfully Awarded</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Operational Blockers</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {(blockers?.openReadinessGaps?.length || 0) + (blockers?.pendingApprovalGates?.length || 0)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{blockers?.mattersAwaitingCounsel?.length || 0} Awaiting Counsel Review</span>
          </div>
        </div>
      </div>

      {/* Operational Blocker Desk (OPS-02) */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-semibold text-amber-950">
              Operational Blocker Desk & Human Gate Check
            </h2>
          </div>
          <span className="text-xs bg-amber-200/60 text-amber-900 font-medium px-2 py-0.5 rounded-full">
            Mandatory Gate Enforcement Active
          </span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Brands remain locked in preparation until all readiness deficiencies are remediated, jurisdiction counsel logs formal review, and the brand owner signs off on the commercial teaser pack.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Critical Gaps list */}
          <div className="bg-white border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Unresolved Readiness Gaps</span>
              <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {blockers?.openReadinessGaps?.length || 0} open
              </span>
            </div>
            {blockers?.openReadinessGaps?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No open readiness gaps across active brands.</p>
            ) : (
              <div className="space-y-2">
                {blockers?.openReadinessGaps?.slice(0, 4).map((gap: any) => (
                  <div key={gap._id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="font-medium text-slate-900">{gap.title}</div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        Brand: {gap.brandId?.name || 'Brand'} • {gap.dimension?.replace('_', ' ')}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      gap.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {gap.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Matters Awaiting Counsel Review */}
          <div className="bg-white border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Legal Matters with Counsel</span>
              <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {blockers?.mattersAwaitingCounsel?.length || 0} pending
              </span>
            </div>
            {blockers?.mattersAwaitingCounsel?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No legal reviews currently awaiting external counsel.</p>
            ) : (
              <div className="space-y-2">
                {blockers?.mattersAwaitingCounsel?.slice(0, 4).map((matter: any) => (
                  <div key={matter._id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="font-medium text-slate-900">{matter.matterType}</div>
                      <div className="text-[11px] text-slate-500">
                        {matter.brandId?.name} • Jurisdiction: {matter.jurisdiction}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium text-[10px]">
                      {matter.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Brand Engagements Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Active Brand Engagements</h2>
            <p className="text-xs text-slate-500">Brands progressing from initial intake through expansion outreach.</p>
          </div>
          <Link href="/brands" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>View All Brands</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Brand / Legal Entity</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Headquarters</th>
                <th className="py-3 px-4">Assigned Adviser</th>
                <th className="py-3 px-4">Readiness Status</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.recentBrands?.map((brand: any) => (
                <tr key={brand._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{brand.name}</div>
                    <div className="text-[11px] text-slate-500">{brand.legalEntity}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{brand.sector}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {brand.headquarters?.city}, {brand.headquarters?.state}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {brand.assignedAdviserId?.name || 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                      brand.readinessSummary?.overallStatus === 'franchise_ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {brand.readinessSummary?.overallStatus?.replace('_', ' ') || 'Assessing'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {brand.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/brands/${brand._id}`}
                      className="px-3 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-medium rounded transition"
                    >
                      Workspace
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Deal Pipeline Snapshot */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Deal Rooms & Introductions</h2>
            <p className="text-xs text-slate-500">Mutual consent deals active in commercial due diligence and contract review.</p>
          </div>
          <Link href="/deals" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>View All Deals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary?.recentDeals?.map((deal: any) => (
            <div key={deal._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                  {deal.dealCode}
                </span>
                <span className="capitalize px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium text-[11px]">
                  {deal.stage?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  {deal.brandId?.name || 'Confidential Brand'} ↔ {deal.investorId?.name || 'Consented Investor'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Assigned Adviser: {deal.assignedAdviserId?.name || 'Rohan Deshmukh'}
                </div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Next Action: </span>
                  {deal.nextAction?.description || 'Commercial review call'}
                </div>
                <Link
                  href={`/deals/${deal._id}`}
                  className="shrink-0 text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-0.5"
                >
                  <span>Enter Room</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
