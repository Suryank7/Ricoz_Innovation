import { Request, Response, NextFunction } from 'express';
import { MatchingService } from '../services/matching.service';

export class MatchingController {
  static async evaluateMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await MatchingService.evaluateMatchesForBrand(req.params.brandId);
      res.json({
        success: true,
        message: 'Rules-based matching evaluation executed against active investors',
        count: results.length,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBrandMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const matches = await MatchingService.getBrandMatches(req.params.brandId, req.user);
      res.json({ success: true, count: matches.length, data: matches });
    } catch (err) {
      next(err);
    }
  }

  static async adviserPropose(req: Request, res: Response, next: NextFunction) {
    try {
      const { adviserNotes } = req.body;
      const result = await MatchingService.adviserProposeIntroduction(req.params.matchId, adviserNotes, req.user);
      res.json({
        success: true,
        message: 'Adviser proposed introduction. Double-blind consent requests initialized.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async respondConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const { party, decision } = req.body;
      const consent = await MatchingService.respondConsent(req.params.consentId, party, decision, req.user);
      res.json({
        success: true,
        message:
          consent.overallStatus === 'mutual_consent_granted'
            ? 'Mutual consent achieved! Private Deal Room created.'
            : `Consent response recorded for ${party}`,
        data: consent,
      });
    } catch (err) {
      next(err);
    }
  }
}
