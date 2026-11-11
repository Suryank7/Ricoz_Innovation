import { Brand } from '../models/brand.model';
import { Investor } from '../models/investor.model';
import { Deal } from '../models/deal.model';
import { ReadinessGap } from '../models/readiness-gap.model';
import { ReadinessGate } from '../models/readiness-gate.model';
import { SOP } from '../models/sop.model';
import { LegalMatter } from '../models/legal-matter.model';
import { Match } from '../models/match.model';
import { Consent } from '../models/consent.model';

export class PortfolioService {
  static async getSummaryMetrics() {
    const [
      totalBrands,
      activeBrands,
      readyBrands,
      totalInvestors,
      qualifiedInvestors,
      totalDeals,
      activeDeals,
      closedWonDeals,
    ] = await Promise.all([
      Brand.countDocuments({}),
      Brand.countDocuments({ status: { $nin: ['archived', 'paused'] } }),
      Brand.countDocuments({ status: 'approved_for_outreach' }),
      Investor.countDocuments({}),
      Investor.countDocuments({ 'qualification.financialReviewStatus': 'verified_by_adviser' }),
      Deal.countDocuments({}),
      Deal.countDocuments({ stage: { $nin: ['closed_won', 'closed_lost', 'paused'] } }),
      Deal.countDocuments({ stage: 'closed_won' }),
    ]);

    const activeBrandsList = await Brand.find({ status: { $nin: ['archived'] } })
      .populate('assignedAdviserId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(8);

    const activeDealsList = await Deal.find({ stage: { $nin: ['closed_won', 'closed_lost'] } })
      .populate('brandId', 'name sector')
      .populate('investorId', 'name preferences')
      .populate('assignedAdviserId', 'name')
      .sort({ updatedAt: -1 })
      .limit(6);

    return {
      brands: {
        total: totalBrands,
        active: activeBrands,
        approvedForOutreach: readyBrands,
      },
      investors: {
        total: totalInvestors,
        verifiedQualified: qualifiedInvestors,
      },
      deals: {
        total: totalDeals,
        active: activeDeals,
        closedWon: closedWonDeals,
      },
      recentBrands: activeBrandsList,
      recentDeals: activeDealsList,
    };
  }

  static async getOperationalBlockers() {
    const [openGaps, pendingGates, awaitingCounselMatters, sopsInReview] = await Promise.all([
      ReadinessGap.find({ status: { $ne: 'closed' } })
        .populate('brandId', 'name')
        .populate('assignedTo', 'name email')
        .sort({ severity: 1, dueDate: 1 })
        .limit(10),
      ReadinessGate.find({ status: 'pending' })
        .populate('brandId', 'name')
        .limit(10),
      LegalMatter.find({ status: { $in: ['in_preparation', 'awaiting_counsel', 'changes_requested'] } })
        .populate('brandId', 'name')
        .populate('assignedCounselId', 'name email organization')
        .limit(10),
      SOP.find({ status: 'in_review' })
        .populate('brandId', 'name')
        .populate('ownerId', 'name email')
        .limit(10),
    ]);

    return {
      openReadinessGaps: openGaps,
      pendingApprovalGates: pendingGates,
      mattersAwaitingCounsel: awaitingCounselMatters,
      sopsAwaitingApproval: sopsInReview,
    };
  }
}
