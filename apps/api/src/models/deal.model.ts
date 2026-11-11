import mongoose, { Schema, Document } from 'mongoose';
import { DEAL_STAGES } from '../config/constants';

export interface IDealMilestone {
  name: string;
  targetDate: Date;
  completedAt?: Date;
  completed: boolean;
}

export interface IDealParticipant {
  userId: mongoose.Types.ObjectId;
  role: 'brokerage' | 'brand' | 'investor' | 'legal';
  addedAt: Date;
}

export interface IDeal extends Document {
  consentId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
  dealCode: string;
  stage: typeof DEAL_STAGES[number];
  assignedAdviserId: mongoose.Types.ObjectId;
  participants: IDealParticipant[];
  milestones: IDealMilestone[];
  nextAction: {
    description: string;
    assignedToRole: 'brokerage' | 'brand' | 'investor';
    dueDate: Date;
  };
  outcomeReason?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IDealMilestone>(
  {
    name: { type: String, required: true },
    targetDate: { type: Date, required: true },
    completedAt: { type: Date },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const ParticipantSchema = new Schema<IDealParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['brokerage', 'brand', 'investor', 'legal'], required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DealSchema = new Schema<IDeal>(
  {
    consentId: { type: Schema.Types.ObjectId, ref: 'Consent', required: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    investorId: { type: Schema.Types.ObjectId, ref: 'Investor', required: true, index: true },
    dealCode: { type: String, required: true, unique: true },
    stage: {
      type: String,
      enum: DEAL_STAGES,
      default: 'introduction_approved',
    },
    assignedAdviserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [ParticipantSchema],
    milestones: [MilestoneSchema],
    nextAction: {
      description: { type: String, default: 'Schedule initial commercial discovery call' },
      assignedToRole: { type: String, enum: ['brokerage', 'brand', 'investor'], default: 'brokerage' },
      dueDate: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    },
    outcomeReason: { type: String },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

DealSchema.index({ stage: 1 });
DealSchema.index({ assignedAdviserId: 1 });

export const Deal = mongoose.model<IDeal>('Deal', DealSchema);

// Shared Documents in Deal Room
export interface ISharedDocument extends Document {
  dealId: mongoose.Types.ObjectId;
  title: string;
  documentType: 'legal_pack' | 'financial_model' | 'sop_overview' | 'term_sheet' | 'due_diligence';
  version: string;
  fileUrl: string;
  accessRule: 'mutual_parties_only' | 'legal_only';
  sharedBy: mongoose.Types.ObjectId;
  accessLogs: Array<{
    userId: mongoose.Types.ObjectId;
    action: 'view' | 'download';
    timestamp: Date;
    ipAddress?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SharedDocumentSchema = new Schema<ISharedDocument>(
  {
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', required: true, index: true },
    title: { type: String, required: true },
    documentType: {
      type: String,
      enum: ['legal_pack', 'financial_model', 'sop_overview', 'term_sheet', 'due_diligence'],
      required: true,
    },
    version: { type: String, default: '1.0' },
    fileUrl: { type: String, required: true },
    accessRule: { type: String, enum: ['mutual_parties_only', 'legal_only'], default: 'mutual_parties_only' },
    sharedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    accessLogs: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, enum: ['view', 'download'] },
        timestamp: { type: Date, default: Date.now },
        ipAddress: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const SharedDocument = mongoose.model<ISharedDocument>('SharedDocument', SharedDocumentSchema);

// Deal Room Due Diligence Q&A
export interface IDealQnA extends Document {
  dealId: mongoose.Types.ObjectId;
  question: string;
  askedBy: mongoose.Types.ObjectId;
  category: 'financial' | 'operational' | 'territory' | 'legal';
  assignedTo?: mongoose.Types.ObjectId;
  status: 'open' | 'answered' | 'closed';
  answer?: string;
  answeredBy?: mongoose.Types.ObjectId;
  answeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DealQnASchema = new Schema<IDealQnA>(
  {
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', required: true, index: true },
    question: { type: String, required: true },
    askedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['financial', 'operational', 'territory', 'legal'],
      default: 'operational',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
    answer: { type: String },
    answeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    answeredAt: { type: Date },
  },
  { timestamps: true }
);

export const DealQnA = mongoose.model<IDealQnA>('DealQnA', DealQnASchema);
