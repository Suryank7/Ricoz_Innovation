import { Match, IMatch } from '../models/match.model';
import { Consent, IConsent } from '../models/consent.model';
import { Deal } from '../models/deal.model';
import { Brand } from '../models/brand.model';
import { ExpansionProposition } from '../models/expansion.model';
import { Investor } from '../models/investor.model';
import { AuditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

export class MatchingService {
  static async evaluateMatchesForBrand(brandId: string) {
    const brand = await Brand.findById(brandId);
    if (!brand) throw new AppError('Brand not found', 404);

    const prop = await ExpansionProposition.findOne({ brandId });
    if (!prop) throw new AppError('Expansion proposition not configured for brand', 400);

    const investors = await Investor.find({ status: 'active' });
    const results: any[] = [];

    const totalInitialCapex = prop.fees.franchiseFee + prop.fees.initialSetupEstimate + prop.fees.workingCapitalRequirement;

    for (const inv of investors) {
      const unmet: string[] = [];
      const missing: string[] = [];
      let criteriaCount = 0;
      let metCount = 0;

      // 1. Sector Matching
      criteriaCount++;
      const sectorMatch = inv.preferences.targetSectors.includes(brand.sector) || inv.preferences.targetSectors.length === 0;
      if (sectorMatch) {
        metCount++;
      } else {
        unmet.push(`Sector mismatch: Brand is in ${brand.sector}, investor targets [${inv.preferences.targetSectors.join(', ')}]`);
      }

      // 2. Budget Matching
      criteriaCount++;
      const budgetMatch = inv.preferences.maxBudget >= totalInitialCapex;
      if (budgetMatch) {
        metCount++;
      } else {
        unmet.push(`Budget shortfall: Minimum capex is ₹${totalInitialCapex.toLocaleString('en-IN')}, investor maximum is ₹${inv.preferences.maxBudget.toLocaleString('en-IN')}`);
      }

      // 3. Geography Matching
      criteriaCount++;
      const targetCities = [...prop.targetGeography.tier1Cities, ...prop.targetGeography.tier2Cities];
      const geographyMatch =
        inv.preferences.preferredLocations.some((loc) => targetCities.includes(loc)) ||
        inv.preferences.preferredLocations.length === 0;
      if (geographyMatch) {
        metCount++;
      } else {
        unmet.push(`Geography divergence: Opportunity targets ${targetCities.slice(0, 3).join(', ')}, investor preferred [${inv.preferences.preferredLocations.join(', ')}]`);
      }

      // 4. Role & Capacity Matching
      criteriaCount++;
      const roleCapacityMatch = inv.capability.maxUnitsCapacity >= prop.minimumUnits;
      if (roleCapacityMatch) {
        metCount++;
      } else {
        unmet.push(`Unit capacity shortfall: Model requires development of ${prop.minimumUnits} unit(s), investor capacity is ${inv.capability.maxUnitsCapacity}`);
      }

      if (inv.qualification.financialReviewStatus === 'unverified') {
        missing.push('Investor financial proof not yet verified by adviser');
      }

      const score = Math.round((metCount / criteriaCount) * 100);

      // Upsert match record
      let match = await Match.findOne({ brandId, investorId: inv._id });
      if (!match) {
        match = new Match({
          brandId,
          expansionPropositionId: prop._id,
          investorId: inv._id,
          matchScore: score,
          criteriaBreakdown: {
            sectorMatch,
            budgetMatch,
            geographyMatch,
            roleCapacityMatch,
            unmetCriteria: unmet,
            missingInfo: missing,
          },
          adviserReviewStatus: 'pending_adviser',
        });
      } else {
        match.matchScore = score;
        match.criteriaBreakdown = {
          sectorMatch,
          budgetMatch,
          geographyMatch,
          roleCapacityMatch,
          unmetCriteria: unmet,
          missingInfo: missing,
        };
      }
      await match.save();
      results.push(match);
    }

    return results;
  }

  static async getBrandMatches(brandId: string, actor: any) {
    const matches = await Match.find({ brandId })
      .populate('investorId')
      .populate('expansionPropositionId')
      .sort({ matchScore: -1 });

    // Enforce Double-Blind privacy: If user is brand owner or unauthorized, mask investor direct contacts
    return matches.map((m: any) => {
      const matchObj = m.toObject();
      if (actor.role === 'brand_owner') {
        if (matchObj.investorId) {
          matchObj.investorId = {
            _id: matchObj.investorId._id,
            blindedCode: `INV-${String(matchObj.investorId._id).slice(-4).toUpperCase()}`,
            capability: matchObj.investorId.capability,
            preferences: {
              targetSectors: matchObj.investorId.preferences.targetSectors,
              preferredLocations: matchObj.investorId.preferences.preferredLocations,
              minBudget: matchObj.investorId.preferences.minBudget,
              maxBudget: matchObj.investorId.preferences.maxBudget,
            },
            qualification: {
              financialReviewStatus: matchObj.investorId.qualification.financialReviewStatus,
            },
            // Email and phone are strictly omitted!
          };
        }
      }
      return matchObj;
    });
  }

  static async adviserProposeIntroduction(matchId: string, adviserNotes: string, actor: any) {
    const match = await Match.findById(matchId);
    if (!match) throw new AppError('Match record not found', 404);

    match.adviserReviewStatus = 'adviser_approved';
    match.adviserNotes = adviserNotes;
    await match.save();

    // Create or find Consent record
    let consent = await Consent.findOne({ matchId });
    if (!consent) {
      consent = new Consent({
        matchId: match._id,
        brandId: match.brandId,
        investorId: match.investorId,
        propositionPackVersion: '1.0',
        overallStatus: 'pending',
      });
      await consent.save();
    }

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'MATCH_ADVISER_PROPOSED',
      targetEntity: 'match',
      targetId: match._id as any,
      newState: { adviserReviewStatus: 'adviser_approved', adviserNotes },
    });

    return { match, consent };
  }

  static async respondConsent(
    consentId: string,
    party: 'brand' | 'investor',
    decision: 'granted' | 'declined',
    actor: any
  ) {
    const consent = await Consent.findById(consentId);
    if (!consent) throw new AppError('Consent request not found', 404);

    if (party === 'brand') {
      consent.brandConsent.status = decision;
      consent.brandConsent.consentedAt = new Date();
      consent.brandConsent.consentedBy = actor.userId;
    } else {
      consent.investorConsent.status = decision;
      consent.investorConsent.consentedAt = new Date();
      consent.investorConsent.consentedBy = actor.userId;
    }

    // Check if mutual consent is achieved
    if (consent.brandConsent.status === 'granted' && consent.investorConsent.status === 'granted') {
      consent.overallStatus = 'mutual_consent_granted';

      // Automatically instantiate Private Deal Room!
      const dealCode = `DEAL-${Date.now().toString().slice(-6)}`;
      const brand = await Brand.findById(consent.brandId);
      const investor = await Investor.findById(consent.investorId);

      const deal = new Deal({
        consentId: consent._id,
        brandId: consent.brandId,
        investorId: consent.investorId,
        dealCode,
        stage: 'introduction_approved',
        assignedAdviserId: brand?.assignedAdviserId || actor.userId,
        participants: [
          { userId: actor.userId, role: 'brokerage', addedAt: new Date() },
        ],
        milestones: [
          { name: 'Mutual Consent & Opportunity Pack Disclosed', targetDate: new Date(), completed: true, completedAt: new Date() },
          { name: 'Commercial & Unit Economics Discovery Session', targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), completed: false },
          { name: 'Legal Readiness & Territory Due Diligence', targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), completed: false },
          { name: 'Term Sheet & Commercial Negotiation', targetDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), completed: false },
          { name: 'Franchise Agreement Execution', targetDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), completed: false },
        ],
        nextAction: {
          description: 'Host kickoff commercial call between Brand Founder and Prospective Investor',
          assignedToRole: 'brokerage',
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        },
      });
      await deal.save();
      consent.dealRoomId = deal._id as any;

      await AuditService.log({
        actorId: actor.userId,
        actorRole: actor.role,
        actorEmail: actor.email,
        action: 'MUTUAL_CONSENT_GRANTED_DEAL_CREATED',
        targetEntity: 'deal',
        targetId: deal._id as any,
        newState: deal.toObject(),
      });
    } else if (consent.brandConsent.status === 'declined' || consent.investorConsent.status === 'declined') {
      consent.overallStatus = 'declined';
    }

    await consent.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: `CONSENT_${party.toUpperCase()}_${decision.toUpperCase()}`,
      targetEntity: 'consent',
      targetId: consent._id as any,
      newState: consent.toObject(),
    });

    return consent;
  }
}
