'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import {
  Users,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  MessageSquare,
  Check,
  X,
  Phone,
  Mail,
} from 'lucide-react';

export default function InvestorsCRMPage() {
  const { user } = useAuth();
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState<{ open: boolean; investorId: string }>({ open: false, investorId: '' });
  const [verifyStatus, setVerifyStatus] = useState<'verified_by_adviser' | 'rejected'>('verified_by_adviser');
  const [verifyNotes, setVerifyNotes] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    minBudget: 5000000,
    maxBudget: 15000000,
    intendedRole: 'multi_unit_operator',
    maxUnitsCapacity: 3,
    existingExperienceYears: 5,
    sectors: 'Food & Beverage',
    locations: 'Mumbai, Pune',
  });

  const loadInvestors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      if (verificationFilter) params.verificationStatus = verificationFilter;
      const res = await api.getInvestors(params);
      setInvestors(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestors();
  }, [roleFilter, verificationFilter]);

  const handleCreateInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInvestor({
        name: formData.name,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        preferences: {
          targetSectors: formData.sectors.split(',').map((s) => s.trim()),
          preferredLocations: formData.locations.split(',').map((l) => l.trim()),
          minBudget: Number(formData.minBudget),
          maxBudget: Number(formData.maxBudget),
          currency: 'INR',
          targetTimingMonths: 6,
        },
        capability: {
          intendedRole: formData.intendedRole as any,
          maxUnitsCapacity: Number(formData.maxUnitsCapacity),
          existingOperatingExperienceYears: Number(formData.existingExperienceYears),
          sectorExperienceSummary: 'Prior multi-unit business operating history.',
        },
      });
      setShowAddModal(false);
      loadInvestors();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVerifyInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.verifyInvestorQualification(showVerifyModal.investorId, {
        financialReviewStatus: verifyStatus,
        qualificationNotes: verifyNotes,
      });
      setShowVerifyModal({ open: false, investorId: '' });
      setVerifyNotes('');
      loadInvestors();
      alert('Investor financial qualification status verified by adviser.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = investors.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Investor CRM & Qualification</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Maintain prospective multi-unit franchise operators, capital capacity evidence, and human qualification reviews.
          </p>
        </div>

        {user?.role !== 'investor' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Profile Prospective Investor</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by investor name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Operating Roles</option>
            <option value="multi_unit_operator">Multi-Unit Operator</option>
            <option value="hands_on_operator">Hands-On Single Unit Operator</option>
            <option value="area_developer">Area Developer</option>
            <option value="passive_investor">Passive Investor</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Verification Statuses</option>
            <option value="verified_by_adviser">Verified by Adviser</option>
            <option value="in_review">In Review</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Investor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((inv) => (
          <div key={inv._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{inv.name}</h3>
                  <div className="text-xs text-slate-500">{inv.companyName || 'Private Operator'}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  inv.qualification?.financialReviewStatus === 'verified_by_adviser'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {inv.qualification?.financialReviewStatus?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Preferences breakdown */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Budget Range:</span>
                  <span className="font-bold text-slate-900">
                    ₹{(inv.preferences?.minBudget / 100000).toFixed(0)}L - ₹{(inv.preferences?.maxBudget / 100000).toFixed(0)}L
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Operator Role:</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {inv.capability?.intendedRole?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Unit Capacity:</span>
                  <span className="font-semibold text-slate-900">
                    {inv.capability?.maxUnitsCapacity} Outlets
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Sectors:</span>
                  <span className="text-slate-700 font-medium">
                    {inv.preferences?.targetSectors?.join(', ') || 'Any'}
                  </span>
                </div>
              </div>

              {/* Contact info (Protected in double-blind matching) */}
              <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {inv.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {inv.phone}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Source: <strong>{inv.source?.replace('_', ' ')}</strong>
              </span>
              {inv.qualification?.financialReviewStatus !== 'verified_by_adviser' && (
                <button
                  onClick={() => setShowVerifyModal({ open: true, investorId: inv._id })}
                  className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded font-medium text-[11px]"
                >
                  Verify Capacity
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Investor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Profile Prospective Franchisee / Investor</h3>
            <form onSubmit={handleCreateInvestor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Investment Entity / Company"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  placeholder="investor@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="tel"
                  required
                  placeholder="+91 Mobile"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min Capital (INR)</label>
                  <input
                    type="number"
                    value={formData.minBudget}
                    onChange={(e) => setFormData({ ...formData, minBudget: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Capital (INR)</label>
                  <input
                    type="number"
                    value={formData.maxBudget}
                    onChange={(e) => setFormData({ ...formData, maxBudget: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Intended Operator Role</label>
                  <select
                    value={formData.intendedRole}
                    onChange={(e) => setFormData({ ...formData, intendedRole: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="multi_unit_operator">Multi-Unit Operator</option>
                    <option value="hands_on_operator">Hands-On Operator</option>
                    <option value="area_developer">Area Developer</option>
                    <option value="passive_investor">Passive Investor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Unit Development Capacity</label>
                  <input
                    type="number"
                    value={formData.maxUnitsCapacity}
                    onChange={(e) => setFormData({ ...formData, maxUnitsCapacity: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Target Sectors (comma-separated)"
                  value={formData.sectors}
                  onChange={(e) => setFormData({ ...formData, sectors: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Preferred Cities (comma-separated)"
                  value={formData.locations}
                  onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-600 text-white rounded font-medium">Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Human Financial Qualification Review</h3>
            <form onSubmit={handleVerifyInvestor} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Review Outcome</label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                >
                  <option value="verified_by_adviser">Verified by Adviser (Evidence Inspected)</option>
                  <option value="rejected">Rejected / Capacity Inadequate</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Adviser Verification Notes & Source</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Inspected bank liquidity proofs / certified net worth statement..."
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowVerifyModal({ open: false, investorId: '' })} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-600 text-white rounded font-medium">Confirm Verification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
