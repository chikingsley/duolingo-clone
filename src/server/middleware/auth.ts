import { Elysia } from 'elysia';
import { createClerkClient } from '@clerk/backend';

const clerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    })
  : null;

export interface AuthContext {
  userId: string | null;
  user: any;
}

// Clerk authentication middleware for Elysia
export const authMiddleware = new Elysia({ name: 'auth' })
  .derive(async ({ headers }): Promise<{ auth: AuthContext }> => {
    if (!clerkClient) {
      console.warn('Clerk client not initialized - authentication disabled');
      return {
        auth: {
          userId: null,
          user: null,
        },
      };
    }

    const authHeader = headers.authorization;
    const sessionToken = headers['cookie']
      ?.split(';')
      .find((c) => c.trim().startsWith('__session='))
      ?.split('=')[1];

    let userId: string | null = null;
    let user: any = null;

    try {
      // Try to verify session from cookie or bearer token
      if (sessionToken) {
        const session = await clerkClient.sessions.verifySession(sessionToken, sessionToken);
        userId = session.userId;
        user = await clerkClient.users.getUser(userId);
      } else if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const verified = await clerkClient.verifyToken(token);
        userId = verified.sub || null;
        if (userId) {
          user = await clerkClient.users.getUser(userId);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    }

    return {
      auth: {
        userId,
        user,
      },
    };
  });

// Protected route guard
export const requireAuth = new Elysia({ name: 'require-auth' })
  .use(authMiddleware)
  .onBeforeHandle(({ auth, set }) => {
    if (!auth.userId) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
  });

// Admin check
export const requireAdmin = new Elysia({ name: 'require-admin' })
  .use(authMiddleware)
  .onBeforeHandle(({ auth, set }) => {
    if (!auth.userId) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    const adminIds = process.env.CLERK_ADMIN_IDS?.split(',').map((id) => id.trim()) || [];
    if (!adminIds.includes(auth.userId)) {
      set.status = 403;
      return { error: 'Forbidden' };
    }
  });
