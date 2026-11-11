import { ExpansionProposition, IExpansionProposition } from '../models/expansion.model';
import { AuditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';

export class ExpansionService {
  static async getProposition(brandId: string) {
    let prop = await ExpansionProposition.findOne({ brandId });
    if (!prop) {
      // Auto-initialize standard draft proposition if none exists
      prop = new ExpansionProposition({
        brandId,
        franchiseModel: 'Multi-Unit Development',
        targetGeography: {
          countries: ['India'],
          tier1Cities: ['Mumbai', 'Delhi NCR', 'Bengaluru'],
          tier2Cities: ['Pune', 'Ahmedabad', 'Chandigarh', 'Hyderabad'],
          regions: ['North', 'West', 'South'],
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
            parameter: 'Average Store Capex',
            amount: 4500000,
            currency: 'INR',
            classification: 'historical_actual',
            source: 'Company Flagship Store Audited Accounts FY2025',
            asOfDate: new Date('2025-03-31'),
            notes: 'Based on 1,200 sq.ft high-street dine-in format.',
          },
          {
            parameter: 'Average Monthly Gross Revenue',
            amount: 1800000,
            currency: 'INR',
            classification: 'historical_actual',
            source: 'POS Consolidated Records 2024-2025',
            asOfDate: new Date('2025-06-30'),
            notes: 'Weighted average across 3 existing company-owned outlets.',
          },
          {
            parameter: 'Store Operating Margin (EBITDA)',
            amount: 22,
            currency: '%',
            classification: 'historical_actual',
            source: 'Audited P&L Statements FY2025',
            asOfDate: new Date('2025-03-31'),
            notes: 'Post-royalties store-level operating margin.',
          },
          {
            parameter: 'Projected Store Breakeven Period',
            amount: 6,
            currency: 'Months',
            classification: 'management_assumption',
            source: 'Management Operating Model v2.4',
            asOfDate: new Date(),
            notes: 'Assuming 75% steady-state revenue ramp within first quarter.',
          },
        ],
        investorFacingTeaser: {
          headline: 'High-Margin Premium Quick Service Concept with Turnkey Playbook',
          summaryDescription:
            'Leading urban F&B brand with 3 profitable flagships, 40%+ return on capital, proprietary central commissary recipes, and turnkey store opening support.',
          keyHighlights: [
            'Proven unit economics with 22% Store EBITDA margin',
            'Full supply chain & central commissary ingredient consistency',
            'Complete digitized SOP library covering all staff functions',
            'Indian Contract Act compliant franchise agreement drafted',
          ],
          targetPaybackMonths: '22 - 30 months',
          isApprovedByBrandOwner: false,
        },
      });
      await prop.save();
    }
    return prop;
  }

  static async updateProposition(brandId: string, data: Partial<IExpansionProposition>, actor: any) {
    let prop = await ExpansionProposition.findOne({ brandId });
    if (!prop) {
      prop = new ExpansionProposition({ brandId, ...data });
    } else {
      Object.assign(prop, data);
    }
    await prop.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'EXPANSION_PROPOSITION_UPDATED',
      targetEntity: 'expansion_proposition',
      targetId: prop._id as any,
      newState: prop.toObject(),
    });

    return prop;
  }

  static async addAssumption(brandId: string, assumptionData: any, actor: any) {
    const prop = await ExpansionService.getProposition(brandId);
    prop.financialAssumptions.push(assumptionData);
    await prop.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'FINANCIAL_ASSUMPTION_ADDED',
      targetEntity: 'expansion_proposition',
      targetId: prop._id as any,
      newState: assumptionData,
    });

    return prop;
  }

  static async brandApproveTeaser(brandId: string, actor: any) {
    const prop = await ExpansionService.getProposition(brandId);
    prop.investorFacingTeaser.isApprovedByBrandOwner = true;
    prop.investorFacingTeaser.approvedAt = new Date();
    prop.status = 'brand_approved';
    await prop.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'BRAND_OWNER_TEASER_APPROVED',
      targetEntity: 'expansion_proposition',
      targetId: prop._id as any,
      newState: { isApprovedByBrandOwner: true, status: 'brand_approved' },
    });

    return prop;
  }
}
