'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import {
  Scale,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Check,
  Building2,
} from 'lucide-react';

export default function LegalWorkspacePage() {
  const { user } = useAuth();
  const [matters, setMatters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('India');
  const [jurisdictionItems, setJurisdictionItems] = useState<any[]>([]);

  // Counsel Review Modal
  const [showReviewModal, setShowReviewModal] = useState<{ open: boolean; matterId: string }>({ open: false, matterId: '' });
  const [reviewStatus, setReviewStatus] = useState<'counsel_review_recorded' | 'changes_requested'>('counsel_review_recorded');
  const [reviewScope, setReviewScope] = useState('');
  const [counselNotes, setCounselNotes] = useState('');

  const loadMatters = async () => {
    try {
      setLoading(true);
      const [matRes, jurRes] = await Promise.all([
        api.getLegalMatters(),
        api.getJurisdictionChecklist(selectedJurisdiction),
      ]);
      setMatters(matRes?.data || []);
      setJurisdictionItems(jurRes?.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatters();
  }, [selectedJurisdiction]);

  const handleToggleChecklist = async (matterId: string, itemKey: string, currentVal: boolean) => {
    try {
      await api.updateChecklistItem(matterId, itemKey, { isCompleted: !currentVal, notes: 'Toggled in legal workspace' });
      loadMatters();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveCounselReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordCounselReview(showReviewModal.matterId, {
        status: reviewStatus,
        counselReviewScope: reviewScope,
        counselNotes,
      });
      setShowReviewModal({ open: false, matterId: '' });
      setReviewScope('');
      setCounselNotes('');
      loadMatters();
      alert('Counsel review recorded and attributed in audit log.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Legal Readiness Workspace</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Jurisdiction-tagged legal matters, statutory checklists, and professional counsel review verification.
          </p>
        </div>

        {/* Jurisdiction Selector (LEG-01) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Active Jurisdiction Pack:</span>
          <select
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-brand-700 focus:ring-2 focus:ring-brand-500 shadow-sm"
          >
            <option value="India">India (DPDP 2023 / Contract Act)</option>
            <option value="United States">United States (FTC Franchise Rule)</option>
            <option value="United Kingdom">United Kingdom (bfa Code / UK GDPR)</option>
            <option value="UAE">UAE (Commercial Agencies)</option>
          </select>
        </div>
      </div>

      {/* Legal Advisory Guardrail Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
        <Scale className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Jurisdiction Compliance Notice:</strong> The platform organizes legal evidence and counsel review activities. It does not independently present AI-generated agreements as legally valid or approved. A completed checklist does not substitute for authorized counsel sign-off.
        </p>
      </div>

      {/* Legal Matters Active List */}
      <div className="space-y-6">
        {matters.map((matter) => (
          <div key={matter._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{matter.matterType}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {matter.jurisdiction}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Brand: <strong>{matter.brandId?.name}</strong> • Counsel: <strong>{matter.assignedCounselId?.name || 'Adv. Sameer Kulkarni'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded text-xs font-bold capitalize ${
                  matter.status === 'counsel_review_recorded'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {matter.status?.replace('_', ' ')}
                </span>
                <button
                  onClick={() => setShowReviewModal({ open: true, matterId: matter._id })}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-sm transition"
                >
                  Record Counsel Sign-off
                </button>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Jurisdiction Checklist Requirements
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {matter.checklist?.map((item: any) => (
                  <div
                    key={item.itemKey}
                    onClick={() => handleToggleChecklist(matter._id, item.itemKey, item.isCompleted)}
                    className="p-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-start gap-3 cursor-pointer transition select-none"
                  >
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      {item.notes && <div className="text-[11px] text-slate-500 mt-0.5">{item.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document versions register */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">
                Associated Document Packages: <strong>{matter.documents?.length || 0} registered version(s)</strong>
              </span>
              {matter.counselSignoffDate && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  Counsel Review Recorded: {new Date(matter.counselSignoffDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Counsel Review Modal */}
      {showReviewModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Record Professional Counsel Review</h3>
            <p className="text-xs text-slate-500">
              Logs the formal legal reviewer attribution, explicit scope of review, and recommendations.
            </p>

            <form onSubmit={handleSaveCounselReview} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Review Outcome Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                >
                  <option value="counsel_review_recorded">Counsel Review Recorded (Cleared for Stated Purpose)</option>
                  <option value="changes_requested">Changes Requested (Returned with Amendments)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Defined Scope of Legal Review</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trademark Class 43 validity, DPDP clauses, 3km territorial non-compete"
                  value={reviewScope}
                  onChange={(e) => setReviewScope(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Counsel Formal Comments & Opinion</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Document conforms to governing statutes for designated expansion format..."
                  value={counselNotes}
                  onChange={(e) => setCounselNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowReviewModal({ open: false, matterId: '' })}
                  className="px-3.5 py-1.5 border rounded font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded font-medium shadow-sm"
                >
                  Record Attributed Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
