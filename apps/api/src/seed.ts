import { connectDatabase } from './config/database';
import { User } from './models/user.model';
import { Brand } from './models/brand.model';
import { BrandLocation } from './models/brand-location.model';
import { Evidence } from './models/evidence.model';
import { ReadinessGap } from './models/readiness-gap.model';
import { ReadinessGate } from './models/readiness-gate.model';
import { SOP } from './models/sop.model';
import { LegalMatter } from './models/legal-matter.model';
import { ExpansionProposition } from './models/expansion.model';
import { Investor } from './models/investor.model';
import { Match } from './models/match.model';
import { Consent } from './models/consent.model';
import { Deal, SharedDocument, DealQnA } from './models/deal.model';
import { AuditLog } from './models/audit-log.model';
import { hashPassword } from './utils/password';
import { ROLES, GATE_TYPES } from './config/constants';
import { LegalService } from './services/legal.service';

export async function seedDatabase() {
  console.log('--- Starting Database Seeding ---');
  await connectDatabase();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Brand.deleteMany({}),
    BrandLocation.deleteMany({}),
    Evidence.deleteMany({}),
    ReadinessGap.deleteMany({}),
    ReadinessGate.deleteMany({}),
    SOP.deleteMany({}),
    LegalMatter.deleteMany({}),
    ExpansionProposition.deleteMany({}),
    Investor.deleteMany({}),
    Match.deleteMany({}),
    Consent.deleteMany({}),
    Deal.deleteMany({}),
    SharedDocument.deleteMany({}),
    DealQnA.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log('Cleared existing collections.');

  // 1. Create Core Users
  const adminPassword = await hashPassword('Admin@123456');
  const adviserPassword = await hashPassword('Adviser@123456');
  const opsPassword = await hashPassword('Ops@123456');
  const legalPassword = await hashPassword('Legal@123456');
  const brandPassword = await hashPassword('Brand@123456');
  const investorPassword = await hashPassword('Investor@123456');

  const adminUser = await User.create({
    name: 'Aarav Mehta (Admin)',
    email: 'admin@ricoz.com',
    passwordHash: adminPassword,
    role: ROLES.BROKERAGE_ADMIN,
    organization: 'Ricoz Franchise Advisory Group',
    phone: '+91 98200 11223',
  });

  const adviserUser = await User.create({
    name: 'Rohan Deshmukh (Lead Adviser)',
    email: 'adviser@ricoz.com',
    passwordHash: adviserPassword,
    role: ROLES.FRANCHISE_ADVISER,
    organization: 'Ricoz Franchise Advisory Group',
    phone: '+91 98200 44556',
  });

  const opsSpecialist = await User.create({
    name: 'Pooja Iyer (Operations Specialist)',
    email: 'ops@ricoz.com',
    passwordHash: opsPassword,
    role: ROLES.SOP_SPECIALIST,
    organization: 'Ricoz Operations Team',
    phone: '+91 98200 77889',
  });

  const externalCounsel = await User.create({
    name: 'Adv. Sameer Kulkarni',
    email: 'legal@franchisecounsel.in',
    passwordHash: legalPassword,
    role: ROLES.EXTERNAL_COUNSEL,
    organization: 'Kulkarni & Partners Franchise Law',
    phone: '+91 98201 99001',
  });

  console.log('Brokerage staff and counsel created.');

  // 2. Create Brand: Chai & Chutney Express
  const brand1 = await Brand.create({
    name: 'Chai & Chutney Express',
    legalEntity: 'Chai Chutney Hospitality LLP',
    sector: 'Food & Beverage',
    subSector: 'Quick Service Restaurant (QSR)',
    operatingSince: new Date('2021-08-15'),
    headquarters: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    },
    contactPerson: {
      name: 'Aditya Varma',
      title: 'Founder & Managing Partner',
      email: 'founder@chaichutney.com',
      phone: '+91 98199 33445',
    },
    assignedAdviserId: adviserUser._id,
    status: 'approved_for_outreach',
    readinessSummary: {
      operationsScore: 92,
      economicsScore: 88,
      brandIpScore: 95,
      managementScore: 85,
      legalScore: 90,
      overallStatus: 'franchise_ready',
    },
    confidentialitySettings: {
      blindedName: 'High-Margin Urban QSR Beverage & Snack Brand (Mumbai)',
      hideIdentityUntilConsent: true,
    },
    description:
      'Pioneering modern artisanal chai, street snacks, and central-commissary meal boxes with 3 company-owned high-volume outlets.',
  });

  // Link Brand Owner User
  const brandOwnerUser = await User.create({
    name: 'Aditya Varma',
    email: 'founder@chaichutney.com',
    passwordHash: brandPassword,
    role: ROLES.BRAND_OWNER,
    brandId: brand1._id,
    organization: 'Chai Chutney Hospitality LLP',
    phone: '+91 98199 33445',
  });

  // 3. Brand Locations
  await BrandLocation.create([
    {
      brandId: brand1._id,
      name: 'Bandra Flagship',
      address: 'Shop 4, Hill Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      format: 'Dine-In Flagship',
      openingDate: new Date('2021-08-15'),
      status: 'operating',
      monthlyAverageRevenue: 2400000,
      monthlyAverageEbitda: 528000,
      hasPerformanceEvidence: true,
    },
    {
      brandId: brand1._id,
      name: 'Lower Parel Express',
      address: 'Tower 2 Ground Floor, One International Centre',
      city: 'Mumbai',
      state: 'Maharashtra',
      format: 'QSR / Express',
      openingDate: new Date('2022-11-10'),
      status: 'operating',
      monthlyAverageRevenue: 1950000,
      monthlyAverageEbitda: 448500,
      hasPerformanceEvidence: true,
    },
    {
      brandId: brand1._id,
      name: 'Koregaon Park Cafe',
      address: 'Lane 7, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      format: 'Dine-In Flagship',
      openingDate: new Date('2023-09-01'),
      status: 'operating',
      monthlyAverageRevenue: 1650000,
      monthlyAverageEbitda: 363000,
      hasPerformanceEvidence: true,
    },
  ]);

  // 4. Evidence Register
  await Evidence.create([
    {
      entityType: 'brand',
      entityId: brand1._id,
      claim: 'Trademark registered under Class 43 (Food & Drink Services) with Registry of Trademarks Mumbai',
      category: 'legal_ip',
      fileName: 'TM-Class43-Registration-Cert.pdf',
      fileUrl: '/uploads/sample-tm-cert.pdf',
      fileSizeBytes: 245000,
      mimeType: 'application/pdf',
      uploadedBy: brandOwnerUser._id,
      confidentialityLevel: 'deal_room_only',
      verificationStatus: 'reviewed_by_adviser',
      verifiedBy: adviserUser._id,
      verifiedAt: new Date(),
      notes: 'Verified against IP India official public registry portal.',
    },
    {
      entityType: 'brand',
      entityId: brand1._id,
      claim: 'FY2024-2025 Audited Consolidated Financial Statements showing 22% Store EBITDA margin',
      category: 'financial',
      fileName: 'FY25-Audited-Accounts.pdf',
      fileUrl: '/uploads/sample-audited-financials.pdf',
      fileSizeBytes: 1850000,
      mimeType: 'application/pdf',
      uploadedBy: brandOwnerUser._id,
      confidentialityLevel: 'deal_room_only',
      verificationStatus: 'reviewed_by_adviser',
      verifiedBy: adviserUser._id,
      verifiedAt: new Date(),
      notes: 'Audited by B.K. Shah & Associates Chartered Accountants.',
    },
    {
      entityType: 'brand',
      entityId: brand1._id,
      claim: 'Central Commissary Recipe Standardization and Vacuum-pack cold chain distribution active',
      category: 'operations',
      fileName: 'Commissary-ColdChain-Logistics-Audit.pdf',
      fileUrl: '/uploads/sample-commissary-audit.pdf',
      fileSizeBytes: 950000,
      mimeType: 'application/pdf',
      uploadedBy: brandOwnerUser._id,
      confidentialityLevel: 'internal_only',
      verificationStatus: 'supported_by_evidence',
      verifiedBy: opsSpecialist._id,
      verifiedAt: new Date(),
      notes: 'Supply chain audit verified by Operations Specialist.',
    },
  ]);

  // 5. Readiness Gaps (Completed/Closed)
  await ReadinessGap.create([
    {
      brandId: brand1._id,
      dimension: 'operating_repeatability',
      title: 'Digitization of Master Masala & Sauce Commissary Production SOPs',
      description: 'Document step-by-step weighing, batching, and QC testing before dispatch to outlets.',
      severity: 'high',
      assignedTo: opsSpecialist._id,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'closed',
      closureNotes: 'Completed in SOP-OPS-003 and validated during physical kitchen inspection.',
      closedBy: adviserUser._id,
      closedAt: new Date(),
    },
    {
      brandId: brand1._id,
      dimension: 'legal_preparation',
      title: 'DPDP Data Privacy Addendum for Loyalty Customers and Franchise Staff',
      description: 'Ensure franchisee data collection complies with Digital Personal Data Protection Act 2023.',
      severity: 'critical',
      assignedTo: externalCounsel._id,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'closed',
      closureNotes: 'Counsel drafted schedule attached to Franchise Agreement draft v1.2.',
      closedBy: externalCounsel._id,
      closedAt: new Date(),
    },
  ]);

  // 6. Approval Gates (All 4 Approved)
  await ReadinessGate.create([
    {
      brandId: brand1._id,
      gateType: 'operations_gate',
      status: 'approved',
      approverId: opsSpecialist._id,
      approvedAt: new Date(),
      comments: 'Full operating manuals drafted and verified across dine-in and express models.',
      blockingReasons: [],
    },
    {
      brandId: brand1._id,
      gateType: 'commercial_gate',
      status: 'approved',
      approverId: adviserUser._id,
      approvedAt: new Date(),
      comments: 'Unit economics audited and transparent assumption ledger verified.',
      blockingReasons: [],
    },
    {
      brandId: brand1._id,
      gateType: 'legal_gate',
      status: 'approved',
      approverId: externalCounsel._id,
      approvedAt: new Date(),
      comments: 'Legal readiness checklist completed for India jurisdiction; Franchise Agreement vetted.',
      blockingReasons: [],
    },
    {
      brandId: brand1._id,
      gateType: 'brand_owner_gate',
      status: 'approved',
      approverId: brandOwnerUser._id,
      approvedAt: new Date(),
      comments: 'Managing Partner sign-off confirmed on investment requirements and investor teaser pack.',
      blockingReasons: [],
    },
  ]);

  // 7. SOP Library
  await SOP.create([
    {
      brandId: brand1._id,
      code: 'SOP-OPS-001',
      title: 'Daily Store Opening & Morning Station Readiness',
      category: 'Opening & Closing',
      outletFormat: ['Dine-In Flagship', 'QSR / Express'],
      ownerId: opsSpecialist._id,
      currentVersion: '1.2.0',
      status: 'approved',
      contentMarkdown: `# Daily Store Opening & Station Readiness

## 1. Objective
Establish standard procedure for opening outlets 60 minutes prior to customer service to ensure equipment safety, sanitization, and ingredient prep.

## 2. Responsibilities
- **Shift Manager**: Overall sign-off on opening checklist.
- **Barista / Tea Master**: Boiler calibration, milk temperature check, fresh leaf inventory.
- **Station Cook**: Griddle heatup, chutneys temp check (< 4°C), samosa warmer verification.

## 3. Step-by-Step Procedure
1. Disarm alarm system and inspect perimeter for security anomalies.
2. Turn on main exhaust hoods and kitchen ventilation.
3. Power on tea boilers; allow water temperature to stabilize at 94°C.
4. Perform daily sanitization of food contact surfaces using Food-grade Quat Solution.
5. Calibrate POS terminal, verify internet link, and count starting cash float (₹5,000).
`,
      effectiveDate: new Date('2025-01-01'),
      nextReviewDate: new Date('2026-01-01'),
      approvedBy: opsSpecialist._id,
      approvedAt: new Date(),
      versionHistory: [
        {
          version: '1.0.0',
          contentMarkdown: 'Initial opening checklist draft.',
          summary: 'Created initial baseline',
          changedBy: opsSpecialist._id,
          changedAt: new Date('2024-10-10'),
        },
        {
          version: '1.2.0',
          contentMarkdown: 'Updated with POS float verification and boiler temp calibration.',
          summary: 'Refined temperature controls',
          changedBy: opsSpecialist._id,
          changedAt: new Date('2025-01-01'),
          approvedBy: opsSpecialist._id,
          approvedAt: new Date('2025-01-01'),
        },
      ],
    },
    {
      brandId: brand1._id,
      code: 'SOP-QC-002',
      title: 'Artisanal Chai Brewing & Batch Extraction Standards',
      category: 'Quality Control',
      outletFormat: ['Dine-In Flagship', 'QSR / Express', 'Kiosk'],
      ownerId: opsSpecialist._id,
      currentVersion: '1.0.0',
      status: 'approved',
      contentMarkdown: `# Artisanal Chai Brewing & Batch Extraction

## 1. Specifications
- Tea leaves to water ratio: 45 grams CTC Grade-A blend per 1,000 ml filtered RO water.
- Whole spices: 8g crushed green cardamom, 12g freshly pounded ginger, 4g cinnamon bark.
- Simmer time: Exactly 6.5 minutes post boiling.
- Holding time: Maximum 45 minutes in insulated thermal urns at 82°C. Discard batch if held over 45 minutes.
`,
      effectiveDate: new Date('2025-02-01'),
      nextReviewDate: new Date('2026-02-01'),
      approvedBy: opsSpecialist._id,
      approvedAt: new Date(),
      versionHistory: [
        {
          version: '1.0.0',
          contentMarkdown: 'Standard brewing formula.',
          summary: 'Approved release',
          changedBy: opsSpecialist._id,
          changedAt: new Date('2025-02-01'),
          approvedBy: opsSpecialist._id,
          approvedAt: new Date('2025-02-01'),
        },
      ],
    },
  ]);

  // 8. Legal Readiness Matter
  const indiaChecklist = LegalService.getJurisdictionChecklist('India');
  await LegalMatter.create({
    brandId: brand1._id,
    jurisdiction: 'India',
    matterType: 'Franchise Agreement',
    assignedCounselId: externalCounsel._id,
    status: 'counsel_review_recorded',
    checklist: indiaChecklist.map((c) => ({
      itemKey: c.itemKey,
      title: c.title,
      isMandatory: c.isMandatory,
      isCompleted: true,
      notes: 'Verified and drafted into standard bilateral package.',
    })),
    documents: [
      {
        title: 'Master Unit Franchise Agreement - India v1.2',
        version: '1.2',
        fileUrl: '/uploads/sample-unit-franchise-agreement.pdf',
        uploadedBy: externalCounsel._id,
        uploadedAt: new Date(),
        status: 'counsel_cleared',
        reviewerNotes: 'Approved for investor disclosure under confidentiality terms.',
      },
    ],
    counselReviewScope:
      'Comprehensive review of IP licensing clauses, territorial non-compete within 3km radius, DPDP customer data ownership, and dispute arbitration in Mumbai.',
    counselSignoffDate: new Date(),
    counselNotes:
      'Document package adheres to Indian Contract Act 1872 and complies with current IP and DPDP statutory frameworks.',
  });

  // 9. Expansion Proposition & Financial Assumption Ledger
  await ExpansionProposition.create({
    brandId: brand1._id,
    franchiseModel: 'Multi-Unit Development',
    targetGeography: {
      countries: ['India'],
      tier1Cities: ['Mumbai', 'Delhi NCR', 'Bengaluru'],
      tier2Cities: ['Pune', 'Ahmedabad', 'Hyderabad'],
      regions: ['West', 'South', 'North'],
    },
    minimumUnits: 2,
    developmentPeriodMonths: 24,
    fees: {
      franchiseFee: 1500000,
      initialSetupEstimate: 4500000,
      workingCapitalRequirement: 800000,
      royaltyPercentage: 6,
      marketingFundPercentage: 2,
      currency: 'INR',
    },
    financialAssumptions: [
      {
        parameter: 'Average Store Capex (Turnkey Fitout & Equipment)',
        amount: 4500000,
        currency: 'INR',
        classification: 'historical_actual',
        source: 'Lower Parel Express Store Build Invoices (Nov 2022)',
        asOfDate: new Date('2022-11-15'),
        notes: 'Includes kitchen equipment, HVAC, POS, and interior decor.',
      },
      {
        parameter: 'Average Monthly Gross Revenue',
        amount: 2000000,
        currency: 'INR',
        classification: 'historical_actual',
        source: 'POS Consolidated Outlets FY2024-25',
        asOfDate: new Date('2025-03-31'),
        notes: 'Blended average across high-street and corporate tech-park formats.',
      },
      {
        parameter: 'Store Operating Margin (EBITDA)',
        amount: 22,
        currency: '%',
        classification: 'historical_actual',
        source: 'Audited P&L Statements FY2025',
        asOfDate: new Date('2025-03-31'),
        notes: 'Post food cost (32%), labor (18%), and rent (16%).',
      },
      {
        parameter: 'Projected Store Breakeven Period',
        amount: 6,
        currency: 'Months',
        classification: 'management_assumption',
        source: 'Ricoz Expansion Financial Model v3.1',
        asOfDate: new Date(),
        notes: 'Estimate based on 80% target revenue ramp in month 4.',
      },
    ],
    investorFacingTeaser: {
      headline: 'High-Margin Artisanal QSR Concept with Proven Unit Economics and Supply Chain',
      summaryDescription:
        'Rapidly growing beverage and snack brand with 3 flagship outlets, 22% Store EBITDA margin, central commissary recipe consistency, and full digital SOP playbook.',
      keyHighlights: [
        'Turnkey multi-unit expansion model (2-3 outlets)',
        'Class 43 Registered Trademark and Indian Contract Act compliant agreement',
        'Demonstrated ₹20 Lakh monthly store revenue with 22% EBITDA',
        'Proprietary cold-chain recipe supply eliminating kitchen skill dependency',
      ],
      targetPaybackMonths: '20 - 28 months',
      isApprovedByBrandOwner: true,
      approvedAt: new Date(),
    },
    status: 'active_for_matching',
  });

  // 10. Investor Profiles
  const investor1 = await Investor.create({
    name: 'Vikram Singhania',
    companyName: 'Apex Retail & Hospitality Ventures',
    email: 'vikram@apexventures.in',
    phone: '+91 99201 55667',
    source: 'brokerage_network',
    preferences: {
      targetSectors: ['Food & Beverage', 'Retail'],
      preferredLocations: ['Mumbai', 'Pune', 'Ahmedabad'],
      minBudget: 5000000,
      maxBudget: 20000000,
      currency: 'INR',
      targetTimingMonths: 3,
    },
    capability: {
      intendedRole: 'multi_unit_operator',
      maxUnitsCapacity: 4,
      existingOperatingExperienceYears: 8,
      sectorExperienceSummary:
        'Operated 5 successful QSR franchise outlets in Western India over 8 years with dedicated store management infrastructure.',
    },
    qualification: {
      financialReviewStatus: 'verified_by_adviser',
      verifiedBy: adviserUser._id,
      verifiedAt: new Date(),
      qualificationNotes: 'Net worth and liquid capital proof verified via certified CA certificate.',
    },
    assignedAdviserId: adviserUser._id,
    status: 'active',
  });

  // Create login user for Investor 1
  await User.create({
    name: 'Vikram Singhania',
    email: 'vikram@apexventures.in',
    passwordHash: investorPassword,
    role: ROLES.INVESTOR,
    investorId: investor1._id,
    organization: 'Apex Retail Ventures',
    phone: '+91 99201 55667',
  });

  const investor2 = await Investor.create({
    name: 'Neha Sharma',
    companyName: 'Sharma Capital Growth LLP',
    email: 'neha@capitalpartners.in',
    phone: '+91 98330 88990',
    source: 'inbound_web',
    preferences: {
      targetSectors: ['Food & Beverage'],
      preferredLocations: ['Delhi NCR', 'Chandigarh'],
      minBudget: 3000000,
      maxBudget: 8000000,
      currency: 'INR',
      targetTimingMonths: 6,
    },
    capability: {
      intendedRole: 'hands_on_operator',
      maxUnitsCapacity: 1,
      existingOperatingExperienceYears: 3,
      sectorExperienceSummary: 'Former franchise outlet manager in national bakery chain.',
    },
    qualification: {
      financialReviewStatus: 'in_review',
      qualificationNotes: 'Awaiting updated bank balance verification.',
    },
    assignedAdviserId: adviserUser._id,
    status: 'active',
  });

  // 11. Match & Mutual Consent
  const prop = await ExpansionProposition.findOne({ brandId: brand1._id });

  const match1 = await Match.create({
    brandId: brand1._id,
    expansionPropositionId: prop?._id,
    investorId: investor1._id,
    adviserReviewStatus: 'adviser_approved',
    matchScore: 95,
    criteriaBreakdown: {
      sectorMatch: true,
      budgetMatch: true,
      geographyMatch: true,
      roleCapacityMatch: true,
      unmetCriteria: [],
      missingInfo: [],
    },
    adviserNotes:
      'Exceptional candidate. Experienced multi-unit operator with ₹2 Cr budget in primary target cluster (Mumbai/Pune).',
  });

  const consent1 = await Consent.create({
    matchId: match1._id,
    brandId: brand1._id,
    investorId: investor1._id,
    propositionPackVersion: '1.2',
    brandConsent: {
      status: 'granted',
      consentedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      consentedBy: brandOwnerUser._id,
    },
    investorConsent: {
      status: 'granted',
      consentedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      consentedBy: investor1._id,
    },
    overallStatus: 'mutual_consent_granted',
  });

  // 12. Private Deal Room
  const deal1 = await Deal.create({
    consentId: consent1._id,
    brandId: brand1._id,
    investorId: investor1._id,
    dealCode: 'DEAL-2026-001',
    stage: 'due_diligence',
    assignedAdviserId: adviserUser._id,
    participants: [
      { userId: adviserUser._id, role: 'brokerage', addedAt: new Date() },
      { userId: brandOwnerUser._id, role: 'brand', addedAt: new Date() },
    ],
    milestones: [
      { name: 'Mutual Consent & Disclosure Pack Shared', targetDate: new Date(), completed: true, completedAt: new Date() },
      { name: 'Commercial Discovery & Model Q&A Session', targetDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completed: true, completedAt: new Date() },
      { name: 'Site Selection & Territory Agreement (Bandra/Andheri)', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), completed: false },
      { name: 'Franchise Legal Agreement Vetting & Signing', targetDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), completed: false },
    ],
    nextAction: {
      description: 'Review territory demarcation map for proposed 2nd unit in Andheri West',
      assignedToRole: 'brokerage',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  consent1.dealRoomId = deal1._id as any;
  await consent1.save();

  // Shared documents in deal room
  await SharedDocument.create([
    {
      dealId: deal1._id,
      title: 'Chai & Chutney Unit Economics & Commissary Cost Model FY25',
      documentType: 'financial_model',
      version: '2.1',
      fileUrl: '/uploads/sample-financial-model.xlsx',
      accessRule: 'mutual_parties_only',
      sharedBy: adviserUser._id,
      accessLogs: [{ userId: adviserUser._id, action: 'view', timestamp: new Date() }],
    },
    {
      dealId: deal1._id,
      title: 'Bilateral Unit Franchise Agreement Draft (Mumbai Jurisdiction)',
      documentType: 'legal_pack',
      version: '1.2',
      fileUrl: '/uploads/sample-unit-franchise-agreement.pdf',
      accessRule: 'mutual_parties_only',
      sharedBy: externalCounsel._id,
      accessLogs: [{ userId: adviserUser._id, action: 'view', timestamp: new Date() }],
    },
  ]);

  // Due Diligence Q&A
  await DealQnA.create({
    dealId: deal1._id,
    question: 'What is the required lead time for central commissary ingredient dispatches to Pune outlets?',
    askedBy: brandOwnerUser._id,
    category: 'operational',
    assignedTo: adviserUser._id,
    status: 'answered',
    answer: 'Standard refrigerated vehicle dispatch is scheduled every Monday, Wednesday, and Friday morning (24-hour turnaround).',
    answeredBy: opsSpecialist._id,
    answeredAt: new Date(),
  });

  // Audit Logs
  await AuditLog.create([
    {
      actorId: adminUser._id,
      actorRole: ROLES.BROKERAGE_ADMIN,
      actorEmail: adminUser.email,
      action: 'SYSTEM_SEEDED',
      targetEntity: 'system',
      timestamp: new Date(),
    },
    {
      actorId: adviserUser._id,
      actorRole: ROLES.FRANCHISE_ADVISER,
      actorEmail: adviserUser.email,
      action: 'BRAND_APPROVED_FOR_OUTREACH',
      targetEntity: 'brand',
      targetId: brand1._id,
      newState: { status: 'approved_for_outreach' },
      timestamp: new Date(),
    },
    {
      actorId: adviserUser._id,
      actorRole: ROLES.FRANCHISE_ADVISER,
      actorEmail: adviserUser.email,
      action: 'MUTUAL_CONSENT_GRANTED',
      targetEntity: 'consent',
      targetId: consent1._id,
      newState: { overallStatus: 'mutual_consent_granted', dealCode: deal1.dealCode },
      timestamp: new Date(),
    },
  ]);

  console.log('--- Database Seeding Completed Successfully! ---');
  console.log(`Demo Logins:
  Brokerage Admin:      admin@ricoz.com     / Admin@123456
  Franchise Adviser:    adviser@ricoz.com   / Adviser@123456
  Operations Specialist:ops@ricoz.com       / Ops@123456
  External Legal Counsel:legal@franchisecounsel.in / Legal@123456
  Brand Owner:          founder@chaichutney.com / Brand@123456
  Prospective Investor: vikram@apexventures.in / Investor@123456
  `);
}

// Allow direct CLI execution: ts-node src/seed.ts
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
