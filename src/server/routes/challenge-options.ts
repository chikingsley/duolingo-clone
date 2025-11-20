import { Elysia, t } from 'elysia';
import { requireAdmin } from '../middleware/auth';
import db from '../db';
import { challengeOptions } from '../db/schema';
import { eq } from 'drizzle-orm';

export const challengeOptionsRoutes = new Elysia({ prefix: '/api' })
  .use(requireAdmin)

  // Get all challenge options
  .get('/challengeOptions', async () => {
    const data = await db.query.challengeOptions.findMany();
    return data;
  })

  // Get single challenge option
  .get('/challengeOptions/:challengeOptionId', async ({ params }) => {
    const data = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, parseInt(params.challengeOptionId)),
    });

    if (!data) {
      return { error: 'Challenge option not found' };
    }

    return data;
  })

  // Create challenge option
  .post('/challengeOptions', async ({ body }) => {
    const [data] = await db
      .insert(challengeOptions)
      .values(body)
      .returning();

    return data;
  }, {
    body: t.Object({
      challengeId: t.Number(),
      text: t.String(),
      correct: t.Boolean(),
      imageSrc: t.Optional(t.String()),
      audioSrc: t.Optional(t.String()),
    }),
  })

  // Update challenge option
  .put('/challengeOptions/:challengeOptionId', async ({ params, body }) => {
    const [data] = await db
      .update(challengeOptions)
      .set(body)
      .where(eq(challengeOptions.id, parseInt(params.challengeOptionId)))
      .returning();

    return data;
  }, {
    body: t.Object({
      challengeId: t.Number(),
      text: t.String(),
      correct: t.Boolean(),
      imageSrc: t.Optional(t.String()),
      audioSrc: t.Optional(t.String()),
    }),
  })

  // Delete challenge option
  .delete('/challengeOptions/:challengeOptionId', async ({ params }) => {
    const [data] = await db
      .delete(challengeOptions)
      .where(eq(challengeOptions.id, parseInt(params.challengeOptionId)))
      .returning();

    return data;
  });
