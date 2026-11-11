'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import Link from 'next/link';
import {
  GitCompare,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  Building2,
  Users,
  Check,
  X,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function MatchesAndConsentPage() {
  const { user } = useAuth();
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await api.getBrands();
        const list = res?.data || [];
        setBrands(list);
        if (list.length > 0) {
          setSelectedBrandId(list[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadBrands();
  }, []);

  const loadBrandMatches = async (bId: string) => {
    try {
      setLoading(true);
      const res = await api.getBrandMatches(bId);
      setMatches(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBrandId) {
      loadBrandMatches(selectedBrandId);
    }
  }, [selectedBrandId]);

  const handlePropose = async (matchId: string) => {
    try {
      await api.adviserProposeMatch(matchId, { adviserNotes: 'Introduction proposed after manual review.' });
      alert('Introduction handshake initialized! Double-blind consent notifications dispatched.');
      loadBrandMatches(selectedBrandId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConsent = async (consentId: string, party: 'brand' | 'investor', decision: 'granted' | 'declined') => {
    try {
      const res = await api.respondConsent(consentId, { party, decision });
      alert(res?.message || 'Consent response recorded');
      loadBrandMatches(selectedBrandId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Matches & Consent Inbox</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Transparent rules-based matching and two-way double-blind consent before sensitive identity or contact sharing.
          </p>
        </div>

        {/* Brand Selector for Brokerage / Admins */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Select Brand Opportunity:</span>
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-sm"
          >
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.sector})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Double Blind Privacy Notice */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
        <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Double-Blind Consent Rule:</strong> Prospective franchisees only see anonymized brand teasers (e.g. <em>"High-Margin QSR Concept - Mumbai"</em>), and brands only see qualified investor capability profiles. <strong>Direct contact information remains cryptographically hidden</strong> until both parties submit verifiable digital consent.
        </p>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl p-8 space-y-3">
          <GitCompare className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No match records evaluated for this brand</h3>
          <p className="text-xs text-slate-500">
            Open the brand workspace and execute "Run Matching Engine" to generate evaluations.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {matches.map((m) => (
            <div key={m._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      {m.investorId?.name || m.investorId?.blindedCode}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                      {m.investorId?.companyName || 'Private Franchise Operator'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Role: <strong className="capitalize">{m.investorId?.capability?.intendedRole?.replace(/_/g, ' ')}</strong> • Max Capacity: <strong>{m.investorId?.capability?.maxUnitsCapacity} Units</strong>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-600">{m.matchScore}%</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Match Score</div>
                  </div>
                </div>
              </div>

              {/* Match Criteria Breakdown (MAT-02) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  m.criteriaBreakdown?.sectorMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <span className="font-medium">Sector Alignment</span>
                  {m.criteriaBreakdown?.sectorMatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-600" />}
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  m.criteriaBreakdown?.budgetMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <span className="font-medium">Budget Sufficiency</span>
                  {m.criteriaBreakdown?.budgetMatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-600" />}
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  m.criteriaBreakdown?.geographyMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <span className="font-medium">Target Geography</span>
                  {m.criteriaBreakdown?.geographyMatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-600" />}
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  m.criteriaBreakdown?.roleCapacityMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <span className="font-medium">Unit Dev Capacity</span>
                  {m.criteriaBreakdown?.roleCapacityMatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-600" />}
                </div>
              </div>

              {/* Handshake Status & Action Controls */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">Handshake Status:</span>
                  <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded font-bold uppercase text-[11px]">
                    {m.adviserReviewStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {m.adviserReviewStatus !== 'adviser_approved' ? (
                    <button
                      onClick={() => handlePropose(m._id)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                    >
                      Adviser Propose Introduction
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Introduction Dispatched to Deal Rooms
                      </span>
                      <Link
                        href="/deals"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm"
                      >
                        <span>Open Deals</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
