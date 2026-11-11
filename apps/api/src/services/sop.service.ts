import { SOP, ISOP } from '../models/sop.model';
import { AuditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';

export class SOPService {
  static async listSOPs(filter: any = {}) {
    return SOP.find(filter)
      .populate('ownerId', 'name email')
      .populate('approvedBy', 'name email')
      .populate('brandId', 'name')
      .sort({ updatedAt: -1 });
  }

  static async getBrandSOPs(brandId: string, filter: any = {}) {
    return SOP.find({ brandId, ...filter })
      .populate('ownerId', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ code: 1 });
  }

  static async getSOPById(id: string) {
    const sop = await SOP.findById(id)
      .populate('ownerId', 'name email')
      .populate('approvedBy', 'name email')
      .populate('versionHistory.changedBy', 'name email')
      .populate('versionHistory.approvedBy', 'name email');
    if (!sop) throw new AppError('SOP not found', 404);
    return sop;
  }

  static async createSOP(data: Partial<ISOP>, actor: any) {
    const sop = new SOP({
      ...data,
      ownerId: actor.userId,
      currentVersion: '1.0.0',
      status: 'draft',
      versionHistory: [
        {
          version: '1.0.0',
          contentMarkdown: data.contentMarkdown || '',
          summary: 'Initial draft created',
          changedBy: actor.userId,
          changedAt: new Date(),
        },
      ],
    });
    await sop.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'SOP_CREATED',
      targetEntity: 'sop',
      targetId: sop._id as any,
      newState: sop.toObject(),
    });

    return sop;
  }

  static async updateSOP(id: string, updateData: { contentMarkdown: string; summary?: string }, actor: any) {
    const sop = await SOP.findById(id);
    if (!sop) throw new AppError('SOP not found', 404);

    const prev = sop.toObject();
    const versionParts = sop.currentVersion.split('.').map(Number);
    versionParts[2] = (versionParts[2] || 0) + 1;
    const newVersion = versionParts.join('.');

    sop.contentMarkdown = updateData.contentMarkdown;
    sop.currentVersion = newVersion;
    if (sop.status === 'approved') {
      sop.status = 'draft'; // Editing an approved SOP requires re-review
    }

    sop.versionHistory.push({
      version: newVersion,
      contentMarkdown: updateData.contentMarkdown,
      summary: updateData.summary || `Updated to version ${newVersion}`,
      changedBy: actor.userId,
      changedAt: new Date(),
    });

    await sop.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'SOP_UPDATED',
      targetEntity: 'sop',
      targetId: sop._id as any,
      previousState: prev,
      newState: sop.toObject(),
    });

    return sop;
  }

  static async routeForReview(id: string, actor: any) {
    const sop = await SOP.findById(id);
    if (!sop) throw new AppError('SOP not found', 404);

    sop.status = 'in_review';
    await sop.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'SOP_ROUTED_FOR_REVIEW',
      targetEntity: 'sop',
      targetId: sop._id as any,
      newState: { status: 'in_review' },
    });

    return sop;
  }

  static async approveSOP(
    id: string,
    data: { effectiveDate?: Date; nextReviewDate?: Date; reviewNotes?: string },
    actor: any
  ) {
    const sop = await SOP.findById(id);
    if (!sop) throw new AppError('SOP not found', 404);

    sop.status = 'approved';
    sop.approvedBy = actor.userId;
    sop.approvedAt = new Date();
    sop.effectiveDate = data.effectiveDate || new Date();
    sop.nextReviewDate =
      data.nextReviewDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year review cycle
    sop.reviewNotes = data.reviewNotes;

    const latestVersion = sop.versionHistory[sop.versionHistory.length - 1];
    if (latestVersion) {
      latestVersion.approvedBy = actor.userId;
      latestVersion.approvedAt = new Date();
      latestVersion.approvalNotes = data.reviewNotes;
    }

    await sop.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'SOP_APPROVED',
      targetEntity: 'sop',
      targetId: sop._id as any,
      newState: {
        status: 'approved',
        version: sop.currentVersion,
        effectiveDate: sop.effectiveDate,
        nextReviewDate: sop.nextReviewDate,
      },
    });

    return sop;
  }

  static async exportOperatingManual(brandId: string) {
    const sops = await SOP.find({ brandId, status: 'approved' }).sort({ category: 1, code: 1 });
    return {
      brandId,
      exportDate: new Date(),
      totalApprovedSOPs: sops.length,
      sections: sops.map((s) => ({
        code: s.code,
        title: s.title,
        category: s.category,
        version: s.currentVersion,
        effectiveDate: s.effectiveDate,
        contentMarkdown: s.contentMarkdown,
      })),
    };
  }
}
