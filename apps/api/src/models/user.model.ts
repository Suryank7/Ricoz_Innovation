import mongoose, { Schema, Document } from 'mongoose';
import { ROLES, UserRole } from '../config/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  brandId?: mongoose.Types.ObjectId;
  investorId?: mongoose.Types.ObjectId;
  phone?: string;
  organization?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: Object.values(ROLES),
      default: ROLES.FRANCHISE_ADVISER,
    },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
    investorId: { type: Schema.Types.ObjectId, ref: 'Investor' },
    phone: { type: String, trim: true },
    organization: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
