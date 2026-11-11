'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  MapPin,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function BrandsListPage() {
  const { user } = useAuth();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // New Brand Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    legalEntity: '',
    sector: 'Food & Beverage',
    subSector: '',
    operatingSince: '2022-01-01',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    contactName: '',
    contactTitle: 'Founder',
    contactEmail: '',
    contactPhone: '',
    blindedName: '',
  });

  const loadBrands = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (sectorFilter) params.sector = sectorFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.getBrands(params);
      setBrands(res?.data || []);
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [sectorFilter, statusFilter]);

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        legalEntity: formData.legalEntity,
        sector: formData.sector,
        subSector: formData.subSector,
        operatingSince: new Date(formData.operatingSince),
        headquarters: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
        contactPerson: {
          name: formData.contactName,
          title: formData.contactTitle,
          email: formData.contactEmail,
          phone: formData.contactPhone,
        },
        confidentialitySettings: {
          blindedName: formData.blindedName || `Emerging ${formData.sector} Concept (${formData.city})`,
          hideIdentityUntilConsent: true,
        },
      };

      await api.createBrand(payload);
      setShowAddModal(false);
      loadBrands();
    } catch (err: any) {
      alert(err.message || 'Failed to create brand');
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.legalEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.headquarters?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brand Engagements</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage brands undergoing evidence verification, SOP codification, legal review, and expansion outreach.
          </p>
        </div>
        {user?.role !== 'investor' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Brand</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by brand name, legal entity, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Sectors</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Retail">Retail</option>
            <option value="Health & Wellness">Health & Wellness</option>
            <option value="Education">Education</option>
            <option value="Services">Services</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Stages</option>
            <option value="intake">Intake</option>
            <option value="assessment_in_progress">Assessment in Progress</option>
            <option value="gaps_remediation">Gaps Remediation</option>
            <option value="approved_for_outreach">Approved for Outreach</option>
          </select>
        </div>
      </div>

      {/* Brands Grid / Table */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl p-8 space-y-3">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No brand engagements found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or register a new brand engagement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBrands.map((brand) => (
            <div
              key={brand._id}
              className="bg-white border border-slate-200 hover:border-brand-300 rounded-xl p-5 shadow-sm hover:shadow transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{brand.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{brand.legalEntity}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase tracking-wide">
                    {brand.sector}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{brand.headquarters?.city}, {brand.headquarters?.state}</span>
                </div>

                {brand.confidentialitySettings?.blindedName && (
                  <div className="p-2 bg-slate-50 border border-slate-150 rounded text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Teaser Tag: </span>
                    {brand.confidentialitySettings.blindedName}
                  </div>
                )}
              </div>

              {/* Status and Gate Summary */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Readiness Stage
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold capitalize mt-0.5">
                    {brand.status === 'approved_for_outreach' ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Outreach Approved
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {brand.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/brands/${brand._id}`}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-brand-600 text-white font-medium text-xs rounded-lg transition flex items-center gap-1 shadow-sm"
                >
                  <span>Open</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Onboard New Brand Engagement</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Trading Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Chai & Chutney Express"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Legal Entity Name</label>
                  <input
                    type="text"
                    required
                    value={formData.legalEntity}
                    onChange={(e) => setFormData({ ...formData, legalEntity: e.target.value })}
                    placeholder="e.g. Chai Chutney LLP"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sector</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Retail">Retail</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Education">Education</option>
                    <option value="Services">Services</option>
                    <option value="Automotive">Automotive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sub-Sector Format</label>
                  <input
                    type="text"
                    value={formData.subSector}
                    onChange={(e) => setFormData({ ...formData, subSector: e.target.value })}
                    placeholder="e.g. QSR / Cafe"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">HQ City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    disabled
                    value={formData.country}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="font-semibold text-slate-800">Primary Founder / Contact</div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Founder Name"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="email"
                    required
                    placeholder="founder@brand.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="tel"
                    required
                    placeholder="+91 Phone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Title (e.g. Managing Director)"
                    value={formData.contactTitle}
                    onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Confidential Blinded Teaser Title (Shown to Investors Before Consent)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Proven High-Volume QSR Concept (Mumbai/Pune)"
                  value={formData.blindedName}
                  onChange={(e) => setFormData({ ...formData, blindedName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium shadow-sm"
                >
                  Initialize Brand Engagement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
