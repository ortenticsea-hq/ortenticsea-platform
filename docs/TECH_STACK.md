# OrtenticSEA Technical Stack & Roadmap

This document outlines the current technical architecture and the roadmap for fullstack production readiness.

## 1. Current Frontend Architecture
- **Framework**: React 19 (Functional Components, Hooks)
- **Styling**: Tailwind CSS (Utility-first, JIT)
- **Icons**: Heroicons v2 (Outline & Solid)
- **AI Engine**: Google Gemini 3 Flash (via `@google/genai`)
- **Persistence**: Browser `localStorage` (Mocking Database behavior)
- **Audio**: Web Audio API (Synthesized UI feedback)

## 2. Fullstack Roadmap (The "Abuja-Ready" Integration)

### A. Authentication (Firebase Auth)
- **Implementation**: Replace `LoginView.tsx` logic with Firebase SDK.
- **Provider Support**: 
  - Email/Password
  - Google Sign-in
  - **Phone Authentication**: Critical for Nigerian users (WhatsApp/SMS verification).

### B. Real-time Database (Cloud Firestore)
- **Collections Schema**:
  - `users`: Profile data, roles (admin/seller/buyer), and location.
  - `products`: Master catalog with `status` (live/pending/sold).
  - `applications`: KYC data for seller onboarding.
  - `transactions`: Ledger entries for the Seller Success Suite.
  - `conversations`: Persisted chat history for O-Assist and user-to-seller messaging.

### C. Payment Integration (Paystack)
- **Flow**:
  1. User initiates checkout in `CartView.tsx`.
  2. Frontend calls a Firebase Cloud Function to initialize a Paystack transaction.
  3. Paystack Popup/Redirect handles the NGN payment.
  4. Webhook confirms payment; Firestore updates order status to `paid`.
  5. Escrow Logic: Funds held until buyer confirms receipt of "Grade-A" condition.

### D. Media Storage (Firebase Storage)
- **Current**: Base64/External Unsplash URLs.
- **Target**: Sellers upload actual photos of foreign-used stock.
- **Optimization**: Use Cloudinary or Firebase Extensions for image resizing/compression to save data for mobile users in Nigeria.

## 3. Deployment & Scalability
- **Hosting**: Firebase Hosting (CDN-backed) or Vercel.
- **Functions**: Node.js environment for handling sensitive Paystack Secret Keys and Gemini API heavy lifting.
- **Offline First**: Service Workers for caching the product catalog during network fluctuations in Abuja.

---

## 4. Feature Completion Checklist
- [ ] Connect `SellerToolsService.ts` to Firestore.
- [ ] Implement `PaystackButton` in `CartView.tsx`.
- [ ] Add "Push Notifications" for price drops and delivery updates.
- [ ] Migrate `constants.tsx` mock data to Firestore.

*Last Updated: February 2025*
