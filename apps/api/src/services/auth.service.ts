import { User, IUser } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/token';
import { AppError } from '../middlewares/error.middleware';
import { AuditService } from './audit.service';
import { ROLES, UserRole } from '../config/constants';

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    brandId?: string;
    investorId?: string;
    phone?: string;
    organization?: string;
  }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 400);
    }

    const passwordHash = await hashPassword(data.password);
    const user = new User({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role || ROLES.FRANCHISE_ADVISER,
      brandId: data.brandId,
      investorId: data.investorId,
      phone: data.phone,
      organization: data.organization,
    });
    await user.save();

    await AuditService.log({
      actorId: user._id as any,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'USER_REGISTERED',
      targetEntity: 'user',
      targetId: user._id as any,
      newState: { email: user.email, role: user.role },
    });

    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      brandId: user.brandId ? (user.brandId as any).toString() : undefined,
      investorId: user.investorId ? (user.investorId as any).toString() : undefined,
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        brandId: user.brandId,
        investorId: user.investorId,
        organization: user.organization,
      },
    };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      brandId: user.brandId ? (user.brandId as any).toString() : undefined,
      investorId: user.investorId ? (user.investorId as any).toString() : undefined,
    });

    await AuditService.log({
      actorId: user._id as any,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'USER_LOGGED_IN',
      targetEntity: 'user',
      targetId: user._id as any,
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        brandId: user.brandId,
        investorId: user.investorId,
        organization: user.organization,
      },
    };
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) throw new AppError('User profile not found', 404);
    return user;
  }
}
