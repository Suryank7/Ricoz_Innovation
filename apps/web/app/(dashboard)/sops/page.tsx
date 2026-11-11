'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileDown,
  Layers,
  Building2,
} from 'lucide-react';

export default function SOPLibraryPage() {
  const [sops, setSops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSop, setSelectedSop] = useState<any | null>(null);

  useEffect(() => {
    async function loadSops() {
      try {
        setLoading(true);
        const params: any = {};
        if (categoryFilter) params.category = categoryFilter;
        if (statusFilter) params.status = statusFilter;
        const res = await api.getSOPs(params);
        setSops(res?.data || []);
      } catch (err) {
        console.error('Failed to load SOPs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSops();
  }, [categoryFilter, statusFilter]);

  const filtered = sops.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.brandId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Standard Operating Procedures Library</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cross-brand operations manual registry, procedure versioning, and compliance review schedules.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by procedure title, code, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            <option value="Opening & Closing">Opening & Closing</option>
            <option value="Food Safety & Hygiene">Food Safety & Hygiene</option>
            <option value="Inventory & Procurement">Inventory & Procurement</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Quality Control">Quality Control</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="in_review">In Review</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-semibold bg-slate-50/50">
                  <th className="py-3 px-4">Code / Procedure</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Review Schedule</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sop) => (
                  <tr
                    key={sop._id}
                    onClick={() => setSelectedSop(sop)}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      selectedSop?._id === sop._id ? 'bg-brand-50/60' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-brand-700 font-bold text-[11px] block">{sop.code}</span>
                      <span className="font-semibold text-slate-900">{sop.title}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {sop.brandId?.name || 'Chai & Chutney'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{sop.category}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">v{sop.currentVersion}</td>
                    <td className="py-3 px-4">
                      {sop.nextReviewDate ? (
                        <span className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(sop.nextReviewDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">Annual</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sop.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sop.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected SOP Inspector */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Procedure Inspector</h3>
            {selectedSop && (
              <span className="font-mono text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                {selectedSop.code}
              </span>
            )}
          </div>

          {selectedSop ? (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedSop.title}</h4>
                <div className="text-slate-500 mt-0.5">
                  Category: <strong>{selectedSop.category}</strong> • Version: <strong>v{selectedSop.currentVersion}</strong>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Effective Date:</span>
                  <strong>{selectedSop.effectiveDate ? new Date(selectedSop.effectiveDate).toLocaleDateString() : 'N/A'}</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Next Review Due:</span>
                  <strong>{selectedSop.nextReviewDate ? new Date(selectedSop.nextReviewDate).toLocaleDateString() : 'Annual'}</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Authorized Approver:</span>
                  <strong>{selectedSop.approvedBy?.name || 'Operations Lead'}</strong>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Approved Operating Instructions:</span>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-y-auto max-h-64 whitespace-pre-wrap">
                  {selectedSop.contentMarkdown}
                </div>
              </div>

              {selectedSop.versionHistory?.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="font-semibold text-slate-700 block text-[11px]">Version Audit History:</span>
                  {selectedSop.versionHistory.map((vh: any, idx: number) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-150 text-[11px] flex justify-between">
                      <span className="font-mono font-bold text-brand-700">v{vh.version}</span>
                      <span className="text-slate-500 truncate max-w-[160px]">{vh.summary}</span>
                      <span className="text-slate-400">{new Date(vh.changedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Select any procedure on the left to inspect its version history, effective schedule, and approved instructions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
