import { Elysia, t } from 'elysia';
import { requireAdmin, authMiddleware } from '../middleware/auth';
import db from '../db';
import { courses } from '../db/schema';
import { eq } from 'drizzle-orm';

export const coursesRoutes = new Elysia({ prefix: '/api' })
  // Get all courses (public)
  .use(authMiddleware)
  .get('/courses', async ({ auth }) => {
    const data = await db.query.courses.findMany();
    return data;
  })

  // Get single course
  .get('/courses/:courseId', async ({ params }) => {
    const data = await db.query.courses.findFirst({
      where: eq(courses.id, parseInt(params.courseId)),
    });

    if (!data) {
      return { error: 'Course not found' };
    }

    return data;
  })

  // Create course (admin only)
  .use(requireAdmin)
  .post('/courses', async ({ body }) => {
    const [data] = await db
      .insert(courses)
      .values(body)
      .returning();

    return data;
  }, {
    body: t.Object({
      title: t.String(),
      imageSrc: t.String(),
    }),
  })

  // Update course (admin only)
  .put('/courses/:courseId', async ({ params, body }) => {
    const [data] = await db
      .update(courses)
      .set(body)
      .where(eq(courses.id, parseInt(params.courseId)))
      .returning();

    return data;
  }, {
    body: t.Object({
      title: t.String(),
      imageSrc: t.String(),
    }),
  })

  // Delete course (admin only)
  .delete('/courses/:courseId', async ({ params }) => {
    const [data] = await db
      .delete(courses)
      .where(eq(courses.id, parseInt(params.courseId)))
      .returning();

    return data;
  });
