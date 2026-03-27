# Production Checkout Deployment

This app's checkout flow is production-ready in code, but it depends on live Firebase and Paystack configuration outside the repo.

The production Firebase project alias is `prod`, which maps to `ortenticsea-platform-40741`.

## What this repo already does

- The web app creates an order in Firestore.
- The app calls the `initPaystackTransaction` Firebase Function.
- The function initializes checkout with Paystack using `PAYSTACK_SECRET_KEY`.
- The Paystack webhook updates the order to `paid` and decrements stock.

## One-time setup

1. Install the Firebase CLI.
2. Log into Firebase CLI with the Google account that owns the production project.
3. Confirm Paystack live mode is enabled in your Paystack dashboard.
4. Confirm you have the live secret key, not the test key.

## Commands to run locally

Run these from the project root:

```powershell
npm install
cd functions
npm install
cd ..
firebase login
firebase use prod
```

## Manual task: set the Paystack production secret

This must be done manually because it requires your live credential.

```powershell
firebase functions:secrets:set PAYSTACK_SECRET_KEY --project prod
```

Use your live Paystack secret key when prompted:

```text
sk_live_...
```

After changing a secret, redeploy any functions that use it.

## Deploy Firestore and Storage rules

```powershell
firebase deploy --only firestore,storage --project prod
```

## Deploy checkout functions

```powershell
firebase deploy --only functions:initPaystackTransaction,functions:paystackWebhook --project prod
```

If you prefer to deploy all functions:

```powershell
firebase deploy --only functions --project prod
```

## Manual task: register the live Paystack webhook

After deployment, Firebase CLI will print the live function URL for `paystackWebhook`.

It will typically look like:

```text
https://us-central1-ortenticsea-platform-40741.cloudfunctions.net/paystackWebhook
```

In Paystack Dashboard:

1. Open `Settings`.
2. Open `API Keys & Webhooks`.
3. Switch to live mode.
4. Paste the deployed `paystackWebhook` URL into the webhook field.
5. Save the changes.

Important:

- Use the live Paystack dashboard for production.
- The Firebase secret and Paystack mode must match.
- `sk_live_...` must be paired with the live webhook configuration.

## Smoke test checklist

1. Sign in to the production app with a buyer account.
2. Add an in-stock product to cart.
3. Start checkout.
4. Confirm Paystack opens successfully.
5. Complete a real payment in live mode.
6. Confirm the order status changes from `pending` to `paid`.
7. Confirm product stock decreases.
8. Confirm the order appears in the buyer's Orders page.

## Fast troubleshooting

- If checkout fails before Paystack opens, the callable function is usually not deployed or the secret is missing.
- If Paystack opens but the order stays `pending`, the webhook is usually missing, pointed at the wrong URL, or running with the wrong secret.
- If order creation fails before redirect, check deployed Firestore rules and authenticated user access.
