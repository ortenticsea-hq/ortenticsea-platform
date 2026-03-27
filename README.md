<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1u7L0tJqjMFnTweKgfXr6EJmwYPYXlHpt

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
   Checkout is initialized through Firebase Cloud Functions, not a client-side Paystack URL.
   Paystack return URLs supported by app: `?view=payment-success`, `?view=payment-cancel`, `?payment=success|cancel`, or `?status=success|cancelled`
3. Run the app:
   `npm run dev`

## Admin Claims Setup (Do Not Commit Keys)

To grant admin access in production, use Firebase custom claims (standard approach). Keep your service account JSON private and local:

1. Download a Firebase Admin SDK service account JSON.
2. Save it to `scripts/serviceAccount.json` (this path is gitignored).
3. Run:
   `npm run admin:claims`
   Optional: `ADMIN_EMAILS=francisetham01@gmail.com,ortenticseateam@gmail.com npm run admin:claims`
4. Deploy Firestore rules:
   `scripts\deploy-firestore-rules.bat`

This sets the `role: 'admin'` claim and updates the Firestore `users/{uid}.role` to `admin` for configured emails.

## Launch Checklist

- Deploy Firestore rules (`firestore.rules`) so only approved products are public and admin/sellers keep access.
- Deploy Storage rules (`storage.rules`) so sellers can only upload to their own product folders.
- Verify admin claims are set (`npm run admin:claims`) and admin can access `admin-dashboard`.
- Confirm public browsing shows only approved products.
- Confirm seller dashboard shows the seller's own pending/approved/rejected listings.
- Deploy Cloud Functions and set `PAYSTACK_SECRET_KEY` so checkout can initialize and Paystack webhooks can mark orders paid and decrement stock.
- Point the Paystack webhook endpoint at the deployed `paystackWebhook` Cloud Function.

## Production Checkout

Production checkout uses Firebase Cloud Functions plus a live Paystack webhook.

1. Install Firebase CLI and log in:
   `firebase login`
2. Select the production alias:
   `firebase use prod`
3. Set the live Paystack secret in Firebase Functions:
   `firebase functions:secrets:set PAYSTACK_SECRET_KEY --project prod`
4. Deploy rules:
   `firebase deploy --only firestore,storage --project prod`
5. Deploy checkout functions:
   `firebase deploy --only functions:initPaystackTransaction,functions:paystackWebhook --project prod`
6. Copy the deployed `paystackWebhook` URL from the Firebase CLI output.
7. In Paystack live dashboard, open `Settings` -> `API Keys & Webhooks` and register that URL as the webhook endpoint.
8. Complete a real end-to-end payment and verify the order changes from `pending` to `paid`.

Detailed runbook: [docs/production-checkout-deploy.md](docs/production-checkout-deploy.md)
