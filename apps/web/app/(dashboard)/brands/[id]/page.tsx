'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-context';
import {
  Building2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Scale,
  BookOpen,
  DollarSign,
  Users,
  Plus,
  Clock,
  Download,
  Check,
  X,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function BrandWorkspacePage() {
  const params = useParams();
  const brandId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'readiness' | 'sops' | 'legal' | 'expansion' | 'matching'>('overview');
  const [brand, setBrand] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<any>(null);
  const [gaps, setGaps] = useState<any[]>([]);
  const [sops, setSops] = useState<any[]>([]);
  const [legalMatters, setLegalMatters] = useState<any[]>([]);
  const [expansion, setExpansion] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({ claim: '', category: 'financial', notes: '', file: null as File | null });
  const [showGapModal, setShowGapModal] = useState(false);
  const [gapForm, setGapForm] = useState({ title: '', description: '', dimension: 'operating_repeatability', severity: 'high', dueDate: '' });
  const [showGateModal, setShowGateModal] = useState<{ open: boolean; gateType: string; action: 'approve' | 'reject' }>({ open: false, gateType: '', action: 'approve' });
  const [gateComments, setGateComments] = useState('');
  const [showSopModal, setShowSopModal] = useState(false);
  const [sopForm, setSopForm] = useState({ code: '', title: '', category: 'Opening & Closing', contentMarkdown: '' });
  const [showAssumptionModal, setShowAssumptionModal] = useState(false);
  const [assumptionForm, setAssumptionForm] = useState({ parameter: '', amount: 0, currency: 'INR', classification: 'historical_actual', source: '', asOfDate: '' });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [brandRes, locRes, evRes, rdnRes, gapRes, sopRes, legRes, expRes] = await Promise.all([
        api.getBrandById(brandId),
        api.getLocations(brandId),
        api.getEvidence(brandId),
        api.getReadiness(brandId),
        api.getGaps(brandId),
        api.getBrandSOPs(brandId),
        api.getLegalMatters({ brandId }),
        api.getExpansionProposition(brandId),
      ]);
      setBrand(brandRes?.data);
      setLocations(locRes?.data || []);
      setEvidence(evRes?.data || []);
      setReadiness(rdnRes?.data);
      setGaps(gapRes?.data || []);
      setSops(sopRes?.data || []);
      setLegalMatters(legRes?.data || []);
      setExpansion(expRes?.data);
    } catch (err) {
      console.error('Failed to load brand workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brandId) loadAll();
  }, [brandId]);

  const loadMatches = async () => {
    try {
      const res = await api.getBrandMatches(brandId);
      setMatches(res?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'matching') loadMatches();
  }, [activeTab]);

  // Actions
  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceForm.file) return alert('Select a file to upload');
    const fd = new FormData();
    fd.append('file', evidenceForm.file);
    fd.append('claim', evidenceForm.claim);
    fd.append('category', evidenceForm.category);
    fd.append('notes', evidenceForm.notes);
    try {
      await api.uploadEvidence(brandId, fd);
      setShowEvidenceModal(false);
      setEvidenceForm({ claim: '', category: 'financial', notes: '', file: null });
      const evRes = await api.getEvidence(brandId);
      setEvidence(evRes?.data || []);
    } catch (err: any) {
      alert(err.message || 'Evidence upload failed');
    }
  };

  const handleVerifyEvidence = async (evidenceId: string, status: any) => {
    try {
      await api.verifyEvidence(brandId, evidenceId, { status, notes: 'Verified by adviser review' });
      const evRes = await api.getEvidence(brandId);
      setEvidence(evRes?.data || []);
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    }
  };

  const handleAddGap = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addGap(brandId, {
        ...gapForm,
        dueDate: new Date(gapForm.dueDate || Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
      setShowGapModal(false);
      const gapRes = await api.getGaps(brandId);
      setGaps(gapRes?.data || []);
      const rdnRes = await api.getReadiness(brandId);
      setReadiness(rdnRes?.data);
    } catch (err: any) {
      alert(err.message || 'Failed to add gap');
    }
  };

  const handleCloseGap = async (gapId: string) => {
    try {
      await api.updateGap(brandId, gapId, { status: 'closed', closureNotes: 'Remediation confirmed' });
      const gapRes = await api.getGaps(brandId);
      setGaps(gapRes?.data || []);
      const rdnRes = await api.getReadiness(brandId);
      setReadiness(rdnRes?.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGateAction = async () => {
    try {
      if (showGateModal.action === 'approve') {
        await api.approveGate(brandId, showGateModal.gateType, gateComments);
      } else {
        await api.rejectGate(brandId, showGateModal.gateType, { blockingReasons: [gateComments], comments: gateComments });
      }
      setShowGateModal({ open: false, gateType: '', action: 'approve' });
      setGateComments('');
      const rdnRes = await api.getReadiness(brandId);
      setReadiness(rdnRes?.data);
    } catch (err: any) {
      alert(err.message || 'Gate action failed');
    }
  };

  const handleRequestOutreach = async () => {
    try {
      await api.requestOutreachApproval(brandId);
      alert('Brand officially Approved for Investor Outreach! All readiness gates satisfied.');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Cannot approve for outreach');
    }
  };

  const handleCreateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSOP({ ...sopForm, brandId });
      setShowSopModal(false);
      setSopForm({ code: '', title: '', category: 'Opening & Closing', contentMarkdown: '' });
      const sopRes = await api.getBrandSOPs(brandId);
      setSops(sopRes?.data || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveSop = async (sopId: string) => {
    try {
      await api.approveSOP(sopId, { reviewNotes: 'Approved for operating manual release' });
      const sopRes = await api.getBrandSOPs(brandId);
      setSops(sopRes?.data || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddAssumption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addFinancialAssumption(brandId, {
        ...assumptionForm,
        asOfDate: new Date(assumptionForm.asOfDate || Date.now()),
      });
      setShowAssumptionModal(false);
      const expRes = await api.getExpansionProposition(brandId);
      setExpansion(expRes?.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBrandOwnerTeaserSignoff = async () => {
    try {
      await api.brandApproveTeaser(brandId);
      alert('Brand Owner signoff registered on investor-facing teaser profile.');
      const expRes = await api.getExpansionProposition(brandId);
      setExpansion(expRes?.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRunMatching = async () => {
    try {
      await api.evaluateMatches(brandId);
      loadMatches();
      alert('Matching engine completed rules-based evaluation against investor pool.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdviserPropose = async (matchId: string) => {
    try {
      await api.adviserProposeMatch(matchId, { adviserNotes: 'Adviser validated opportunity fit.' });
      alert('Introduction proposed! Double-blind mutual consent handshake initiated.');
      loadMatches();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !brand) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-80 bg-slate-200 rounded"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{brand.name}</h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold border border-brand-200">
              {brand.sector}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded font-semibold capitalize ${
              brand.status === 'approved_for_outreach' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {brand.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span>Entity: <strong>{brand.legalEntity}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {brand.headquarters?.city}, {brand.headquarters?.state}
            </span>
            <span>•</span>
            <span>Outlets: <strong>{locations.length} Locations</strong></span>
            <span>•</span>
            <span>Adviser: <strong>{brand.assignedAdviserId?.name || 'Rohan Deshmukh'}</strong></span>
          </div>
        </div>

        {/* Action Button: Outreach Approval */}
        <div className="flex items-center gap-3">
          {brand.status !== 'approved_for_outreach' && (
            <button
              onClick={handleRequestOutreach}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Release to Outreach</span>
            </button>
          )}
        </div>
      </div>

      {/* Blocker Banner if Gaps or Pending Gates Exist */}
      {readiness?.isBlocked && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-900">Brand Blocked from Investor Outreach:</span>
            <ul className="list-disc list-inside text-amber-800 space-y-0.5">
              {readiness.blockingReasons?.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Workspace Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview & Evidence', icon: FileText, count: evidence.length },
          { id: 'readiness', label: 'Readiness & Gates', icon: ShieldCheck, count: gaps.filter(g => g.status !== 'closed').length },
          { id: 'sops', label: 'SOP Inventory', icon: BookOpen, count: sops.length },
          { id: 'legal', label: 'Legal Readiness', icon: Scale, count: legalMatters.length },
          { id: 'expansion', label: 'Expansion Proposition', icon: DollarSign },
          { id: 'matching', label: 'Matching & Consent', icon: Users, count: matches.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & EVIDENCE REGISTER */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Outlets List (BR-02) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Operating Outlets & Viability Proof (BR-02)</h2>
                <p className="text-xs text-slate-500">Historical performance records and operating locations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <div key={loc._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div className="font-bold text-slate-900">{loc.name}</div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      {loc.status}
                    </span>
                  </div>
                  <div className="text-slate-500">{loc.address}, {loc.city}</div>
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Format:</span>
                      <div className="font-medium text-slate-700">{loc.format}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Monthly Rev:</span>
                      <div className="font-semibold text-slate-900">
                        {loc.monthlyAverageRevenue ? `₹${(loc.monthlyAverageRevenue / 100000).toFixed(1)}L` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sourced Evidence Register (BR-03, BR-04) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sourced Evidence Register (BR-03, BR-04)</h2>
                <p className="text-xs text-slate-500">
                  Every claim must be backed by source documentation with explicit human verification status.
                </p>
              </div>
              <button
                onClick={() => setShowEvidenceModal(true)}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Evidence Claim</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-semibold">
                    <th className="py-2.5 px-3">Verifiable Claim</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">File Reference</th>
                    <th className="py-2.5 px-3">Confidentiality</th>
                    <th className="py-2.5 px-3">Verification Status</th>
                    <th className="py-2.5 px-3 text-right">Adviser Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evidence.map((ev) => (
                    <tr key={ev._id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-medium text-slate-900 max-w-sm">{ev.claim}</td>
                      <td className="py-3 px-3 uppercase text-[10px] text-slate-500 font-semibold">{ev.category}</td>
                      <td className="py-3 px-3 text-brand-600 font-mono text-[11px] underline">
                        {ev.fileName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 capitalize">{ev.confidentialityLevel?.replace('_', ' ')}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          ev.verificationStatus === 'reviewed_by_adviser'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ev.verificationStatus === 'supported_by_evidence'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ev.verificationStatus?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        {ev.verificationStatus !== 'reviewed_by_adviser' && (
                          <button
                            onClick={() => handleVerifyEvidence(ev._id, 'reviewed_by_adviser')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded text-[11px]"
                          >
                            Mark Reviewed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: READINESS & APPROVAL GATES */}
      {activeTab === 'readiness' && (
        <div className="space-y-6">
          {/* 5-Dimension Scorecard (RA-01) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">5-Dimension Brand Readiness Scorecard (RA-01)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
              {[
                { name: 'Operating Repeatability', score: readiness?.readinessSummary?.operationsScore || 0 },
                { name: 'Unit Economics', score: readiness?.readinessSummary?.economicsScore || 0 },
                { name: 'Brand & IP Assets', score: readiness?.readinessSummary?.brandIpScore || 0 },
                { name: 'Management Capacity', score: readiness?.readinessSummary?.managementScore || 0 },
                { name: 'Legal Preparation', score: readiness?.readinessSummary?.legalScore || 0 },
              ].map((dim) => (
                <div key={dim.name} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="text-[11px] text-slate-500 font-medium">{dim.name}</div>
                  <div className="text-2xl font-bold text-slate-900">{dim.score}%</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-600 h-full rounded-full" style={{ width: `${dim.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Mandatory Human Approval Gates (RA-02) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Mandatory Human Approval Gates (RA-02)</h2>
              <p className="text-xs text-slate-500">
                A brand cannot proceed to investor matchmaking without all 4 gates signed off by designated reviewers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readiness?.gates?.map((gate: any) => (
                <div key={gate._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wide">
                      {gate.gateType.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      gate.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {gate.status}
                    </span>
                  </div>

                  <p className="text-slate-600">{gate.comments || 'Pending sign-off from authorized reviewer.'}</p>

                  {gate.approverId && (
                    <div className="text-[11px] text-slate-400">
                      Signed off by: <strong>{gate.approverId.name}</strong> on {new Date(gate.approvedAt).toLocaleDateString()}
                    </div>
                  )}

                  {gate.status !== 'approved' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => setShowGateModal({ open: true, gateType: gate.gateType, action: 'approve' })}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Sign Off Gate
                      </button>
                      <button
                        onClick={() => setShowGateModal({ open: true, gateType: gate.gateType, action: 'reject' })}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-medium text-xs flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Request Changes
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Readiness Gaps & Remediation Tracker (BR-05, RA-03) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Readiness Gap Remediation Register (BR-05)</h2>
                <p className="text-xs text-slate-500">Every gap is assigned to an owner with a strict due date.</p>
              </div>
              <button
                onClick={() => setShowGapModal(true)}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log Deficiency / Gap
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-semibold">
                    <th className="py-2.5 px-3">Gap Description</th>
                    <th className="py-2.5 px-3">Dimension</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gaps.map((gap) => (
                    <tr key={gap._id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{gap.title}</div>
                        <div className="text-[11px] text-slate-500">{gap.description}</div>
                      </td>
                      <td className="py-3 px-3 capitalize text-slate-600">{gap.dimension?.replace('_', ' ')}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          gap.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {gap.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{new Date(gap.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-3 capitalize font-semibold">{gap.status}</td>
                      <td className="py-3 px-3 text-right">
                        {gap.status !== 'closed' && (
                          <button
                            onClick={() => handleCloseGap(gap._id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded text-[11px]"
                          >
                            Close Gap
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOP INVENTORY */}
      {activeTab === 'sops' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Standard Operating Procedures (SOPs)</h2>
              <p className="text-xs text-slate-500">
                Operating manual codification for store opening, food safety, inventory, and training.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSopModal(true)}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Draft New SOP
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sops.map((sop) => (
              <div key={sop._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-brand-700 font-bold text-[11px] bg-brand-50 px-1.5 py-0.5 rounded">
                      {sop.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{sop.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    sop.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sop.status} v{sop.currentVersion}
                  </span>
                </div>

                <div className="text-slate-500 text-[11px]">
                  Category: <strong>{sop.category}</strong> • Formats: {sop.outletFormat?.join(', ') || 'All'}
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 line-clamp-3 font-mono text-[11px]">
                  {sop.contentMarkdown}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-400">
                    Next Review: {sop.nextReviewDate ? new Date(sop.nextReviewDate).toLocaleDateString() : 'Annual'}
                  </span>
                  {sop.status !== 'approved' && (
                    <button
                      onClick={() => handleApproveSop(sop._id)}
                      className="px-2.5 py-1 bg-emerald-600 text-white font-medium rounded text-[11px]"
                    >
                      Approve SOP
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEGAL READINESS */}
      {activeTab === 'legal' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Jurisdiction Legal Readiness & Counsel Review (LEG-01)</h2>
              <p className="text-xs text-slate-500">
                Jurisdiction-specific legal document register. The platform does not generate legal advice; formal review is recorded by authorized counsel.
              </p>
            </div>
          </div>

          {legalMatters.map((matter) => (
            <div key={matter._id} className="space-y-4 border border-slate-200 rounded-xl p-5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{matter.matterType}</h3>
                  <div className="text-xs text-slate-500">
                    Jurisdiction: <strong>{matter.jurisdiction}</strong> • Counsel: {matter.assignedCounselId?.name || 'Adv. Sameer Kulkarni'}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-blue-100 text-blue-800 capitalize">
                  {matter.status?.replace('_', ' ')}
                </span>
              </div>

              {/* Checklist items */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Statutory & Commercial Checklist ({matter.jurisdiction})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {matter.checklist?.map((item: any) => (
                    <div key={item.itemKey} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className="font-medium text-slate-800">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.isMandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counsel Review Notes */}
              {matter.counselNotes && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800">Counsel Review Statement:</div>
                  <div className="text-slate-600 italic">"{matter.counselNotes}"</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Scope: {matter.counselReviewScope}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: EXPANSION PROPOSITION & FINANCIAL ASSUMPTIONS */}
      {activeTab === 'expansion' && expansion && (
        <div className="space-y-6">
          {/* Franchise Terms Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Franchise Expansion Model & Fees (EXP-01, EXP-02)</h2>
                <p className="text-xs text-slate-500">Commercial terms under offer to qualified franchise partners.</p>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">
                {expansion.franchiseModel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Franchise Fee</div>
                <div className="text-base font-bold text-slate-900">₹{(expansion.fees?.franchiseFee / 100000).toFixed(1)} Lakhs</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Fitout Capex</div>
                <div className="text-base font-bold text-slate-900">₹{(expansion.fees?.initialSetupEstimate / 100000).toFixed(1)} Lakhs</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Working Capital</div>
                <div className="text-base font-bold text-slate-900">₹{(expansion.fees?.workingCapitalRequirement / 100000).toFixed(1)} Lakhs</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Royalty / Marketing</div>
                <div className="text-base font-bold text-slate-900">{expansion.fees?.royaltyPercentage}% / {expansion.fees?.marketingFundPercentage}%</div>
              </div>
            </div>
          </div>

          {/* Sourced Financial Assumption Ledger (EXP-03) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sourced Financial Assumption Ledger (EXP-03)</h2>
                <p className="text-xs text-slate-500">
                  Strictly classifies historical actuals from projections. Never presents estimates as guaranteed returns.
                </p>
              </div>
              <button
                onClick={() => setShowAssumptionModal(true)}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Sourced Financial Fact
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-semibold">
                    <th className="py-2.5 px-3">Metric / Parameter</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 px-3">Classification Badge</th>
                    <th className="py-2.5 px-3">Audited Source</th>
                    <th className="py-2.5 px-3">As of Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expansion.financialAssumptions?.map((fact: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">{fact.parameter}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {fact.currency === 'INR' ? `₹${Number(fact.amount).toLocaleString('en-IN')}` : `${fact.amount} ${fact.currency}`}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          fact.classification === 'historical_actual'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fact.classification === 'management_assumption'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {fact.classification?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{fact.source}</td>
                      <td className="py-3 px-3 text-slate-500">{new Date(fact.asOfDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Investor-Facing Teaser Sign-off */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-brand-400 tracking-wider">
                  Investor Teaser Profile (EXP-04)
                </span>
                <h3 className="text-lg font-bold mt-1">{expansion.investorFacingTeaser?.headline}</h3>
              </div>
              {expansion.investorFacingTeaser?.isApprovedByBrandOwner ? (
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs rounded-lg font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Brand Owner Approved
                </span>
              ) : (
                <button
                  onClick={handleBrandOwnerTeaserSignoff}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
                >
                  Brand Owner Sign Off Teaser
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {expansion.investorFacingTeaser?.summaryDescription}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              {expansion.investorFacingTeaser?.keyHighlights?.map((h: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MATCHING & DOUBLE-BLIND INTRODUCTIONS */}
      {activeTab === 'matching' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Rules-Based Investor Matching & Consent (MAT-01, MAT-04)</h2>
              <p className="text-xs text-slate-500">
                Transparent match scoring against investment criteria. Contact details remain masked until both sides grant consent.
              </p>
            </div>
            <button
              onClick={handleRunMatching}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-4 h-4" /> Run Matching Engine
            </button>
          </div>

          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No match evaluations yet. Click "Run Matching Engine" above to evaluate active investors.
              </div>
            ) : (
              matches.map((m) => (
                <div key={m._id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {m.investorId?.name || m.investorId?.blindedCode || 'Confidential Investor Profile'}
                      </div>
                      <div className="text-xs text-slate-500">
                        Budget Range: ₹{(m.investorId?.preferences?.minBudget / 100000).toFixed(0)}L - ₹{(m.investorId?.preferences?.maxBudget / 100000).toFixed(0)}L • Role: {m.investorId?.capability?.intendedRole?.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-brand-600">{m.matchScore}%</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Rule Fit Score</div>
                    </div>
                  </div>

                  {/* Criteria Met / Unmet Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className={`p-2 rounded border flex items-center gap-1.5 ${m.criteriaBreakdown?.sectorMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                      {m.criteriaBreakdown?.sectorMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Sector Fit</span>
                    </div>
                    <div className={`p-2 rounded border flex items-center gap-1.5 ${m.criteriaBreakdown?.budgetMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                      {m.criteriaBreakdown?.budgetMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Budget Capex</span>
                    </div>
                    <div className={`p-2 rounded border flex items-center gap-1.5 ${m.criteriaBreakdown?.geographyMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                      {m.criteriaBreakdown?.geographyMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Geography</span>
                    </div>
                    <div className={`p-2 rounded border flex items-center gap-1.5 ${m.criteriaBreakdown?.roleCapacityMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                      {m.criteriaBreakdown?.roleCapacityMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Unit Capacity</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      Adviser Status: <strong className="capitalize">{m.adviserReviewStatus?.replace('_', ' ')}</strong>
                    </div>
                    {m.adviserReviewStatus !== 'adviser_approved' && (
                      <button
                        onClick={() => handleAdviserPropose(m._id)}
                        className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded font-medium text-xs shadow-sm transition"
                      >
                        Propose Introduction Handshake
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Upload Evidence Record</h3>
            <form onSubmit={handleUploadEvidence} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Verifiable Statement / Claim</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Registered Trademark in Class 35"
                  value={evidenceForm.claim}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, claim: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={evidenceForm.category}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="financial">Financial (Audits, P&L)</option>
                  <option value="legal_ip">Legal & IP (Trademarks, Contracts)</option>
                  <option value="operations">Operations (Supply Chain, Kitchen Audits)</option>
                  <option value="management">Management & Training</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Document Attachment (.pdf, .xlsx, .docx)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, file: e.target.files?.[0] || null })}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowEvidenceModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-600 text-white rounded font-medium">Upload & Link Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gap Modal */}
      {showGapModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Log Readiness Deficiency / Gap</h3>
            <form onSubmit={handleAddGap} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Gap Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Missing Unit Level P&L for Store 2"
                  value={gapForm.title}
                  onChange={(e) => setGapForm({ ...gapForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Dimension</label>
                <select
                  value={gapForm.dimension}
                  onChange={(e) => setGapForm({ ...gapForm, dimension: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="operating_repeatability">Operating Repeatability</option>
                  <option value="unit_economics">Unit Economics</option>
                  <option value="brand_ip">Brand & IP</option>
                  <option value="management_capacity">Management Capacity</option>
                  <option value="legal_preparation">Legal Preparation</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Severity</label>
                <select
                  value={gapForm.severity}
                  onChange={(e) => setGapForm({ ...gapForm, severity: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="critical">Critical (Blocks Outreach Gate)</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Resolution Due Date</label>
                <input
                  type="date"
                  required
                  value={gapForm.dueDate}
                  onChange={(e) => setGapForm({ ...gapForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowGapModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-600 text-white rounded font-medium">Log Gap</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gate Action Modal */}
      {showGateModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base capitalize">
              {showGateModal.action} Gate: {showGateModal.gateType.replace(/_/g, ' ')}
            </h3>
            <div className="space-y-3 text-xs">
              <label className="block font-medium text-slate-700">Reviewer Attributable Statement / Reason</label>
              <textarea
                rows={4}
                required
                value={gateComments}
                onChange={(e) => setGateComments(e.target.value)}
                placeholder="State basis of review and explicit verified scope..."
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowGateModal({ open: false, gateType: '', action: 'approve' })} className="px-3 py-1.5 border rounded">Cancel</button>
                <button
                  type="button"
                  onClick={handleGateAction}
                  className={`px-4 py-1.5 text-white rounded font-medium ${
                    showGateModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm {showGateModal.action === 'approve' ? 'Sign Off' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOP Modal */}
      {showSopModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Draft Standard Operating Procedure</h3>
            <form onSubmit={handleCreateSop} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Code (e.g. SOP-OPS-004)"
                  value={sopForm.code}
                  onChange={(e) => setSopForm({ ...sopForm, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <select
                  value={sopForm.category}
                  onChange={(e) => setSopForm({ ...sopForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Opening & Closing">Opening & Closing</option>
                  <option value="Food Safety & Hygiene">Food Safety & Hygiene</option>
                  <option value="Inventory & Procurement">Inventory & Procurement</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Quality Control">Quality Control</option>
                </select>
              </div>
              <input
                type="text"
                required
                placeholder="SOP Title"
                value={sopForm.title}
                onChange={(e) => setSopForm({ ...sopForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <textarea
                rows={6}
                required
                placeholder="Markdown Procedure Content..."
                value={sopForm.contentMarkdown}
                onChange={(e) => setSopForm({ ...sopForm, contentMarkdown: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
              />
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowSopModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-600 text-white rounded font-medium">Save Draft</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assumption Modal */}
      {showAssumptionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add Sourced Financial Fact</h3>
            <form onSubmit={handleAddAssumption} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Parameter (e.g. Store Fitout Capex)"
                value={assumptionForm.parameter}
                onChange={(e) => setAssumptionForm({ ...assumptionForm, parameter: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  required
                  placeholder="Amount"
                  value={assumptionForm.amount}
                  onChange={(e) => setAssumptionForm({ ...assumptionForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <select
                  value={assumptionForm.classification}
                  onChange={(e) => setAssumptionForm({ ...assumptionForm, classification: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="historical_actual">Historical Actual</option>
                  <option value="management_assumption">Management Assumption</option>
                  <option value="projected_model">Projected Model</option>
                </select>
              </div>
              <input
                type="text"
                required
                placeholder="Audited Source (e.g. FY25 Audited Accounts)"
                value={assumptionForm.source}
                onChange={(e) => setAssumptionForm({ ...assumptionForm, source: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                required
                value={assumptionForm.asOfDate}
                onChange={(e) => setAssumptionForm({ ...assumptionForm, asOfDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAssumptionModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-600 text-white rounded font-medium">Add to Ledger</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
