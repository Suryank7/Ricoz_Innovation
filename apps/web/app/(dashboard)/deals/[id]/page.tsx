'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-context';
import {
  Briefcase,
  Lock,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Download,
  Eye,
  Plus,
  Send,
  Building2,
  Users,
  Check,
  AlertOctagon,
} from 'lucide-react';

const STAGES = [
  'introduction_approved',
  'initial_meeting',
  'due_diligence',
  'terms_negotiation',
  'agreement_review',
  'closed_won',
];

export default function DealRoomDetailPage() {
  const params = useParams();
  const dealId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [deal, setDeal] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [qnas, setQnas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Inputs
  const [showShareModal, setShowShareModal] = useState(false);
  const [docForm, setDocForm] = useState({ title: '', documentType: 'financial_model', version: '1.0', fileUrl: '/uploads/sample-model.xlsx' });
  const [questionText, setQuestionText] = useState('');
  const [questionCategory, setQuestionCategory] = useState('operational');
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeOutcome, setCloseOutcome] = useState<'closed_won' | 'closed_lost' | 'paused'>('closed_won');
  const [closeReason, setCloseReason] = useState('');

  const loadDealRoom = async () => {
    try {
      setLoading(true);
      const [dealRes, docsRes, qnaRes] = await Promise.all([
        api.getDealById(dealId),
        api.getDealDocs(dealId),
        api.getDealQnA(dealId),
      ]);
      setDeal(dealRes?.data);
      setDocs(docsRes?.data || []);
      setQnas(qnaRes?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dealId) loadDealRoom();
  }, [dealId]);

  const handleAdvanceStage = async (nextStage: string) => {
    try {
      await api.updateDealStage(dealId, {
        stage: nextStage,
        nextAction: {
          description: `Progress to ${nextStage.replace(/_/g, ' ')}`,
          assignedToRole: 'brokerage',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      loadDealRoom();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleShareDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.shareDealDoc(dealId, docForm);
      setShowShareModal(false);
      setDocForm({ title: '', documentType: 'financial_model', version: '1.0', fileUrl: '/uploads/sample-model.xlsx' });
      const res = await api.getDealDocs(dealId);
      setDocs(res?.data || []);
      alert('Document disclosed to deal room with access auditing enabled.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogDocAccess = async (docId: string, action: 'view' | 'download') => {
    try {
      await api.logDocAccess(dealId, docId, action);
      const res = await api.getDealDocs(dealId);
      setDocs(res?.data || []);
      alert(`${action.toUpperCase()} recorded in deal security audit trail.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    try {
      await api.askDealQuestion(dealId, { question: questionText, category: questionCategory });
      setQuestionText('');
      const res = await api.getDealQnA(dealId);
      setQnas(res?.data || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAnswerQuestion = async (qnaId: string) => {
    const answer = answerInputs[qnaId];
    if (!answer?.trim()) return;
    try {
      await api.answerDealQuestion(dealId, qnaId, { answer });
      const res = await api.getDealQnA(dealId);
      setQnas(res?.data || []);
      setAnswerInputs({ ...answerInputs, [qnaId]: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCloseDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.closeDeal(dealId, { outcome: closeOutcome, reason: closeReason });
      setShowCloseModal(false);
      loadDealRoom();
      alert(`Deal resolution recorded: ${closeOutcome}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !deal) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-80 bg-slate-200 rounded"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const currentStageIndex = STAGES.indexOf(deal.stage);

  return (
    <div className="space-y-6">
      {/* Deal Room Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-200">
              {deal.dealCode}
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {deal.brandId?.name} ↔ {deal.investorId?.name}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded font-bold capitalize bg-purple-100 text-purple-800">
              {deal.stage?.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span>Brand Entity: <strong>{deal.brandId?.legalEntity}</strong></span>
            <span>•</span>
            <span>Investor Firm: <strong>{deal.investorId?.companyName || 'Private Operator'}</strong></span>
            <span>•</span>
            <span>Managing Adviser: <strong>{deal.assignedAdviserId?.name}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {deal.stage !== 'closed_won' && (
            <button
              onClick={() => setShowCloseModal(true)}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Close / Pause Deal
            </button>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Share Document
          </button>
        </div>
      </div>

      {/* Mutual Consent Unmasked Contact Information (DEAL-02) */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mutual Consent Granted — Unmasked Direct Contacts</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
            DPDP Compliant Handshake Complete
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
            <span className="font-bold text-slate-900">{deal.brandId?.name} Founder Contact</span>
            <div className="text-slate-600">{deal.brandId?.contactPerson?.name} ({deal.brandId?.contactPerson?.title})</div>
            <div className="font-mono text-slate-700">{deal.brandId?.contactPerson?.email} • {deal.brandId?.contactPerson?.phone}</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
            <span className="font-bold text-slate-900">Prospective Franchisee Partner Contact</span>
            <div className="text-slate-600">{deal.investorId?.name} ({deal.investorId?.companyName})</div>
            <div className="font-mono text-slate-700">{deal.investorId?.email} • {deal.investorId?.phone}</div>
          </div>
        </div>
      </div>

      {/* Stage Progression Stepper (DEAL-01) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Transaction Stage Pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {STAGES.map((stg, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <button
                key={stg}
                onClick={() => handleAdvanceStage(stg)}
                className={`p-2.5 rounded-xl border text-center transition ${
                  isCurrent
                    ? 'bg-brand-600 text-white border-brand-600 font-bold shadow-md shadow-brand-500/20'
                    : isCompleted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-mono">Step {idx + 1}</div>
                <div className="text-xs truncate capitalize mt-0.5">{stg.replace(/_/g, ' ')}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deal Room Content: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Shared Documents Vault (DEAL-03) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Shared Document Register & Audits (DEAL-03)</h3>
              <p className="text-xs text-slate-500">Every view and download is cryptographically tracked.</p>
            </div>
          </div>

          <div className="space-y-3">
            {docs.map((doc) => (
              <div key={doc._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{doc.title}</span>
                    <span className="text-[11px] text-slate-500 uppercase font-mono">
                      Type: {doc.documentType?.replace('_', ' ')} • v{doc.version}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                    {doc.accessRule?.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-400">
                    Access Count: <strong>{doc.accessLogs?.length || 0} times</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleLogDocAccess(doc._id, 'view')}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-slate-500" /> View
                    </button>
                    <button
                      onClick={() => handleLogDocAccess(doc._id, 'download')}
                      className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded font-medium flex items-center gap-1"
                    >
                      <Download className="w-3 h-3 text-brand-600" /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Due Diligence Q&A Thread (DEAL-04) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Due Diligence Clarifications & Q&A (DEAL-04)</h3>
              <p className="text-xs text-slate-500">Commercial, legal, and operational inquiry log.</p>
            </div>
          </div>

          {/* Ask question form */}
          <form onSubmit={handleAskQuestion} className="space-y-2 text-xs">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Submit inquiry (e.g. commissary turnaround time, lease radius)..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Submit
              </button>
            </div>
          </form>

          {/* Q&A List */}
          <div className="space-y-3 overflow-y-auto max-h-[380px]">
            {qnas.map((qna) => (
              <div key={qna._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-slate-900">Q: {qna.question}</div>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                    qna.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {qna.status}
                  </span>
                </div>

                {qna.answer ? (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700">
                    <span className="font-bold text-slate-900">A: </span>
                    {qna.answer}
                    <div className="text-[10px] text-slate-400 mt-1">
                      Answered by {qna.answeredBy?.name || 'Operations Lead'} on {new Date(qna.answeredAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Type response to inquiry..."
                      value={answerInputs[qna._id] || ''}
                      onChange={(e) => setAnswerInputs({ ...answerInputs, [qna._id]: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 border rounded text-xs bg-white"
                    />
                    <button
                      onClick={() => handleAnswerQuestion(qna._id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-medium rounded text-xs"
                    >
                      Answer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Document Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Share Document to Deal Room</h3>
            <form onSubmit={handleShareDoc} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Document Title (e.g. Audited P&L Store 1)"
                value={docForm.title}
                onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <select
                value={docForm.documentType}
                onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="financial_model">Financial Model (P&L, Unit Capex)</option>
                <option value="legal_pack">Legal Pack (Franchise Agreement)</option>
                <option value="sop_overview">SOP Operations Overview</option>
                <option value="term_sheet">Commercial Term Sheet</option>
              </select>
              <input
                type="text"
                required
                placeholder="File URL or uploaded path"
                value={docForm.fileUrl}
                onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono text-[11px]"
              />
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowShareModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-600 text-white rounded font-medium">Disclose Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Deal Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Close or Pause Deal</h3>
            <form onSubmit={handleCloseDeal} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Resolution Outcome</label>
                <select
                  value={closeOutcome}
                  onChange={(e) => setCloseOutcome(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg font-semibold"
                >
                  <option value="closed_won">Closed Won (Franchise Awarded & Signed)</option>
                  <option value="closed_lost">Closed Lost (Declined / Unfit)</option>
                  <option value="paused">Paused (On Hold by Mutual Agreement)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Structured Reason for Outcome</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Terms negotiated, master agreement signed for 3 outlets..."
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowCloseModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium">Save Resolution</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
