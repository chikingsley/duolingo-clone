import { Elysia, t } from 'elysia';
import { requireAdmin } from '../middleware/auth';
import db from '../db';
import { units } from '../db/schema';
import { eq } from 'drizzle-orm';

export const unitsRoutes = new Elysia({ prefix: '/api' })
  .use(requireAdmin)

  // Get all units
  .get('/units', async () => {
    const data = await db.query.units.findMany();
    return data;
  })

  // Get single unit
  .get('/units/:unitId', async ({ params }) => {
    const data = await db.query.units.findFirst({
      where: eq(units.id, parseInt(params.unitId)),
    });

    if (!data) {
      return { error: 'Unit not found' };
    }

    return data;
  })

  // Create unit
  .post('/units', async ({ body }) => {
    const [data] = await db
      .insert(units)
      .values(body)
      .returning();

    return data;
  }, {
    body: t.Object({
      title: t.String(),
      description: t.String(),
      courseId: t.Number(),
      order: t.Number(),
    }),
  })

  // Update unit
  .put('/units/:unitId', async ({ params, body }) => {
    const [data] = await db
      .update(units)
      .set(body)
      .where(eq(units.id, parseInt(params.unitId)))
      .returning();

    return data;
  }, {
    body: t.Object({
      title: t.String(),
      description: t.String(),
      courseId: t.Number(),
      order: t.Number(),
    }),
  })

  // Delete unit
  .delete('/units/:unitId', async ({ params }) => {
    const [data] = await db
      .delete(units)
      .where(eq(units.id, parseInt(params.unitId)))
      .returning();

    return data;
  });
