import Stripe from 'stripe';
import { storage } from './storage';

// Initialize Stripe (will be null if no API key is configured)
const stripeApiKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeApiKey ? new Stripe(stripeApiKey, {
  apiVersion: '2024-12-18.acacia',
}) : null;

// Pricing tiers configuration
export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    eventQuota: 10000,
    priceId: process.env.STRIPE_PRICE_FREE,
  },
  pro: {
    name: 'Pro',
    price: 4900, // $49 in cents
    eventQuota: 500000,
    priceId: process.env.STRIPE_PRICE_PRO,
  },
  business: {
    name: 'Business',
    price: 19900, // $199 in cents
    eventQuota: 5000000,
    priceId: process.env.STRIPE_PRICE_BUSINESS,
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Custom pricing
    eventQuota: 50000000,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
  },
} as const;

export type PlanType = keyof typeof PRICING_TIERS;

/**
 * Create or retrieve a Stripe customer for a workspace
 */
export async function getOrCreateStripeCustomer(workspaceId: string, email: string): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const workspace = await storage.getWorkspace(workspaceId);
  if (!workspace) {
    throw new Error('Workspace not found');
  }

  // Return existing customer if available
  if (workspace.stripeCustomerId) {
    return workspace.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      workspaceId,
      workspaceName: workspace.name,
    },
  });

  // Save customer ID to workspace
  await storage.updateWorkspace(workspaceId, {
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

/**
 * Create a checkout session for plan upgrade
 */
export async function createCheckoutSession(
  workspaceId: string,
  plan: PlanType,
  successUrl: string,
  cancelUrl: string,
  customerEmail: string
): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  if (plan === 'free') {
    throw new Error('Cannot create checkout for free plan');
  }

  const priceId = PRICING_TIERS[plan].priceId;
  if (!priceId) {
    throw new Error(`Price ID not configured for ${plan} plan`);
  }

  // Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(workspaceId, customerEmail);

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      workspaceId,
      plan,
    },
    subscription_data: {
      metadata: {
        workspaceId,
        plan,
      },
    },
  });

  return session;
}

/**
 * Handle successful checkout (called by webhook)
 */
export async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const workspaceId = session.metadata?.workspaceId;
  const plan = session.metadata?.plan as PlanType;

  if (!workspaceId || !plan) {
    throw new Error('Missing workspace ID or plan in session metadata');
  }

  const subscriptionId = session.subscription as string;

  // Update workspace with new plan and subscription
  await storage.updateWorkspace(workspaceId, {
    plan,
    eventQuota: PRICING_TIERS[plan].eventQuota,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: 'active',
  });
}

/**
 * Handle subscription updates (called by webhook)
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const workspaceId = subscription.metadata.workspaceId;

  if (!workspaceId) {
    throw new Error('Missing workspace ID in subscription metadata');
  }

  // Update subscription status
  await storage.updateWorkspace(workspaceId, {
    subscriptionStatus: subscription.status,
  });

  // If subscription is canceled or past_due, notify the workspace
  if (subscription.status === 'canceled' || subscription.status === 'past_due') {
    // TODO: Send email notification
    console.warn(`Subscription ${subscription.id} is ${subscription.status}`);
  }
}

/**
 * Handle subscription deletion (called by webhook)
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const workspaceId = subscription.metadata.workspaceId;

  if (!workspaceId) {
    throw new Error('Missing workspace ID in subscription metadata');
  }

  // Downgrade to free plan
  await storage.updateWorkspace(workspaceId, {
    plan: 'free',
    eventQuota: PRICING_TIERS.free.eventQuota,
    stripeSubscriptionId: null,
    subscriptionStatus: 'canceled',
  });
}

/**
 * Create a billing portal session for managing subscription
 */
export async function createBillingPortalSession(
  workspaceId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const workspace = await storage.getWorkspace(workspaceId);
  if (!workspace?.stripeCustomerId) {
    throw new Error('No Stripe customer found for this workspace');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get subscription details for a workspace
 */
export async function getSubscriptionDetails(workspaceId: string): Promise<{
  subscription: Stripe.Subscription | null;
  upcomingInvoice: Stripe.Invoice | null;
}> {
  if (!stripe) {
    return { subscription: null, upcomingInvoice: null };
  }

  const workspace = await storage.getWorkspace(workspaceId);
  if (!workspace?.stripeSubscriptionId) {
    return { subscription: null, upcomingInvoice: null };
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(workspace.stripeSubscriptionId);

    // Get upcoming invoice
    let upcomingInvoice: Stripe.Invoice | null = null;
    if (workspace.stripeCustomerId) {
      try {
        upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          customer: workspace.stripeCustomerId,
        });
      } catch (error) {
        // No upcoming invoice (probably on free plan or canceled)
        console.log('No upcoming invoice');
      }
    }

    return { subscription, upcomingInvoice };
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return { subscription: null, upcomingInvoice: null };
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(workspaceId: string): Promise<void> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const workspace = await storage.getWorkspace(workspaceId);
  if (!workspace?.stripeSubscriptionId) {
    throw new Error('No active subscription found');
  }

  await stripe.subscriptions.update(workspace.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(workspaceId: string): Promise<void> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const workspace = await storage.getWorkspace(workspaceId);
  if (!workspace?.stripeSubscriptionId) {
    throw new Error('No subscription found');
  }

  await stripe.subscriptions.update(workspace.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });
}
