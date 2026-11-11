import { Brand } from '../models/brand.model';
import { ReadinessGate } from '../models/readiness-gate.model';
import { ReadinessGap } from '../models/readiness-gap.model';
import { LegalMatter } from '../models/legal-matter.model';
import { ExpansionProposition } from '../models/expansion.model';
import { AuditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import { GATE_TYPES } from '../config/constants';

export class ReadinessService {
  static async getBrandReadiness(brandId: string) {
    const brand = await Brand.findById(brandId);
    if (!brand) throw new AppError('Brand not found', 404);

    const gates = await ReadinessGate.find({ brandId }).populate('approverId', 'name email role');
    const openGaps = await ReadinessGap.find({ brandId, status: { $ne: 'closed' } });
    const criticalGaps = openGaps.filter((g) => g.severity === 'critical');

    return {
      readinessSummary: brand.readinessSummary,
      gates,
      openGapsCount: openGaps.length,
      criticalGapsCount: criticalGaps.length,
      isBlocked: openGaps.length > 0 || gates.some((g) => g.status !== 'approved'),
      blockingReasons: [
        ...criticalGaps.map((g) => `Critical Gap: ${g.title}`),
        ...gates.filter((g) => g.status !== 'approved').map((g) => `Gate Pending: ${g.gateType.replace('_', ' ').toUpperCase()}`),
      ],
    };
  }

  static async updateScorecard(brandId: string, scores: any, actor: any) {
    const brand = await Brand.findById(brandId);
    if (!brand) throw new AppError('Brand not found', 404);

    const prev = { ...brand.readinessSummary };
    brand.readinessSummary.operationsScore = scores.operationsScore ?? brand.readinessSummary.operationsScore;
    brand.readinessSummary.economicsScore = scores.economicsScore ?? brand.readinessSummary.economicsScore;
    brand.readinessSummary.brandIpScore = scores.brandIpScore ?? brand.readinessSummary.brandIpScore;
    brand.readinessSummary.managementScore = scores.managementScore ?? brand.readinessSummary.managementScore;
    brand.readinessSummary.legalScore = scores.legalScore ?? brand.readinessSummary.legalScore;

    const avg =
      (brand.readinessSummary.operationsScore +
        brand.readinessSummary.economicsScore +
        brand.readinessSummary.brandIpScore +
        brand.readinessSummary.managementScore +
        brand.readinessSummary.legalScore) /
      5;

    if (avg >= 80) {
      brand.readinessSummary.overallStatus = 'franchise_ready';
    } else if (avg >= 50) {
      brand.readinessSummary.overallStatus = 'conditional';
    } else {
      brand.readinessSummary.overallStatus = 'not_ready';
    }

    await brand.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'READINESS_SCORES_UPDATED',
      targetEntity: 'brand',
      targetId: brand._id as any,
      previousState: prev,
      newState: brand.readinessSummary,
    });

    return brand.readinessSummary;
  }

  static async approveGate(brandId: string, gateType: string, comments: string, actor: any) {
    const gate = await ReadinessGate.findOne({ brandId, gateType });
    if (!gate) throw new AppError('Approval gate not found', 404);

    // Enforce business rules per gate
    if (gateType === 'legal_gate') {
      const pendingCounselMatters = await LegalMatter.find({
        brandId,
        status: { $ne: 'counsel_review_recorded' },
      });
      if (pendingCounselMatters.length > 0) {
        throw new AppError(
          'Legal gate cannot be approved while legal matters are still awaiting counsel review.',
          400
        );
      }
    }

    if (gateType === 'brand_owner_gate') {
      const expansion = await ExpansionProposition.findOne({ brandId });
      if (!expansion || !expansion.investorFacingTeaser.isApprovedByBrandOwner) {
        throw new AppError(
          'Brand Owner gate requires brand owner approval on the investor-facing proposition.',
          400
        );
      }
    }

    gate.status = 'approved';
    gate.approverId = actor.userId;
    gate.approvedAt = new Date();
    gate.comments = comments || 'Approved by authorized reviewer.';
    gate.blockingReasons = [];
    await gate.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'READINESS_GATE_APPROVED',
      targetEntity: 'readiness_gate',
      targetId: gate._id as any,
      newState: gate.toObject(),
    });

    return gate;
  }

  static async rejectGate(brandId: string, gateType: string, blockingReasons: string[], comments: string, actor: any) {
    const gate = await ReadinessGate.findOne({ brandId, gateType });
    if (!gate) throw new AppError('Approval gate not found', 404);

    gate.status = 'rejected';
    gate.approverId = actor.userId;
    gate.approvedAt = new Date();
    gate.comments = comments;
    gate.blockingReasons = blockingReasons || ['Action required to satisfy gate requirements.'];
    await gate.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'READINESS_GATE_REJECTED',
      targetEntity: 'readiness_gate',
      targetId: gate._id as any,
      newState: gate.toObject(),
    });

    return gate;
  }

  // Hard stop before moving brand to approved_for_outreach
  static async requestOutreachApproval(brandId: string, actor: any) {
    const gates = await ReadinessGate.find({ brandId });
    const unapprovedGates = gates.filter((g) => g.status !== 'approved');

    if (unapprovedGates.length > 0) {
      throw new AppError(
        `Cannot approve brand for outreach. Pending gates: ${unapprovedGates.map((g) => g.gateType).join(', ')}`,
        422
      );
    }

    const criticalGaps = await ReadinessGap.find({ brandId, status: { $ne: 'closed' }, severity: 'critical' });
    if (criticalGaps.length > 0) {
      throw new AppError(
        `Cannot approve brand for outreach. Unresolved critical gaps remain: ${criticalGaps.map((g) => g.title).join(', ')}`,
        422
      );
    }

    const brand = await Brand.findById(brandId);
    if (!brand) throw new AppError('Brand not found', 404);

    const prev = brand.status;
    brand.status = 'approved_for_outreach';
    await brand.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'BRAND_APPROVED_FOR_OUTREACH',
      targetEntity: 'brand',
      targetId: brand._id as any,
      previousState: { status: prev },
      newState: { status: 'approved_for_outreach' },
    });

    return brand;
  }
}
