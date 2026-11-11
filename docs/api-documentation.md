# RESTful API Specification (v1)
## Franchise Development & Expansion Brokerage Platform

**Base URL:** `http://localhost:5000/api/v1`  
**Authentication:** Bearer Token via Header `Authorization: Bearer <token>` or HttpOnly Session Cookie `token`.  
**Content-Type:** `application/json` (or `multipart/form-data` for file uploads)

---

### 1. Authentication & Session (`/api/v1/auth`)

| Method | Endpoint | Access | Description | Request Payload / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticates user; returns JWT & profile | `{ email, password }` |
| `POST` | `/auth/register` | Admin/Public | Registers a new user account | `{ name, email, password, role, brandId?, phone? }` |
| `GET` | `/auth/me` | Authenticated | Retrieves current authenticated session user | Headers with token |
| `POST` | `/auth/logout` | Authenticated | Clears session cookie | None |

---

### 2. Brand Engagements & Evidence (`/api/v1/brands`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/brands` | Brokerage / Admin | List all brand engagements with filtering by stage, sector, adviser |
| `POST` | `/brands` | Adviser / Admin | Create a new brand engagement record |
| `GET` | `/brands/:id` | Assigned / Owner | Retrieve complete brand workspace detail |
| `PUT` | `/brands/:id` | Adviser / Owner | Update brand details |
| `GET` | `/brands/:id/locations` | Assigned / Owner | List operating outlet locations |
| `POST` | `/brands/:id/locations` | Adviser / Owner | Add an operating outlet location |
| `GET` | `/brands/:id/evidence` | Assigned / Owner | List evidence register with claim validation statuses |
| `POST` | `/brands/:id/evidence` | Assigned / Owner | Upload and link evidence to a claim (multipart) |
| `PATCH` | `/brands/:id/evidence/:evidenceId/verify` | Adviser / Admin | Human verification status update (`supported`, `reviewed`, `unresolved`) |
| `GET` | `/brands/:id/gaps` | Assigned / Owner | List readiness gaps and action items |
| `POST` | `/brands/:id/gaps` | Adviser / Ops | Create a readiness deficiency/gap |
| `PATCH` | `/brands/:id/gaps/:gapId` | Adviser / Ops / Owner | Update gap status, closure notes, reviewer stamp |

---

### 3. Readiness Assessment & Approval Gates (`/api/v1/readiness`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/readiness/brands/:brandId` | Assigned / Owner | Retrieve 5-dimension scorecard and open blockers |
| `POST` | `/readiness/brands/:brandId/scorecard` | Adviser / Ops | Update assessment findings across dimensions |
| `GET` | `/readiness/brands/:brandId/gates` | Assigned / Owner | Get status of all 4 human approval gates |
| `POST` | `/readiness/brands/:brandId/gates/:gateType/approve` | Adviser / Legal / Owner | Formally sign off an approval gate with comments |
| `POST` | `/readiness/brands/:brandId/gates/:gateType/reject` | Adviser / Legal / Owner | Reject gate with blocking reasons |
| `POST` | `/readiness/brands/:brandId/request-outreach` | Adviser / Admin | Transition brand to `approved_for_outreach` (Enforces gate completeness) |

---

### 4. SOP & Operating Manuals (`/api/v1/sops`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/sops` | Brokerage / Specialist | List SOPs across brands with category and review date filters |
| `GET` | `/sops/brands/:brandId` | Assigned / Owner | List process inventory and SOPs for specific brand |
| `POST` | `/sops` | Specialist / Adviser | Create new SOP draft (title, category, outletFormat, markdown) |
| `GET` | `/sops/:id` | Assigned / Specialist | Get single SOP with complete version history |
| `PUT` | `/sops/:id` | Specialist / Owner | Update SOP content (generates new version increment) |
| `POST` | `/sops/:id/route-review` | Specialist / Owner | Transition status to `in_review` |
| `POST` | `/sops/:id/approve` | Adviser / Specialist | Formally approve SOP version, set effective & review dates |
| `GET` | `/sops/brands/:brandId/export` | Assigned / Owner | Export complete Operating Manual / SOP pack |

---

### 5. Legal Readiness & Jurisdiction Workspace (`/api/v1/legal`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/legal/matters` | Brokerage / Counsel | List legal matters (counsel sees only assigned matters) |
| `GET` | `/legal/matters/brands/:brandId` | Assigned / Owner / Counsel | Get legal matters for a specific brand |
| `POST` | `/legal/matters` | Adviser / Admin | Initialize a legal matter with jurisdiction checklist |
| `GET` | `/legal/matters/:id` | Assigned / Counsel | Get matter details, documents, checklist items |
| `PATCH` | `/legal/matters/:id/checklist/:itemKey`| Assigned / Counsel | Update completion of checklist item with doc link |
| `POST` | `/legal/matters/:id/documents` | Assigned / Counsel | Upload legal document draft/revision |
| `POST` | `/legal/matters/:id/counsel-review` | External Counsel | Record counsel review outcome (`counsel_review_recorded`, `changes_requested`) |
| `GET` | `/legal/jurisdictions` | Authenticated | List available jurisdiction packs (India, US, UK, UAE) |

---

### 6. Expansion Proposition & Assumptions (`/api/v1/expansion`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/expansion/brands/:brandId` | Assigned / Owner | Get expansion proposition and financial ledger |
| `POST` | `/expansion/brands/:brandId` | Adviser / Owner | Configure franchise model, fees, territory rules |
| `POST` | `/expansion/brands/:brandId/assumptions` | Adviser / Owner | Add verified financial assumption with type badge |
| `PATCH` | `/expansion/brands/:brandId/teaser` | Adviser / Owner | Update investor-facing teaser highlights |
| `POST` | `/expansion/brands/:brandId/brand-approve` | Brand Owner | Brand owner formally signs off on investor-facing pack |

---

### 7. Investor CRM & Qualification (`/api/v1/investors`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/investors` | Brokerage / Admin | List investor CRM profiles with filter criteria |
| `POST` | `/investors` | Adviser / Admin | Create new investor profile |
| `GET` | `/investors/:id` | Brokerage / Self | Get investor profile, preferences & capacity |
| `PUT` | `/investors/:id` | Brokerage / Self | Update investor preferences & timing |
| `POST` | `/investors/:id/qualification` | Adviser / Admin | Human verification of financial capacity & operator track record |
| `POST` | `/investors/:id/activities` | Brokerage | Log meeting, call, note or next follow-up task |

---

### 8. Matching & Double-Blind Consent (`/api/v1/matching`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/matching/evaluate/:brandId` | Adviser / Admin | Run rules-based matching for brand proposition against all qualified investors |
| `GET` | `/matching/brands/:brandId` | Adviser / Admin | View matched candidate shortlist with criteria breakdown |
| `POST` | `/matching/:matchId/adviser-propose` | Adviser | Brokerage adviser validates match and initiates double-blind consent request |
| `GET` | `/matching/consent-inbox` | Brand / Investor / Adviser | View pending consent requests (identities blinded!) |
| `POST` | `/matching/consent/:consentId/respond`| Brand / Investor | Grant or decline introduction consent (`brand` or `investor`) |

---

### 9. Private Deal Room & Pipeline (`/api/v1/deals`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/deals` | Brokerage / Consented | List deals in pipeline (investor/brand only sees their own) |
| `GET` | `/deals/:id` | Consented Parties | Access private deal room details, unmasked contacts, stages |
| `PATCH` | `/deals/:id/stage` | Adviser / Admin | Advance deal stage (`initial_meeting`, `due_diligence`, etc.) |
| `POST` | `/deals/:id/documents` | Consented Parties | Share approved document to deal room |
| `GET` | `/deals/:id/documents/:docId/download`| Consented Parties| Download shared document (audited and logged) |
| `GET` | `/deals/:id/qna` | Consented Parties | View Q&A threads |
| `POST` | `/deals/:id/qna` | Consented Parties | Submit due diligence question |
| `POST` | `/deals/:id/qna/:qnaId/answer` | Assigned Party | Answer due diligence inquiry |
| `POST` | `/deals/:id/close` | Adviser / Admin | Close deal (Won, Lost, Paused with structured reason) |

---

### 10. Portfolio Overview, Audits & Export (`/api/v1/portfolio`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/portfolio/summary` | Brokerage / Admin | Top-line metrics: active brands, blockers, deals, match conversion |
| `GET` | `/portfolio/blockers` | Brokerage / Admin | List unresolved readiness gaps and pending counsel reviews |
| `GET` | `/portfolio/audit-trail` | Admin / Platform Admin | Query system audit logs with filters |
| `GET` | `/portfolio/export` | Brokerage / Admin | Export operational metrics (JSON/CSV) |
