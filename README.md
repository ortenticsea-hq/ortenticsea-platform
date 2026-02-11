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
3. Run the app:
   `npm run dev`

## Admin Claims Setup (Do Not Commit Keys)

To grant admin access, we use Firebase custom claims. Keep your service account JSON private and local:

1. Download a Firebase Admin SDK service account JSON.
2. Save it to `scripts/serviceAccount.json` (this path is gitignored).
3. Run:
   `npm run admin:claims`

This sets the `role: 'admin'` claim for the configured admin emails in `scripts/setAdminClaims.mjs`.
