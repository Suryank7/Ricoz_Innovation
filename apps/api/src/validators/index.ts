import { z } from 'zod';

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const RegisterUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum([
      'brokerage_admin',
      'franchise_adviser',
      'sop_specialist',
      'external_counsel',
      'brand_owner',
      'investor',
      'platform_admin',
    ]),
    phone: z.string().optional(),
    assignedBrandId: z.string().optional(),
  }),
});

export const CreateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Brand name is required'),
    legalEntity: z.string().min(2, 'Legal entity name is required'),
    sector: z.string().min(1, 'Sector is required'),
    subSector: z.string().optional(),
    operatingSince: z.string().or(z.date()),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().default('India'),
    contactName: z.string().min(1, 'Contact name is required'),
    contactEmail: z.string().email('Contact email is required'),
    contactPhone: z.string().min(5, 'Contact phone is required'),
    contactTitle: z.string().optional(),
    blindedName: z.string().optional(),
  }),
});

export const GateReviewSchema = z.object({
  body: z.object({
    decision: z.enum(['approved', 'rejected']),
    notes: z.string().min(3, 'Review notes are required for gate sign-off'),
  }),
});

export const CounselReviewSchema = z.object({
  body: z.object({
    reviewOutcome: z.enum(['counsel_review_recorded', 'changes_requested']),
    counselNotes: z.string().min(5, 'Counsel legal notes are required'),
  }),
});

export const CreateInvestorSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Investor name is required'),
    companyName: z.string().optional(),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(5, 'Phone number is required'),
    minBudget: z.number().nonnegative(),
    maxBudget: z.number().positive(),
    intendedRole: z.enum(['hands_on_operator', 'multi_unit_operator', 'semi_absentee_investor', 'financial_partner']),
    maxUnitsCapacity: z.number().int().positive().default(1),
    existingExperienceYears: z.number().nonnegative().default(0),
    sectors: z.array(z.string()).default([]),
    locations: z.array(z.string()).default([]),
  }),
});
