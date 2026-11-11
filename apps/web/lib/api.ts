const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ricoz_auth_token') : null;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.message || `Request failed with status ${res.status}`;
    throw new ApiError(errorMsg, res.status, data?.error?.details);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request<any>('/auth/me'),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),

  // Portfolio Dashboard
  getPortfolioSummary: () => request<any>('/portfolio/summary'),
  getPortfolioBlockers: () => request<any>('/portfolio/blockers'),
  getAuditTrail: (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/portfolio/audit-trail?${query}`);
  },
  exportReport: () => request<any>('/portfolio/export'),

  // Brands
  getBrands: (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/brands?${query}`);
  },
  getBrandById: (id: string) => request<any>(`/brands/${id}`),
  createBrand: (data: any) => request<any>('/brands', { method: 'POST', body: JSON.stringify(data) }),
  updateBrand: (id: string, data: any) => request<any>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Brand Locations
  getLocations: (brandId: string) => request<any>(`/brands/${brandId}/locations`),
  addLocation: (brandId: string, data: any) => request<any>(`/brands/${brandId}/locations`, { method: 'POST', body: JSON.stringify(data) }),

  // Brand Evidence
  getEvidence: (brandId: string) => request<any>(`/brands/${brandId}/evidence`),
  uploadEvidence: (brandId: string, formData: FormData) =>
    request<any>(`/brands/${brandId}/evidence`, { method: 'POST', body: formData }),
  verifyEvidence: (brandId: string, evidenceId: string, data: any) =>
    request<any>(`/brands/${brandId}/evidence/${evidenceId}/verify`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Brand Gaps
  getGaps: (brandId: string) => request<any>(`/brands/${brandId}/gaps`),
  addGap: (brandId: string, data: any) => request<any>(`/brands/${brandId}/gaps`, { method: 'POST', body: JSON.stringify(data) }),
  updateGap: (brandId: string, gapId: string, data: any) =>
    request<any>(`/brands/${brandId}/gaps/${gapId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Readiness Assessment
  getReadiness: (brandId: string) => request<any>(`/readiness/brands/${brandId}`),
  updateScorecard: (brandId: string, scores: any) =>
    request<any>(`/readiness/brands/${brandId}/scorecard`, { method: 'POST', body: JSON.stringify(scores) }),
  approveGate: (brandId: string, gateType: string, comments: string) =>
    request<any>(`/readiness/brands/${brandId}/gates/${gateType}/approve`, { method: 'POST', body: JSON.stringify({ comments }) }),
  rejectGate: (brandId: string, gateType: string, payload: any) =>
    request<any>(`/readiness/brands/${brandId}/gates/${gateType}/reject`, { method: 'POST', body: JSON.stringify(payload) }),
  requestOutreachApproval: (brandId: string) =>
    request<any>(`/readiness/brands/${brandId}/request-outreach`, { method: 'POST' }),

  // SOPs
  getSOPs: (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/sops?${query}`);
  },
  getBrandSOPs: (brandId: string) => request<any>(`/sops/brands/${brandId}`),
  getSOPById: (id: string) => request<any>(`/sops/${id}`),
  createSOP: (data: any) => request<any>('/sops', { method: 'POST', body: JSON.stringify(data) }),
  updateSOP: (id: string, data: any) => request<any>(`/sops/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  routeSOPForReview: (id: string) => request<any>(`/sops/${id}/route-review`, { method: 'POST' }),
  approveSOP: (id: string, data: any) => request<any>(`/sops/${id}/approve`, { method: 'POST', body: JSON.stringify(data) }),
  exportOperatingManual: (brandId: string) => request<any>(`/sops/brands/${brandId}/export`),

  // Legal
  getLegalMatters: (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/legal/matters?${query}`);
  },
  getLegalMatterById: (id: string) => request<any>(`/legal/matters/${id}`),
  createLegalMatter: (data: any) => request<any>('/legal/matters', { method: 'POST', body: JSON.stringify(data) }),
  updateChecklistItem: (matterId: string, itemKey: string, data: any) =>
    request<any>(`/legal/matters/${matterId}/checklist/${itemKey}`, { method: 'PATCH', body: JSON.stringify(data) }),
  uploadLegalDoc: (matterId: string, formData: FormData) =>
    request<any>(`/legal/matters/${matterId}/documents`, { method: 'POST', body: formData }),
  recordCounselReview: (matterId: string, data: any) =>
    request<any>(`/legal/matters/${matterId}/counsel-review`, { method: 'POST', body: JSON.stringify(data) }),
  getJurisdictionChecklist: (jurisdiction: string) => request<any>(`/legal/jurisdictions/${jurisdiction}`),

  // Expansion Proposition
  getExpansionProposition: (brandId: string) => request<any>(`/expansion/brands/${brandId}`),
  updateExpansionProposition: (brandId: string, data: any) =>
    request<any>(`/expansion/brands/${brandId}`, { method: 'POST', body: JSON.stringify(data) }),
  addFinancialAssumption: (brandId: string, data: any) =>
    request<any>(`/expansion/brands/${brandId}/assumptions`, { method: 'POST', body: JSON.stringify(data) }),
  brandApproveTeaser: (brandId: string) => request<any>(`/expansion/brands/${brandId}/brand-approve`, { method: 'POST' }),

  // Investors
  getInvestors: (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/investors?${query}`);
  },
  getInvestorById: (id: string) => request<any>(`/investors/${id}`),
  createInvestor: (data: any) => request<any>('/investors', { method: 'POST', body: JSON.stringify(data) }),
  updateInvestor: (id: string, data: any) => request<any>(`/investors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  verifyInvestorQualification: (id: string, data: any) =>
    request<any>(`/investors/${id}/qualification`, { method: 'POST', body: JSON.stringify(data) }),
  logInvestorActivity: (id: string, data: any) =>
    request<any>(`/investors/${id}/activities`, { method: 'POST', body: JSON.stringify(data) }),

  // Matching & Consent
  evaluateMatches: (brandId: string) => request<any>(`/matching/evaluate/${brandId}`, { method: 'POST' }),
  getBrandMatches: (brandId: string) => request<any>(`/matching/brands/${brandId}`),
  adviserProposeMatch: (matchId: string, data: any) =>
    request<any>(`/matching/${matchId}/adviser-propose`, { method: 'POST', body: JSON.stringify(data) }),
  respondConsent: (consentId: string, data: { party: 'brand' | 'investor'; decision: 'granted' | 'declined' }) =>
    request<any>(`/matching/consent/${consentId}/respond`, { method: 'POST', body: JSON.stringify(data) }),

  // Deals
  getDeals: (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/deals?${query}`);
  },
  getDealById: (id: string) => request<any>(`/deals/${id}`),
  updateDealStage: (id: string, data: any) => request<any>(`/deals/${id}/stage`, { method: 'PATCH', body: JSON.stringify(data) }),
  closeDeal: (id: string, data: any) => request<any>(`/deals/${id}/close`, { method: 'POST', body: JSON.stringify(data) }),
  getDealDocs: (dealId: string) => request<any>(`/deals/${dealId}/documents`),
  shareDealDoc: (dealId: string, data: any) => request<any>(`/deals/${dealId}/documents`, { method: 'POST', body: JSON.stringify(data) }),
  logDocAccess: (dealId: string, docId: string, action: 'view' | 'download') =>
    request<any>(`/deals/${dealId}/documents/${docId}/log-access`, { method: 'POST', body: JSON.stringify({ action }) }),
  getDealQnA: (dealId: string) => request<any>(`/deals/${dealId}/qna`),
  askDealQuestion: (dealId: string, data: any) => request<any>(`/deals/${dealId}/qna`, { method: 'POST', body: JSON.stringify(data) }),
  answerDealQuestion: (dealId: string, qnaId: string, data: any) =>
    request<any>(`/deals/${dealId}/qna/${qnaId}/answer`, { method: 'POST', body: JSON.stringify(data) }),
};
