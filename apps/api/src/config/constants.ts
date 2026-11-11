export const ROLES = {
  BROKERAGE_ADMIN: 'brokerage_admin',
  FRANCHISE_ADVISER: 'franchise_adviser',
  SOP_SPECIALIST: 'sop_specialist',
  BRAND_OWNER: 'brand_owner',
  EXTERNAL_COUNSEL: 'external_counsel',
  INVESTOR: 'investor',
  PLATFORM_ADMIN: 'platform_admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const BRAND_STATUSES = [
  'intake',
  'assessment_in_progress',
  'gaps_remediation',
  'ready_for_review',
  'approved_for_outreach',
  'paused',
  'archived',
] as const;

export const SECTORS = [
  'Food & Beverage',
  'Retail',
  'Health & Wellness',
  'Education',
  'Services',
  'Automotive',
  'Other',
] as const;

export const GATE_TYPES = [
  'operations_gate',
  'commercial_gate',
  'legal_gate',
  'brand_owner_gate',
] as const;

export const JURISDICTIONS = [
  'India',
  'United States',
  'United Kingdom',
  'UAE',
  'Singapore',
] as const;

export const DEAL_STAGES = [
  'introduction_approved',
  'initial_meeting',
  'due_diligence',
  'terms_negotiation',
  'agreement_review',
  'closed_won',
  'closed_lost',
  'paused',
] as const;
