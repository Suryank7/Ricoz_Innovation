'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import Link from 'next/link';
import {
  Briefcase,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
} from 'lucide-react';

const PIPELINE_COLUMNS = [
  { id: 'introduction_approved', label: 'Intro Approved' },
  { id: 'initial_meeting', label: 'Commercial Call' },
  { id: 'due_diligence', label: 'Due Diligence' },
  { id: 'terms_negotiation', label: 'Terms Negotiation' },
  { id: 'agreement_review', label: 'Agreement Review' },
  { id: 'closed_won', label: 'Awarded / Won' },
];

export default function DealsPipelinePage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      try {
        setLoading(true);
        const res = await api.getDeals();
        setDeals(res?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDeals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deals Pipeline & Private Deal Rooms</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Stage progression for mutually consented brand opportunities and vetted multi-unit franchisees.
          </p>
        </div>
      </div>

      {/* Kanban Board View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
          {PIPELINE_COLUMNS.map((col) => {
            const columnDeals = deals.filter((d) => d.stage === col.id);
            return (
              <div key={col.id} className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3 space-y-3 min-h-[450px]">
                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="font-bold text-xs text-slate-800">{col.label}</span>
                  <span className="text-[11px] font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                    {columnDeals.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnDeals.map((deal) => (
                    <div
                      key={deal._id}
                      className="p-4 bg-white border border-slate-200 hover:border-brand-300 rounded-xl shadow-sm hover:shadow transition space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                          {deal.dealCode}
                        </span>
                        <Lock className="w-3 h-3 text-emerald-600" />
                      </div>

                      <div>
                        <div className="font-bold text-slate-900">{deal.brandId?.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Partner: {deal.investorId?.name || 'Vetted Franchisee'}
                        </div>
                      </div>

                      <div className="p-2 bg-slate-50 rounded border border-slate-150 text-[11px] text-slate-600 space-y-1">
                        <div className="font-medium text-slate-800 truncate">
                          Next: {deal.nextAction?.description || 'Review terms'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Due: {new Date(deal.nextAction?.dueDate).toLocaleDateString()}
                        </div>
                      </div>

                      <Link
                        href={`/deals/${deal._id}`}
                        className="w-full py-1.5 bg-slate-900 hover:bg-brand-600 text-white rounded font-medium text-[11px] flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <span>Open Deal Room</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
