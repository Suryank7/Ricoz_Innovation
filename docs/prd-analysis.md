# PRD Analysis & Requirement Extraction
## Franchise Development & Expansion Brokerage Platform

**Document Reference:** Franchise Development & Expansion Brokerage Platform PRD (v1.0, November 2026)  
**Target Market:** India (Configurable to US, UK, UAE, etc.)  
**Governing Standard:** Digital Personal Data Protection (DPDP) Act 2023 / Rules 2025 compliant design

---

### 1. Product Requirement Summary
The platform is a dedicated operating workspace for a specialized franchise advisory brokerage. It systematically guides emerging, established local brands through the expansion lifecycle:
1. **Evidence-backed Brand Readiness**: Assessing whether a brand is genuinely ready for multi-unit franchising across operations, unit economics, IP/brand, management capacity, and legal readiness.
2. **SOP & Operational Knowledge Codification**: Cataloging functional procedures, tracking versions, routing for reviews, setting review schedules, and preparing exportable operating manuals.
3. **Jurisdiction-Specific Legal Readiness**: Moving away from the generic US FTC "FDD" assumption; structuring a verifiable legal document register (agreements, disclosures, trademarks) with counsel-attributed reviews, explicit scopes, and legal actions.
4. **Transparent Expansion Propositions**: Structuring franchise models (single-unit, multi-unit, area developer, master franchise), financial breakdowns (fees, setup, working capital, royalties), and rigorously separating verified historical actuals from projections and estimates.
5. **Investor Profiling & Qualification**: Profiling investors based on capital, intended role (operator vs passive), geographic reach, and multi-unit capacity, with human-reviewed qualification.
6. **Double-Blind Consent-Based Introductions**: Rules-based matching with transparent scoring explanations. Crucially, **contact details and brand identity remain protected** until both the brand and the investor mutually consent to the specific opportunity pack.
7. **Secure Private Deal Room**: Facilitating due diligence, shared document versioning, access logging, Q&A, and transaction stage progression through to closing or managed decline.

---

### 2. User-Role Matrix & Authorization Boundaries

| Role Code | Role Name | Primary Responsibilities | Access Scope & Tenant Boundaries |
| :--- | :--- | :--- | :--- |
| `brokerage_admin` | Brokerage Administrator | Workspace management, team accounts, pipeline templates, audit logs, portfolio oversight. | Full brokerage workspace access; subject to audit logging. |
| `franchise_adviser` | Franchise Development Adviser | Owns brand engagements, conducts readiness reviews, coordinates workstreams, reviews matches, manages deals. | Assigned brands, qualified investors, assigned deals & documents. |
| `sop_specialist` | Operations Specialist | Audits brand processes, authors and structures SOPs, manages review cycles and manual exports. | Assigned brand SOPs & operational evidence. **No access** to investor financial records or deal terms. |
| `brand_owner` | Brand Owner / Manager | Completes intake, uploads operational/financial evidence, approves investor-facing proposition, gives introduction consent. | **Strictly isolated** to own brand workspace, own proposition, and consented deal rooms. Cannot see other brands or unconsented investors. |
| `external_counsel` | External Legal Reviewer | Reviews jurisdiction checklists, uploads legal commentary, reviews contracts/disclosures, logs sign-offs. | Time-limited, explicit assignment to specific brand legal matters. **No access** to unrelated commercial deals or investors. |
| `investor` | Prospective Franchisee / Investor | Sets investment criteria, role capacity, reviews approved opportunity teasers, grants consent, enters deal room. | Own profile, invited opportunity teasers, and active consented deal rooms. Cannot see other investors or private brand data prior to mutual consent. |
| `platform_admin` | System Administrator | System health, environment settings, security policy, raw audit review. | Least-privilege administrative access; all privileged actions logged. |

---

### 3. Functional Requirement Checklist (Traceability Matrix)

| ID | Requirement Description | Priority | Target Implementation Module |
| :--- | :--- | :--- | :--- |
| **BR-01** | Create & maintain brand engagement (entity, sector, locations, contacts) | P0 | Backend `BrandService` & Frontend Brand Workspace |
| **BR-02** | Multi-location outlet tracking with opening dates, format & evidence | P0 | Backend `BrandLocation` & Location Management UI |
| **BR-03** | Supporting evidence register with source, confidentiality & review status | P0 | Backend `EvidenceService` & Evidence Vault UI |
| **BR-04** | Status tracking for facts: self-reported, supported, reviewed, unresolved | P0 | Fact Verification Engine & Badge Indicators |
| **BR-05** | Readiness gap register with owners, due dates, and closure notes | P0 | Gap Remediation Tracker & Action Item Grid |
| **RA-01** | Assess 5 dimensions: Operations, Economics, Brand/IP, Mgmt, Legal | P0 | Readiness Assessment Service & Scorecard Component |
| **RA-02** | Configurable human approval gates before investor outreach | P0 | Approval Gate Workflow Engine (Hard Stop Validation) |
| **RA-03** | Blocker resolution panel showing open gaps and gate status | P0 | Brand Workspace Blocker Banner & Audit Check |
| **RA-04** | Historical assessment audit trail & comparison | P1 | Readiness Revision History Log |
| **SOP-01** | Process inventory by business function & outlet format | P0 | SOP Inventory Module with Search & Category Filters |
| **SOP-02** | SOP authoring/uploading with status, versioning & scope | P0 | SOP Editor/Viewer with Draft/In Review/Approved lifecycle |
| **SOP-03** | Routing for human approval with reviewer comments | P0 | SOP Review Workflow & Attributable Approvals |
| **SOP-04** | Effective date & next review date with overdue indicators | P0 | SOP Lifecycle Scheduler & Alert Badges |
| **SOP-05** | Checklists and training material links attached to SOPs | P1 | SOP Checklist & Asset Attachment Manager |
| **SOP-06** | Exportable operating manual / SOP pack | P1 | Structured JSON/Markdown/PDF Pack Exporter |
| **LEG-01** | Jurisdiction-tagged legal readiness checklist (e.g. India DPDP/Contracts) | P0 | Jurisdiction Checklist Engine with Pre-configured India Pack |
| **LEG-02** | Legal document store with immutable version history & reviewer stamp | P0 | Secure Document Store with Versioning |
| **LEG-03** | Action assignment to brand, brokerage or external counsel with comments | P0 | Legal Action Item Dispatcher & Comments Thread |
| **LEG-04** | External counsel isolated access permissions | P0 | Role-scoped Route Middleware & Matter Invitation Model |
| **LEG-05** | Review outcome tracking (Awaiting counsel, Changes requested, Review recorded) | P0 | Counsel Status Workflow (Strictly avoids automated "compliant" claim) |
| **LEG-06** | Jurisdiction template & clause library | P2 | Future Scope |
| **EXP-01** | Franchise expansion model & territory configuration (single/multi/master) | P0 | Expansion Proposition Configurator |
| **EXP-02** | Investment breakdown & recurring fee schedules | P0 | Capital Structure & Royalty Fee Schedule Builder |
| **EXP-03** | Financial fact labelling: Historical Actual vs Assumption vs Projection | P0 | Financial Assumption Ledger with Source & Date Metadata |
| **EXP-04** | Curated investor-facing opportunity teaser from approved fields | P0 | Public Teaser Generator (Gate-Enforced) |
| **EXP-05** | Scenario range modelling & transparent assumptions | P1 | Sensitivity & Scenario Range Viewer |
| **EXP-06** | Alternative expansion plan comparison | P2 | Future Scope |
| **INV-01** | Investor profile with contact details, source & lawful basis | P0 | Investor CRM Service & Profile Management |
| **INV-02** | Investment preferences (capital, geography, sector, timeline) | P0 | Structured Investor Preference Filter Model |
| **INV-03** | Operator role & multi-unit development capacity distinction | P0 | Investor Capability Matrix (Single/Multi/Area/Master/Passive) |
| **INV-04** | Operating experience and management capacity documentation | P0 | Track Record & Experience Assessment Panel |
| **INV-05** | Human-verified financial qualification status (not auto-inferred) | P0 | Financial Review Sign-off by Brokerage Adviser |
| **INV-06** | Contact timeline, meeting logs, follow-up task scheduler | P0 | Interaction Timeline & Next Action Tracker |
| **INV-07** | Investor self-service profile & withdrawal of interest | P1 | Investor Portal Profile & Opt-out Controls |
| **MAT-01** | Rules-based investor filtering against approved brand criteria | P0 | Matching Engine (Sector, Budget, City, Role, Capacity) |
| **MAT-02** | Transparent match explanation (criteria met/unmet/missing) | P0 | Match Explanation Card & Breakdown |
| **MAT-03** | Adviser review required before introduction proposal | P0 | Brokerage Pre-screening Gate |
| **MAT-04** | Mutual double-blind consent workflow before contact disclosure | P0 | Two-Way Consent Handshake Engine |
| **MAT-05** | Structured rejection reason tracking | P1 | Match Dismissal / Disqualification Audit |
| **MAT-06** | Configurable weighted scoring criteria | P1 | Scoring Weight Configuration Panel |
| **DEAL-01**| Multi-stage deal progression with owners, timestamps & next steps | P0 | Deal Pipeline Kanban & Stage Progression Manager |
| **DEAL-02**| Private Deal Room created only after mutual consent | P0 | Deal Room Space with Controlled Access |
| **DEAL-03**| Approved document disclosure register with access logging | P0 | Deal Room Document Vault with View/Download Auditing |
| **DEAL-04**| Due diligence Q&A tracking with assignees & due dates | P1 | Due Diligence Q&A Thread |
| **DEAL-05**| Deal closing, pause or managed decline with structured reasons | P0 | Deal Outcome Resolution Modal & Reporting Flag |
| **DEAL-06**| Deal activity history export | P1 | Deal Room Audit Log Exporter |
| **OPS-01** | Portfolio dashboard showing brands by stage, adviser, sector | P0 | Executive Portfolio Dashboard & Metric Cards |
| **OPS-02** | Blocker overview (unresolved gaps, overdue SOPs, legal reviews) | P0 | Operations Alert & Blocker Desk |
| **OPS-03** | Investor pipeline, match velocity & deal conversion analytics | P0 | Pipeline Funnel & Stage Duration Analytics |
| **OPS-04** | Role & Permission RBAC management with audit logging | P0 | User Administration & Access Control Panel |
| **OPS-05** | Immutable system-wide audit trail for all critical actions | P0 | Centralized Audit Log Service & Inspection Viewer |
| **OPS-06** | Operational data export (CSV/JSON) | P1 | Report Generation & Export Utility |

---

### 4. Core User Journeys

#### Journey 1: Brand Onboarding to Expansion Readiness
1. Brokerage Adviser creates a Brand record (`BR-01`) and sets up locations (`BR-02`).
2. Brand Owner is invited to access their private workspace and upload operational/financial evidence (`BR-03`).
3. Adviser records facts, categorizing each as *Self-Reported*, *Supported by Evidence*, *Reviewed*, or *Unresolved* (`BR-04`).
4. Adviser & Operations team perform Readiness Assessment across 5 dimensions (`RA-01`).
5. Identified deficiencies are logged as Readiness Gaps (`BR-05`) with owners and due dates.
6. Operations Specialist inventories SOPs (`SOP-01`), drafts procedures (`SOP-02`), routes them for approval (`SOP-03`), and locks effective dates (`SOP-04`).
7. Legal Reviewer conducts jurisdiction checklist (`LEG-01`), reviews agreements, records scope and comments (`LEG-03`, `LEG-05`).
8. Adviser and Brand Owner build the Expansion Proposition (`EXP-01`), structuring fees (`EXP-02`) and labelling financial assumptions (`EXP-03`).
9. Human Approval Gates (`RA-02`): Operations Gate, Legal Review Gate, Financial Gate, and Brand Owner Gate must all be signed off before the brand is marked `Approved for Outreach`.

#### Journey 2: Investor Qualification, Matching & Consent-Based Introduction
1. Adviser registers an Investor profile (`INV-01`), capturing financial capacity, geographic preference, sector interest, and operator role (`INV-02`, `INV-03`).
2. Adviser reviews evidence and sets human-verified status (`INV-04`, `INV-05`).
3. Matching Engine compares approved brand propositions with qualified investors (`MAT-01`), producing a transparent criteria checklist (`MAT-02`).
4. Adviser reviews match shortlist (`MAT-03`). An introduction cannot be initiated without adviser validation.
5. Double-Blind Consent Handshake:
   - System sends blinded teaser (no brand direct contact, no investor direct contact) to Brand Owner and Investor.
   - Brand Owner approves disclosure of their brand pack to this investor.
   - Investor approves disclosure of their profile and intent.
   - Only when **both consents are recorded** (`MAT-04`), the system unlocks contact details and provisions a Private Deal Room (`DEAL-02`).

#### Journey 3: Deal Room Management & Due Diligence
1. Brand Owner, Investor, and assigned Brokerage Adviser access the Private Deal Room.
2. Adviser shares approved legal pack, financial model, and unit economics (`DEAL-03`).
3. Accesses, downloads, and views are recorded in the audit trail (`OPS-05`).
4. Due diligence Q&A is managed through structured inquiry threads (`DEAL-04`).
5. Deal progresses through stages (`DEAL-01`): Initial Discovery -> Due Diligence -> Terms Negotiation -> Agreement Review -> Awarded / Closed Won (or Paused / Declined with recorded reason `DEAL-05`).

---

### 5. Key Business Rules & Workflow Guardrails

1. **Gate Invariance**: A brand can NEVER be marked `Approved for Investor Outreach` until:
   - All 5 readiness dimensions pass human review.
   - All critical readiness gaps are closed.
   - Legal counsel has recorded formal review for the designated jurisdiction.
   - Brand owner has confirmed and approved the investor-facing proposition.
2. **Double-Blind Privacy Principle**:
   - Matching never directly exposes an investor's contact info to a brand or vice versa.
   - Mutual consent must be captured with cryptographic timestamps before identity unmasking.
3. **No Automated Legal Opinions**:
   - The platform never marks a document "Legally Compliant" automatically. Only statuses like `Awaiting Counsel`, `Changes Requested`, and `Counsel Review Recorded` are allowed.
4. **Financial Truth in Advertising**:
   - Every financial number in an expansion proposition must carry an explicit badge: `Historical Actual`, `Management Assumption`, or `Projected Model`, along with source and effective date.
5. **Multi-Unit Capability vs Capital**:
   - An investor with $500k is not automatically qualified for a multi-unit franchise unless their operating experience and management capacity are human-validated.
6. **Immutable Audit Trails**:
   - No deletion of historical agreements, audit events, or deal progression logs. Deletions are soft-archived with recorded reasons.

---

### 6. Technical Risks & Mitigations

| Risk | Impact | Architectural Mitigation |
| :--- | :--- | :--- |
| **Data Leakage Across Brands/Investors** | High | Tenant boundary enforcement in API services: Every database query enforces `{ brandId }` or `{ dealId }` against the authenticated session token. Brand owners cannot query generic brand endpoints. |
| **Premature Outreach / Unapproved Claims** | High | Hard-stop gate validation in backend `OpportunityService`. Attempting to set an opportunity to `Active` throws HTTP 422 if approval gates are incomplete. |
| **Sensitive File Exfiltration** | Medium | No direct public static file serving. All file downloads route through authenticated streaming or short-lived signed URLs with download audit logging. |
| **Database Lock-in or MongoDB Sync Issues** | Low | Mongoose with strict schema typing, compound indexes for fast lookups, and transactional operations on multi-stage transitions. |
