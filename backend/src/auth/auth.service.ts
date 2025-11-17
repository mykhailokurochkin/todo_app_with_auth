import 'dotenv/config';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User, type PublicUser } from '../db/sequelize.js';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET ?? 'dev-secret';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL ?? '15m';
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS ?? 30);
export const REFRESH_TOKEN_MAX_AGE_MS = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_TTL = `${REFRESH_TOKEN_DAYS}d`;

const toPublicUser = (user: User): PublicUser => {
  const { id, email } = user.get();
  return { id, email };
};

const createToken = (user: User, type: 'access' | 'refresh') =>
  jwt.sign(
    { id: user.id, email: user.email, type },
    JWT_SECRET,
    {
      expiresIn:
        type === 'access'
          ? (ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'])
          : (REFRESH_TOKEN_TTL as jwt.SignOptions['expiresIn']),
    },
  );

const issueTokensForUser = (user: User) => {
  const accessToken = createToken(user, 'access');
  const refreshToken = createToken(user, 'refresh');

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
};

export const authenticateUser = async (email: string, password: string) => {
  const existingUser = await User.findOne({ where: { email } });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    return { ...issueTokensForUser(user), action: 'registered' as const };
  }

  const passwordMatches = await bcrypt.compare(password, existingUser.password);

  if (!passwordMatches) {
    throw new Error('Invalid credentials');
  }

  return { ...issueTokensForUser(existingUser), action: 'logged-in' as const };
};

export const refreshSession = async (incomingToken?: string) => {
  if (!incomingToken) {
    throw new Error('Refresh token missing');
  }

  try {
    const payload = jwt.verify(incomingToken, JWT_SECRET) as jwt.JwtPayload & {
      id: number;
      email: string;
      type?: string;
    };

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const user = await User.findByPk(payload.id);

    if (!user) {
      throw new Error('User not found');
    }

    return issueTokensForUser(user);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
