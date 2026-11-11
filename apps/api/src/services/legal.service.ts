import { LegalMatter, ILegalMatter } from '../models/legal-matter.model';
import { AuditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';

export const JURISDICTION_CHECKLIST_TEMPLATES: Record<string, Array<{ itemKey: string; title: string; isMandatory: boolean }>> = {
  India: [
    { itemKey: 'trademark_class_registered', title: 'Trademark Registration in relevant Nice Classes (e.g. Class 35, 43)', isMandatory: true },
    { itemKey: 'franchise_agreement_india', title: 'Indian Contract Act Compliant Unit Franchise Agreement', isMandatory: true },
    { itemKey: 'dpdp_compliance', title: 'Digital Personal Data Protection (DPDP) Customer & Franchisee Data Terms', isMandatory: true },
    { itemKey: 'commercial_disclosure_pack', title: 'Standard Commercial Disclosure & Unit Economics Pack', isMandatory: true },
    { itemKey: 'ip_licensing_royalty_clause', title: 'IP Licensing, Quality Control & Royalty Remittance Provisions', isMandatory: true },
    { itemKey: 'territory_exclusivity_charter', title: 'Territory Definition & Radius Protection Schedule', isMandatory: false },
    { itemKey: 'dispute_arbitration_india', title: 'Arbitration Agreement under Arbitration & Conciliation Act', isMandatory: true },
  ],
  'United States': [
    { itemKey: 'ftc_fdd_23_items', title: 'FTC Franchise Rule 23-Item Franchise Disclosure Document (FDD)', isMandatory: true },
    { itemKey: 'state_registration_filings', title: 'Franchise Registration in applicable Franchise Regulated States', isMandatory: true },
    { itemKey: 'uspto_trademark', title: 'USPTO Principal Register Trademark Filing / Registration', isMandatory: true },
    { itemKey: 'item_19_financial_representation', title: 'Item 19 Financial Performance Representation (FPR) Documentation', isMandatory: false },
  ],
  'United Kingdom': [
    { itemKey: 'bfa_code_ethics', title: 'British Franchise Association (bfa) Code of Ethics Compliance', isMandatory: true },
    { itemKey: 'uk_gdpr_data', title: 'UK GDPR & Data Protection Act 2018 Policies', isMandatory: true },
    { itemKey: 'uk_franchise_contract', title: 'Standard UK Franchise Master / Unit Agreement', isMandatory: true },
  ],
  UAE: [
    { itemKey: 'commercial_agencies_law', title: 'Federal Law on Commercial Agencies Compliance Verification', isMandatory: true },
    { itemKey: 'trademark_ministry_economy', title: 'UAE Ministry of Economy Trademark Registration', isMandatory: true },
    { itemKey: 'bilingual_franchise_contract', title: 'Arabic/English Certified Franchise Agreement & Disclosure', isMandatory: true },
  ],
};

export class LegalService {
  static getJurisdictionChecklist(jurisdiction: string) {
    return JURISDICTION_CHECKLIST_TEMPLATES[jurisdiction] || JURISDICTION_CHECKLIST_TEMPLATES['India'];
  }

  static async listMatters(filter: any = {}, actor: any) {
    const query: any = { ...filter };
    if (actor.role === 'external_counsel') {
      query.assignedCounselId = actor.userId;
    }
    return LegalMatter.find(query)
      .populate('assignedCounselId', 'name email organization')
      .populate('brandId', 'name')
      .sort({ updatedAt: -1 });
  }

  static async getMatterById(id: string, actor: any) {
    const matter = await LegalMatter.findById(id)
      .populate('assignedCounselId', 'name email organization')
      .populate('brandId', 'name');
    if (!matter) throw new AppError('Legal matter not found', 404);

    if (actor.role === 'external_counsel' && String(matter.assignedCounselId?._id) !== actor.userId) {
      throw new AppError('Forbidden: Access limited to your specifically assigned legal matters.', 403);
    }
    return matter;
  }

  static async createMatter(brandId: string, data: any, actor: any) {
    const defaultChecklist = LegalService.getJurisdictionChecklist(data.jurisdiction || 'India');
    const matter = new LegalMatter({
      brandId,
      jurisdiction: data.jurisdiction || 'India',
      matterType: data.matterType || 'Franchise Agreement',
      assignedCounselId: data.assignedCounselId,
      status: 'in_preparation',
      checklist: defaultChecklist.map((c) => ({
        itemKey: c.itemKey,
        title: c.title,
        isMandatory: c.isMandatory,
        isCompleted: false,
      })),
      documents: [],
    });
    await matter.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'LEGAL_MATTER_CREATED',
      targetEntity: 'legal_matter',
      targetId: matter._id as any,
      newState: matter.toObject(),
    });

    return matter;
  }

  static async updateChecklistItem(matterId: string, itemKey: string, isCompleted: boolean, notes: string, actor: any) {
    const matter = await LegalMatter.findById(matterId);
    if (!matter) throw new AppError('Legal matter not found', 404);

    const item = matter.checklist.find((c) => c.itemKey === itemKey);
    if (!item) throw new AppError('Checklist item not found', 404);

    item.isCompleted = isCompleted;
    if (notes) item.notes = notes;
    await matter.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'LEGAL_CHECKLIST_UPDATED',
      targetEntity: 'legal_matter',
      targetId: matter._id as any,
      newState: { itemKey, isCompleted, notes },
    });

    return matter;
  }

  static async uploadLegalDocument(matterId: string, fileData: any, title: string, version: string, actor: any) {
    const matter = await LegalMatter.findById(matterId);
    if (!matter) throw new AppError('Legal matter not found', 404);

    matter.documents.push({
      title: title || fileData.originalname,
      version: version || '1.0',
      fileUrl: `/uploads/${fileData.filename || fileData.originalname}`,
      uploadedBy: actor.userId,
      uploadedAt: new Date(),
      status: 'under_counsel_review',
    });
    matter.status = 'awaiting_counsel';
    await matter.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'LEGAL_DOCUMENT_UPLOADED',
      targetEntity: 'legal_matter',
      targetId: matter._id as any,
      newState: { title, version },
    });

    return matter;
  }

  static async recordCounselReview(
    matterId: string,
    data: { status: 'counsel_review_recorded' | 'changes_requested'; counselReviewScope: string; counselNotes: string },
    actor: any
  ) {
    const matter = await LegalMatter.findById(matterId);
    if (!matter) throw new AppError('Legal matter not found', 404);

    matter.status = data.status;
    matter.counselReviewScope = data.counselReviewScope;
    matter.counselNotes = data.counselNotes;
    matter.counselSignoffDate = new Date();
    await matter.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'COUNSEL_REVIEW_RECORDED',
      targetEntity: 'legal_matter',
      targetId: matter._id as any,
      newState: {
        status: data.status,
        counselReviewScope: data.counselReviewScope,
        counselSignoffDate: matter.counselSignoffDate,
      },
    });

    return matter;
  }
}
