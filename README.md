# Ricoz — Franchise Development & Expansion Brokerage Platform

A production-grade, enterprise web application built for franchise advisory firms, emerging brands, and qualified investors. The platform streamlines the entire journey from **initial brand readiness evaluation**, **SOP codification**, and **jurisdiction-specific legal readiness**, through **double-blind consent-based matching** and **secure private deal rooms**.

---

## 🌟 Key Product Highlights

1. **Evidence-Backed Readiness Assessment & 4 Mandatory Human Gates**:
   - 5-Dimension Readiness Scorecard (Unit Economics, Operational Repeatability, Management Bandwidth, Financial Documentation, Legal & IP).
   - Brands cannot advance to investor outreach without explicit approval across **4 human gates**:
     1. Unit Economics Verification
     2. Operations & SOPs Readiness
     3. Legal Due Diligence & Disclosures
     4. Brand Owner Commercial Teaser Sign-off
   - Hard-stop barrier: `POST /api/v1/readiness/:brandId/approve-outreach` validates gate completeness and blocks bypassing.

2. **Operations & SOP Codification**:
   - Structured operational manual repository categorized across store opening, daily operations, food prep, inventory, and staff training.
   - Version history tracking, reviewer assignment, and human approval workflow.

3. **Jurisdiction-Aware Legal Readiness**:
   - Tailored checklist templates for **India (DPDP 2023 / Indian Contract Act / Consumer Protection Rules)**, **United States (FTC Rule 436 FDD)**, **United Kingdom (BFA Code of Ethics)**, and **United Arab Emirates (Commercial Agencies Law)**.
   - Strict legal guardrails: Platform never claims "legally compliant"; counsel reviews are recorded as `counsel_review_recorded` or `changes_requested`.

4. **Expansion Proposition & Financial Assumption Ledger**:
   - Explicit classification of all figures:
     - `historical_actual` (Verified P&L)
     - `management_assumption` (Target margins)
     - `projected_model` (Financial forecast)
   - Brand owner teaser review and sign-off tracking before investor exposure.

5. **Double-Blind Consent-Based Matching**:
   - Multi-criteria matching algorithm evaluating Sector match, Investment Budget, Geographic alignment, and Operational Capacity.
   - Initial review is completely anonymized (`INV-MUM-001` ↔ `BRD-FNB-992`).
   - Mutual consent handshake: Contact information (email, phone, company identity) is unmasked **only when both parties execute consent**.

6. **Audited Private Deal Rooms**:
   - Automatic Deal Room provisioning upon mutual consent.
   - Clickable pipeline stages: *Initial Contact → NDA Executed → Due Diligence → Commercial Negotiation → Legal Review → Closed Won*.
   - Audited document repository with view/download access logs.
   - Due diligence Q&A thread with inline adviser answering.

7. **Immutable Audit Trail & Multi-Tenant Isolation**:
   - Every state transition, gate review, document view, and matching proposal is written to an immutable audit ledger (`audit_logs` collection).
   - Strict tenant boundary: `enforceBrandTenant` middleware restricts brand owners strictly to their assigned brand data.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend API**: Node.js, Express.js, TypeScript, Mongoose ODM, JWT, Bcrypt, Multer, Zod.
- **Database**: MongoDB 8.2 (with fallback embedded in-memory database for seamless local development).
- **Architecture**: Clean Service-Oriented Architecture (Routes → Controllers → Services → Models → Audit Logger).

---

## 👥 Demo User Personas & Credentials

All demo accounts come pre-seeded with realistic data:

| Role | Email | Password | Persona & Responsibilities |
|---|---|---|---|
| **Brokerage Admin** | `admin@ricoz.com` | `Admin@123456` | Master administrator, human verification of net worth, global audit inspector |
| **Franchise Adviser** | `adviser@ricoz.com` | `Adviser@123456` | Lead consultant, readiness scoring, matching broker, deal room facilitator |
| **SOP Specialist** | `ops@ricoz.com` | `Ops@123456` | Operational codification, repeatability manuals, store procedure approval |
| **External Legal Counsel** | `legal@franchisecounsel.in` | `Legal@123456` | Jurisdiction checklist reviewer, FDD review recording, legal contingencies |
| **Brand Owner** | `founder@chaichutney.com` | `Brand@123456` | Founder of *Chai & Chutney Express*, tenant-isolated brand workspace & teaser sign-off |
| **Investor** | `vikram@apexventures.in` | `Investor@123456` | Verified multi-unit franchisee, blinded opportunity review, deal room participant |

> **Note**: You can switch roles instantaneously in the web application using the **Persona Switcher** in the top-right header, or using the 1-click login buttons on the `/login` screen.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ (tested on Node v22)
- MongoDB instance (or local `mongod` service)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/ricoz-franchise-platform.git
cd Ricoz

# Install dependencies across all npm workspaces
npm install
```

### 3. Environment Variables
Root `.env` and `apps/web/.env` are pre-configured with default local development values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ricoz_franchise
JWT_SECRET=franchise_super_secret_jwt_key_development_2026_x!982
UPLOAD_DIR=./uploads
CLIENT_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 4. Database Seeding
Compile the API and populate the database with complete demo fixtures (Chai & Chutney Express, SOPs, Legal Matters, Matches, Deal Rooms, Audit Logs):

```bash
# Build backend TypeScript
npm run build --workspace=apps/api

# Seed MongoDB
node apps/api/dist/seed.js
```

### 5. Starting the Application
You can start both backend and frontend concurrently:

```bash
# Run both Backend API (:5000) and Next.js Web (:3000)
npm run dev
```

Or run them individually:

```bash
# Terminal 1: Backend Express API
npm run dev --workspace=apps/api

# Terminal 2: Frontend Next.js Web App
npm run dev --workspace=apps/web
```

Access the frontend at: **`http://localhost:3000`**  
Access the backend API health probe at: **`http://localhost:5000/api/health`**

---

## 📁 Repository Structure

```
Ricoz/
├── apps/
│   ├── api/                     # Express.js REST API Backend
│   │   ├── src/
│   │   │   ├── config/          # Environment, Database, Constants
│   │   │   ├── controllers/     # Route request orchestrators (10 controllers)
│   │   │   ├── middlewares/     # JWT Auth, RBAC, Tenant Isolation, Multer, Zod
│   │   │   ├── models/          # Mongoose Schemas (14 domain models)
│   │   │   ├── routes/          # Express route definitions
│   │   │   ├── services/        # Business logic layer (Readiness, Matching, Deal, etc.)
│   │   │   ├── utils/           # Logger, Password, Token helpers
│   │   │   ├── validators/      # Zod validation schemas
│   │   │   ├── app.ts           # Express application configuration
│   │   │   ├── server.ts        # Server bootstrap
│   │   │   └── seed.ts          # Comprehensive demo seeder
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                     # Next.js 14 Frontend Application
│       ├── app/
│       │   ├── (auth)/login/    # Authentication with 1-click persona simulator
│       │   ├── (dashboard)/
│       │   │   ├── page.tsx     # Portfolio Executive Dashboard & Blocker Desk
│       │   │   ├── brands/      # Brand Catalog & 6-Tab Comprehensive Brand Workspace
│       │   │   ├── sops/        # Standard Operating Procedure Repository
│       │   │   ├── legal/       # Jurisdiction Legal Readiness Workspace
│       │   │   ├── investors/   # Investor CRM & Human Qualification Desk
│       │   │   ├── matches/     # Double-Blind Consent Inbox
│       │   │   ├── deals/       # Deal Pipeline Kanban & Interactive Deal Room
│       │   │   ├── reports/     # Conversion Funnel & Operational Metrics
│       │   │   └── settings/    # RBAC Permissions & Immutable Audit Ledger
│       │   ├── layout.tsx       # Root layout
│       │   └── globals.css      # Tailwind design system directives
│       ├── components/          # Reusable Sidebar, Header, Modals, Badges
│       ├── lib/                 # Centralized API client & Auth context
│       ├── tailwind.config.ts
│       └── next.config.js
│
├── docs/                        # Architecture & Engineering Specifications
│   ├── prd-analysis.md          # Comprehensive PRD breakdown & requirement matrix
│   ├── architecture.md          # System architecture & Mermaid sequence diagrams
│   ├── database-design.md       # MongoDB Schema interfaces & ER diagrams
│   └── api-documentation.md     # 50+ REST API endpoint specifications
│
├── .env.example
├── docker-compose.yml
└── package.json
```

---

## 🔒 Security & Compliance Standards

- **Tenant Boundary**: Enforced via `enforceBrandTenant()` middleware on all brand sub-resources.
- **DPDP 2023 Compliance**: Investors and Brand identities are anonymized prior to mutual consent execution.
- **Zero Hallucination Legal Rule**: AI or automated systems never grant legal certifications; only licensed legal counsel can record review outcomes.
- **Auditability**: Sensitive operations record actor ID, role, target entity, client IP, and full JSON payload change diff.
