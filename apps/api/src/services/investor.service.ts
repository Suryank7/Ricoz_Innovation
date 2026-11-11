import { Investor, IInvestor } from '../models/investor.model';
import { AuditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';

export class InvestorService {
  static async listInvestors(filter: any = {}) {
    return Investor.find(filter)
      .populate('assignedAdviserId', 'name email')
      .populate('qualification.verifiedBy', 'name email')
      .sort({ updatedAt: -1 });
  }

  static async getInvestorById(id: string) {
    const investor = await Investor.findById(id)
      .populate('assignedAdviserId', 'name email')
      .populate('qualification.verifiedBy', 'name email')
      .populate('activities.loggedBy', 'name email');
    if (!investor) throw new AppError('Investor profile not found', 404);
    return investor;
  }

  static async createInvestor(data: Partial<IInvestor>, actor: any) {
    const investor = new Investor({
      ...data,
      assignedAdviserId: actor.userId,
      qualification: {
        financialReviewStatus: 'unverified',
      },
      status: 'active',
      activities: [
        {
          type: 'note',
          summary: 'Investor profile registered and lawful consent recorded for expansion matchmaking.',
          loggedBy: actor.userId,
          createdAt: new Date(),
        },
      ],
    });
    await investor.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'INVESTOR_CREATED',
      targetEntity: 'investor',
      targetId: investor._id as any,
      newState: investor.toObject(),
    });

    return investor;
  }

  static async updateInvestor(id: string, data: Partial<IInvestor>, actor: any) {
    const investor = await Investor.findById(id);
    if (!investor) throw new AppError('Investor not found', 404);

    const prev = investor.toObject();
    Object.assign(investor, data);
    await investor.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'INVESTOR_UPDATED',
      targetEntity: 'investor',
      targetId: investor._id as any,
      previousState: prev,
      newState: investor.toObject(),
    });

    return investor;
  }

  static async verifyQualification(
    id: string,
    data: { financialReviewStatus: 'verified_by_adviser' | 'rejected' | 'in_review'; qualificationNotes?: string },
    actor: any
  ) {
    const investor = await Investor.findById(id);
    if (!investor) throw new AppError('Investor not found', 404);

    investor.qualification.financialReviewStatus = data.financialReviewStatus;
    investor.qualification.verifiedBy = actor.userId;
    investor.qualification.verifiedAt = new Date();
    if (data.qualificationNotes) {
      investor.qualification.qualificationNotes = data.qualificationNotes;
    }

    investor.activities.push({
      type: 'review',
      summary: `Financial capacity review updated to: ${data.financialReviewStatus}. Notes: ${data.qualificationNotes || 'None'}`,
      loggedBy: actor.userId,
      createdAt: new Date(),
    });

    await investor.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'INVESTOR_QUALIFICATION_VERIFIED',
      targetEntity: 'investor',
      targetId: investor._id as any,
      newState: investor.qualification,
    });

    return investor;
  }

  static async logActivity(id: string, activityData: { type: any; summary: string }, actor: any) {
    const investor = await Investor.findById(id);
    if (!investor) throw new AppError('Investor not found', 404);

    investor.activities.unshift({
      type: activityData.type || 'note',
      summary: activityData.summary,
      loggedBy: actor.userId,
      createdAt: new Date(),
    });
    await investor.save();

    return investor;
  }
}
