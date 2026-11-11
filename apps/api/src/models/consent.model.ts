import mongoose, { Schema, Document } from 'mongoose';

export interface IConsent extends Document {
  matchId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
  propositionPackVersion: string;
  brandConsent: {
    status: 'pending' | 'granted' | 'declined';
    consentedAt?: Date;
    consentedBy?: mongoose.Types.ObjectId;
  };
  investorConsent: {
    status: 'pending' | 'granted' | 'declined';
    consentedAt?: Date;
    consentedBy?: mongoose.Types.ObjectId;
  };
  overallStatus: 'pending' | 'mutual_consent_granted' | 'declined';
  dealRoomId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentSchema = new Schema<IConsent>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    investorId: { type: Schema.Types.ObjectId, ref: 'Investor', required: true, index: true },
    propositionPackVersion: { type: String, default: '1.0' },
    brandConsent: {
      status: { type: String, enum: ['pending', 'granted', 'declined'], default: 'pending' },
      consentedAt: { type: Date },
      consentedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    investorConsent: {
      status: { type: String, enum: ['pending', 'granted', 'declined'], default: 'pending' },
      consentedAt: { type: Date },
      consentedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    overallStatus: {
      type: String,
      enum: ['pending', 'mutual_consent_granted', 'declined'],
      default: 'pending',
    },
    dealRoomId: { type: Schema.Types.ObjectId, ref: 'Deal' },
  },
  { timestamps: true }
);

ConsentSchema.index({ brandId: 1, investorId: 1 });
ConsentSchema.index({ overallStatus: 1 });

export const Consent = mongoose.model<IConsent>('Consent', ConsentSchema);
