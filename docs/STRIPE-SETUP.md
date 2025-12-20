# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe billing for your SFS Analytics Engine.

## Prerequisites

- A Stripe account (sign up at https://dashboard.stripe.com/register)
- Your SFS Analytics Engine already deployed and running
- Access to your server's environment variables

---

## Step 1: Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up with your email and create an account
3. Complete the business verification (you can start in test mode first)

---

## Step 2: Get Your API Keys

### Test Mode (for development)

1. In your Stripe Dashboard, make sure "Test mode" is ON (toggle in top right)
2. Go to **Developers** → **API keys**
3. Copy your:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - click "Reveal test key"

### Production Mode (when ready to go live)

1. Complete your Stripe account activation
2. Toggle "Test mode" OFF
3. Copy your live keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

---

## Step 3: Create Products and Prices

You need to create 4 products in Stripe (one for each pricing tier).

### Option A: Using Stripe Dashboard (Recommended for beginners)

1. Go to **Products** → **Add product**

**Pro Plan:**
- Name: `Analytics Pro`
- Description: `Professional analytics for growing businesses`
- Pricing:
  - Price: `$49.00 USD`
  - Billing period: `Monthly`
  - Payment type: `Recurring`
- Click **Save product**
- Copy the **Price ID** (starts with `price_`) → Use for `STRIPE_PRICE_PRO`

**Business Plan:**
- Name: `Analytics Business`
- Description: `Advanced analytics for scaling companies`
- Pricing:
  - Price: `$199.00 USD`
  - Billing period: `Monthly`
  - Payment type: `Recurring`
- Click **Save product**
- Copy the **Price ID** → Use for `STRIPE_PRICE_BUSINESS`

**Enterprise Plan:**
- Name: `Analytics Enterprise`
- Description: `Custom analytics for enterprise organizations`
- Pricing:
  - Price: `$999.00 USD` (or custom amount)
  - Billing period: `Monthly`
  - Payment type: `Recurring`
- Click **Save product**
- Copy the **Price ID** → Use for `STRIPE_PRICE_ENTERPRISE`

**Free Plan:**
- The free plan doesn't need a Stripe product
- Just set `STRIPE_PRICE_FREE=` (leave empty or use dummy value)

### Option B: Using Stripe CLI (Advanced)

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login
stripe login

# Create Pro plan
stripe products create \
  --name="Analytics Pro" \
  --description="Professional analytics for growing businesses"

stripe prices create \
  --product=prod_XXXXX \
  --unit-amount=4900 \
  --currency=usd \
  --recurring[interval]=month

# Create Business plan
stripe products create \
  --name="Analytics Business" \
  --description="Advanced analytics for scaling companies"

stripe prices create \
  --product=prod_YYYYY \
  --unit-amount=19900 \
  --currency=usd \
  --recurring[interval]=month

# Create Enterprise plan
stripe products create \
  --name="Analytics Enterprise" \
  --description="Custom analytics for enterprise"

stripe prices create \
  --product=prod_ZZZZZ \
  --unit-amount=99900 \
  --currency=usd \
  --recurring[interval]=month
```

---

## Step 4: Set Up Webhook Endpoint

Webhooks allow Stripe to notify your server when events happen (like successful payments, subscription cancellations, etc.)

### 4.1 Configure Webhook in Stripe Dashboard

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - Example: `https://sfs-analytics.replit.app/api/webhooks/stripe`
4. Description: `SFS Analytics subscription events`
5. Events to send:
   - Select **customer.subscription.created**
   - Select **customer.subscription.updated**
   - Select **customer.subscription.deleted**
   - Select **checkout.session.completed**
   - Select **invoice.payment_failed**
   - Select **invoice.payment_succeeded**
6. Click **Add endpoint**
7. Copy your **Signing secret** (starts with `whsec_`) → Use for `STRIPE_WEBHOOK_SECRET`

### 4.2 Test Webhook Locally (Optional)

If you're developing locally, use Stripe CLI to forward webhooks:

```bash
# Forward webhooks to your local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# This will give you a webhook signing secret starting with whsec_
# Use this for STRIPE_WEBHOOK_SECRET in your local .env
```

---

## Step 5: Update Environment Variables

Add these to your `.env` file:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs
STRIPE_PRICE_FREE=
STRIPE_PRICE_PRO=price_1234567890abcdef
STRIPE_PRICE_BUSINESS=price_0987654321fedcba
STRIPE_PRICE_ENTERPRISE=price_abcdef1234567890
```

**Important:**
- For production, use `sk_live_` and `pk_live_` keys
- Never commit your `.env` file to version control
- Restart your server after updating environment variables

---

## Step 6: Test the Integration

### 6.1 Test Checkout Flow

1. Start your server: `npm run dev`
2. Login to your app
3. Go to **Settings** → **Billing**
4. Click **Select Plan** on the Pro plan
5. You should be redirected to Stripe Checkout

### 6.2 Use Stripe Test Cards

When testing, use these test card numbers:

**Successful Payment:**
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Payment Requires Authentication (3D Secure):**
- Card number: `4000 0027 6000 3184`

**Payment Declined:**
- Card number: `4000 0000 0000 0002`

Full list: https://stripe.com/docs/testing

### 6.3 Verify Webhook Events

1. Complete a test checkout
2. Check your server logs for:
   ```
   Checkout completed: cs_test_xxxxx
   Subscription updated: sub_xxxxx
   ```
3. In Stripe Dashboard, go to **Developers** → **Webhooks** → Your endpoint
4. You should see successful webhook deliveries (200 status)

---

## Step 7: Enable Customer Portal (Recommended)

The Customer Portal allows users to manage their subscriptions, update payment methods, and view invoices.

1. Go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate test link** (or **Activate** for live mode)
3. Configure settings:
   - **Allow customers to update payment methods:** ✅ Enabled
   - **Allow customers to cancel subscriptions:** ✅ Enabled
   - **Invoice history:** ✅ Show all invoices
   - **Business information:** Add your company name, support email
4. Click **Save changes**

Now users can click "Manage Subscription" in your app to access their Stripe portal.

---

## Step 8: Going Live Checklist

Before switching to production:

- [ ] Complete Stripe account activation
- [ ] Activate your Stripe account (add business details, bank account)
- [ ] Create live products and prices
- [ ] Update environment variables with live keys (`sk_live_`, `pk_live_`)
- [ ] Set up live webhook endpoint
- [ ] Test with real payment method
- [ ] Review Stripe's "Going Live" checklist: https://dashboard.stripe.com/go-live
- [ ] Enable fraud detection (Stripe Radar)
- [ ] Set up email receipts in Stripe
- [ ] Configure tax settings (if applicable)

---

## Common Issues & Solutions

### Issue: "Stripe is not configured" error

**Solution:** Make sure `STRIPE_SECRET_KEY` is set in your `.env` file and the server has been restarted.

### Issue: Webhook signature verification failed

**Solution:**
1. Check that `STRIPE_WEBHOOK_SECRET` matches your webhook's signing secret
2. Make sure you're using the raw request body (not parsed JSON)
3. Verify the webhook endpoint URL matches exactly

### Issue: Checkout redirects but plan doesn't upgrade

**Solution:**
1. Check webhook is receiving `checkout.session.completed` events
2. Verify metadata includes `workspaceId` and `plan`
3. Check server logs for errors in `handleCheckoutComplete()`

### Issue: Customer Portal not working

**Solution:**
1. Make sure Customer Portal is activated in Stripe Dashboard
2. Check that workspace has a `stripeCustomerId` saved
3. Verify user is authenticated when accessing portal

---

## Testing Subscription Lifecycle

### Test Plan Upgrade

1. Start on free plan
2. Click "Upgrade to Pro"
3. Complete checkout with test card `4242 4242 4242 4242`
4. Verify:
   - Plan changes to "pro"
   - Event quota increases to 500,000
   - `stripeSubscriptionId` is saved

### Test Subscription Cancellation

1. Go to Settings → Billing → Manage Subscription (if implemented)
2. Or use Stripe Dashboard: Subscriptions → Cancel subscription
3. Verify:
   - `customer.subscription.deleted` webhook received
   - Plan downgrades to "free"
   - Event quota resets to 10,000

### Test Payment Failure

1. Use Stripe Dashboard to simulate failed payment
2. Or change card to declined card in Customer Portal
3. Verify:
   - `invoice.payment_failed` webhook received
   - Subscription status updates accordingly
   - User is notified (if email notifications implemented)

---

## Next Steps

Once Stripe is working:

1. **Add Billing Portal Button** - Let users manage subscriptions
2. **Email Notifications** - Notify users about payment issues
3. **Usage Alerts** - Warn users approaching quota limits
4. **Analytics Tracking** - Track conversion rates, churn, MRR
5. **Coupons & Trials** - Offer discounts for first-time customers

---

## Stripe Resources

- **Documentation:** https://stripe.com/docs
- **API Reference:** https://stripe.com/docs/api
- **Testing Guide:** https://stripe.com/docs/testing
- **Webhooks Guide:** https://stripe.com/docs/webhooks
- **Customer Portal:** https://stripe.com/docs/billing/subscriptions/customer-portal
- **Support:** https://support.stripe.com

---

## Security Best Practices

1. **Never expose secret keys** - Keep `STRIPE_SECRET_KEY` server-side only
2. **Validate webhooks** - Always verify webhook signatures
3. **Use HTTPS** - Stripe requires HTTPS for webhooks in production
4. **Rotate keys** - If keys are compromised, roll them immediately
5. **Monitor logs** - Watch for unusual activity or errors
6. **PCI Compliance** - Never store card numbers (Stripe handles this)

---

## Support

If you encounter issues:

1. Check server logs for detailed error messages
2. Review Stripe Dashboard → Developers → Logs
3. Use Stripe CLI for debugging: `stripe logs tail`
4. Consult Stripe documentation
5. Reach out to Stripe support (very responsive!)

---

**Your billing system is now ready to make money! 💰**

Start with test mode, verify everything works, then switch to live mode and start charging customers.
