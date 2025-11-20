import { Elysia } from 'elysia';
import Stripe from 'stripe';
import db from '../db';
import { userSubscription } from '../db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export const stripeRoutes = new Elysia({ prefix: '/api' })
  // Stripe webhook
  .post('/webhooks/stripe', async ({ body, headers, set }) => {
    const signature = headers['stripe-signature'];

    if (!signature) {
      set.status = 400;
      return { error: 'No signature' };
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        JSON.stringify(body),
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (error: any) {
      set.status = 400;
      return { error: `Webhook Error: ${error.message}` };
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      if (!session?.metadata?.userId) {
        set.status = 400;
        return { error: 'User ID is required' };
      }

      await db.insert(userSubscription).values({
        userId: session.metadata.userId,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    }

    if (event.type === 'invoice.payment_succeeded') {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await db
        .update(userSubscription)
        .set({
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        })
        .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
    }

    return { received: true };
  });
