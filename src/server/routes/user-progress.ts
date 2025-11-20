import { Elysia, t } from 'elysia';
import { requireAuth } from '../middleware/auth';
import db from '../db';
import { userProgress, challengeProgress, challenges } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { MAX_HEARTS, POINTS_TO_REFILL } from '../constants';

export const userProgressRoutes = new Elysia({ prefix: '/api' })
  .use(requireAuth)

  // Upsert user progress
  .post('/user-progress', async ({ auth, body }) => {
    const { courseId, userName, userImageSrc } = body;

    const existingProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, auth.userId!),
    });

    if (existingProgress) {
      const [updated] = await db
        .update(userProgress)
        .set({
          activeCourseId: courseId,
          userName: userName || existingProgress.userName,
          userImageSrc: userImageSrc || existingProgress.userImageSrc,
        })
        .where(eq(userProgress.userId, auth.userId!))
        .returning();

      return updated;
    }

    const [created] = await db
      .insert(userProgress)
      .values({
        userId: auth.userId!,
        activeCourseId: courseId,
        userName: userName || 'User',
        userImageSrc: userImageSrc || '/mascot.svg',
      })
      .returning();

    return created;
  }, {
    body: t.Object({
      courseId: t.Number(),
      userName: t.Optional(t.String()),
      userImageSrc: t.Optional(t.String()),
    }),
  })

  // Reduce hearts
  .post('/user-progress/reduce-hearts', async ({ auth, body }) => {
    const { challengeId } = body;

    const currentProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, auth.userId!),
    });

    if (!currentProgress) {
      throw new Error('User progress not found');
    }

    const challenge = await db.query.challenges.findFirst({
      where: eq(challenges.id, challengeId),
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const existingChallengeProgress = await db.query.challengeProgress.findFirst({
      where: and(
        eq(challengeProgress.userId, auth.userId!),
        eq(challengeProgress.challengeId, challengeId)
      ),
    });

    // If already completed, it's practice mode
    if (existingChallengeProgress) {
      return { error: 'practice' };
    }

    // Check subscription (you'll need to implement this)
    // const subscription = await getUserSubscription(auth.userId);
    // if (subscription?.isActive) return { error: 'subscription' };

    if (currentProgress.hearts === 0) {
      return { error: 'hearts' };
    }

    await db
      .update(userProgress)
      .set({
        hearts: Math.max(currentProgress.hearts - 1, 0),
      })
      .where(eq(userProgress.userId, auth.userId!));

    return { success: true, hearts: Math.max(currentProgress.hearts - 1, 0) };
  }, {
    body: t.Object({
      challengeId: t.Number(),
    }),
  })

  // Refill hearts
  .post('/user-progress/refill-hearts', async ({ auth }) => {
    const currentProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, auth.userId!),
    });

    if (!currentProgress) {
      throw new Error('User progress not found');
    }

    if (currentProgress.hearts === MAX_HEARTS) {
      throw new Error('Hearts are already full');
    }

    if (currentProgress.points < POINTS_TO_REFILL) {
      throw new Error('Not enough points');
    }

    const [updated] = await db
      .update(userProgress)
      .set({
        hearts: MAX_HEARTS,
        points: currentProgress.points - POINTS_TO_REFILL,
      })
      .where(eq(userProgress.userId, auth.userId!))
      .returning();

    return updated;
  });
