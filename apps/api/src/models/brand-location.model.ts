import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandLocation extends Document {
  brandId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  city: string;
  state: string;
  format: string;
  openingDate: Date;
  status: 'operating' | 'under_renovation' | 'closed';
  monthlyAverageRevenue?: number;
  monthlyAverageEbitda?: number;
  hasPerformanceEvidence: boolean;
  evidenceNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandLocationSchema = new Schema<IBrandLocation>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    format: {
      type: String,
      required: true,
      enum: ['Dine-In Flagship', 'QSR / Express', 'Kiosk', 'Cloud Kitchen', 'Retail Store', 'Service Center'],
      default: 'Dine-In Flagship',
    },
    openingDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ['operating', 'under_renovation', 'closed'],
      default: 'operating',
    },
    monthlyAverageRevenue: { type: Number },
    monthlyAverageEbitda: { type: Number },
    hasPerformanceEvidence: { type: Boolean, default: false },
    evidenceNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const BrandLocation = mongoose.model<IBrandLocation>('BrandLocation', BrandLocationSchema);
