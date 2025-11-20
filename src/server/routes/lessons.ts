import { Elysia, t } from 'elysia';
import { requireAdmin } from '../middleware/auth';
import db from '../db';
import { lessons } from '../db/schema';
import { eq } from 'drizzle-orm';

export const lessonsRoutes = new Elysia({ prefix: '/api' })
  .use(requireAdmin)

  // Get all lessons
  .get('/lessons', async () => {
    const data = await db.query.lessons.findMany();
    return data;
  })

  // Get single lesson
  .get('/lessons/:lessonId', async ({ params }) => {
    const data = await db.query.lessons.findFirst({
      where: eq(lessons.id, parseInt(params.lessonId)),
    });

    if (!data) {
      return { error: 'Lesson not found' };
    }

    return data;
  })

  // Create lesson
  .post('/lessons', async ({ body }) => {
    const [data] = await db
      .insert(lessons)
      .values(body)
      .returning();

    return data;
  }, {
    body: t.Object({
      title: t.String(),
      unitId: t.Number(),
      order: t.Number(),
    }),
  })

  // Update lesson
  .put('/lessons/:lessonId', async ({ params, body }) => {
    const [data] = await db
      .update(lessons)
      .set(body)
      .where(eq(lessons.id, parseInt(params.lessonId)))
      .returning();

    return data;
  }, {
    body: t.Object({
      title: t.String(),
      unitId: t.Number(),
      order: t.Number(),
    }),
  })

  // Delete lesson
  .delete('/lessons/:lessonId', async ({ params }) => {
    const [data] = await db
      .delete(lessons)
      .where(eq(lessons.id, parseInt(params.lessonId)))
      .returning();

    return data;
  });
