import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorRole: string;
  actorEmail?: string;
  action: string;
  targetEntity: string;
  targetId?: mongoose.Types.ObjectId;
  previousState?: any;
  newState?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String, required: true },
    actorEmail: { type: String },
    action: { type: String, required: true },
    targetEntity: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
    reason: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

AuditLogSchema.index({ targetEntity: 1, targetId: 1 });
AuditLogSchema.index({ actorId: 1 });
AuditLogSchema.index({ action: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
