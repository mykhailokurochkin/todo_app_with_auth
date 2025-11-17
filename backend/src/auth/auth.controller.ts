import { Router } from 'express';
import type { Request, Response } from 'express';

import { REFRESH_TOKEN_MAX_AGE_MS, authenticateUser, refreshSession } from './auth.service.js';

const authRouter = Router();
const REFRESH_COOKIE = 'refreshToken';
const isProd = process.env.NODE_ENV === 'production';

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/auth',
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
};

type AuthPayload = Pick<
  Awaited<ReturnType<typeof authenticateUser>>,
  'user' | 'accessToken' | 'refreshToken'
> & { user: { id: number } };

const sendAuthResponse = (
  res: Response,
  status: number,
  payload: AuthPayload,
  message: string,
) => {
  setRefreshCookie(res, payload.refreshToken);
  return res.status(status).json({
    message,
    user: {
      id: payload.user.id,
      email: payload.user.email,
    },
    accessToken: payload.accessToken,
  });
};

authRouter.post('/', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await authenticateUser(email, password);
    const message =
      result.action === 'registered' ? 'User registered successfully!' : 'Login successful!';
    const statusCode = result.action === 'registered' ? 201 : 200;
    return sendAuthResponse(res, statusCode, result, message);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid credentials')) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  const incomingToken = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;

  try {
    const result = await refreshSession(incomingToken);
    return sendAuthResponse(res, 200, result, 'Session refreshed');
  } catch (error) {
    console.error('Refresh error:', error);
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  clearRefreshCookie(res);
  return res.status(200).json({ message: 'Logged out successfully' });
});

export default authRouter;
