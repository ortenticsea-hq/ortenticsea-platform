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
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
   Optional: set `VITE_PAYSTACK_CHECKOUT_URL` in `.env.local` for checkout redirect
   Paystack return URLs supported by app: `?payment=success|cancel` or `?status=success|cancelled`
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
- Deploy Cloud Functions and set `PAYSTACK_SECRET_KEY` so Paystack webhooks can mark orders paid and decrement stock.
