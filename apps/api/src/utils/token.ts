import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { UserRole } from '../config/constants';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  brandId?: string;
  investorId?: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
}
