import { AuditLog } from '../models/audit-log.model';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export interface LogAuditParams {
  actorId?: string | mongoose.Types.ObjectId;
  actorRole: string;
  actorEmail?: string;
  action: string;
  targetEntity: string;
  targetId?: string | mongoose.Types.ObjectId;
  previousState?: any;
  newState?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async log(params: LogAuditParams) {
    try {
      const record = new AuditLog({
        actorId: params.actorId,
        actorRole: params.actorRole,
        actorEmail: params.actorEmail,
        action: params.action,
        targetEntity: params.targetEntity,
        targetId: params.targetId,
        previousState: params.previousState,
        newState: params.newState,
        reason: params.reason,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date(),
      });
      await record.save();
    } catch (err: any) {
      logger.error('Failed to write audit log:', err.message);
    }
  }

  static async getLogs(query: { targetEntity?: string; targetId?: string; actorId?: string; limit?: number }) {
    const filter: any = {};
    if (query.targetEntity) filter.targetEntity = query.targetEntity;
    if (query.targetId) filter.targetId = query.targetId;
    if (query.actorId) filter.actorId = query.actorId;

    return AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(query.limit || 100)
      .populate('actorId', 'name email role');
  }
}
