import { Elysia, t } from 'elysia';
import { requireAdmin } from '../middleware/auth';
import db from '../db';
import { challenges } from '../db/schema';
import { eq } from 'drizzle-orm';

export const challengesRoutes = new Elysia({ prefix: '/api' })
  .use(requireAdmin)

  // Get all challenges
  .get('/challenges', async () => {
    const data = await db.query.challenges.findMany();
    return data;
  })

  // Get single challenge
  .get('/challenges/:challengeId', async ({ params }) => {
    const data = await db.query.challenges.findFirst({
      where: eq(challenges.id, parseInt(params.challengeId)),
    });

    if (!data) {
      return { error: 'Challenge not found' };
    }

    return data;
  })

  // Create challenge
  .post('/challenges', async ({ body }) => {
    const [data] = await db
      .insert(challenges)
      .values(body)
      .returning();

    return data;
  }, {
    body: t.Object({
      lessonId: t.Number(),
      type: t.Union([t.Literal('SELECT'), t.Literal('ASSIST')]),
      question: t.String(),
      order: t.Number(),
    }),
  })

  // Update challenge
  .put('/challenges/:challengeId', async ({ params, body }) => {
    const [data] = await db
      .update(challenges)
      .set(body)
      .where(eq(challenges.id, parseInt(params.challengeId)))
      .returning();

    return data;
  }, {
    body: t.Object({
      lessonId: t.Number(),
      type: t.Union([t.Literal('SELECT'), t.Literal('ASSIST')]),
      question: t.String(),
      order: t.Number(),
    }),
  })

  // Delete challenge
  .delete('/challenges/:challengeId', async ({ params }) => {
    const [data] = await db
      .delete(challenges)
      .where(eq(challenges.id, parseInt(params.challengeId)))
      .returning();

    return data;
  });
