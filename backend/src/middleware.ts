import 'dotenv/config';

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: number;
  email?: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      id: number;
      email: string;
      type?: string;
    };

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    req.userId = decoded.id;
    req.email = decoded.email;
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

