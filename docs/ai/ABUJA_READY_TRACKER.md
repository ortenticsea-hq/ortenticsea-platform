# Abuja-Ready Integration Tracker

This document serves as the central project management tracker for the "Abuja-Ready" fullstack integration. It tracks progress, defines success criteria, and outlines the workflow for moving from mock data to production infrastructure.

## 🔄 Workflow & Measurement

### How to Use This Tracker
1.  **Pick a Task**: Select an unchecked item (`[ ]`) from a phase.
2.  **Implementation**: Follow the `TECH_STACK.md` and `architecture.md` guidelines.
3.  **Verification**: Ensure the "Success Criteria" for that phase are met.
4.  **Update**: Mark the item as complete (`[x]`) and commit this file.

### Definition of Done (DoD)
- [ ] Code implemented and linted.
- [ ] Error handling added (no silent failures).
- [ ] Types defined (no `any`).
- [ ] Documentation updated (if architecture changed).
- [ ] Verified locally.

---

## 📊 Progress Dashboard

| Phase | Focus | Status | Completion % |
| :--- | :--- | :--- | :--- |
| **A** | Authentication | 🟢 Complete | 100% |
| **B** | Real-time DB | 🟢 Complete | 90% |
| **C** | Payments | 🔴 Pending | 0% |
| **D** | Media Storage | 🔴 Pending | 0% |
| **E** | Deployment | 🔴 Pending | 0% |

---

## 🛠️ Phase A: Authentication (Firebase Auth)
**Goal**: Secure user identity and enable personalized experiences.

- [x] **Setup**: Initialize Firebase Auth in the project. (Done in `services/firebaseConfig.ts`)
- [x] **Context**: Create `AuthContext` to manage user state globally.
- [ ] **Login View**: Refactor `LoginView.tsx` to use Firebase SDK.
    - [ ] Email/Password Sign-in.
    - [ ] Google Sign-in.
- [ ] **Registration**: Create Sign-up flow (if distinct from Login).
- [ ] **Phone Auth**: Implement Phone Number verification (Critical for Nigeria).
- [ ] **Route Protection**: Create `ProtectedRoute` component for seller/admin routes.
- [ ] **Logout**: Implement secure session termination.

**Success Criteria**:
> User can sign in with Google, refresh the page, and remain signed in.

---

## 🗄️ Phase B: Real-time Database (Cloud Firestore)
**Goal**: Persist data and enable real-time updates for the marketplace.

- [x] **Schema Design**: Define TypeScript interfaces for all collections. (Done in `types.ts`)
- [x] **Users Collection**: Sync Auth profiles to `users/{userId}`. (Done in `services/firebaseAuthService.ts`)
- [x] **Products Collection**:
    - [x] Migrate mock products to Firestore.
    - [x] Create `ProductService` for CRUD operations. (Done in `services/firestoreService.ts`)
- [x] **Applications Collection**: Store Seller KYC data. (Done with real-time subscriptions)
- [x] **Inventory Collection**: Seller inventory management. (Done in `services/sellerToolsService.ts`)
- [x] **Reviews Collection**: Product and seller reviews with real-time updates.
- [x] **Shared Cart Comments**: Real-time comments on shared carts.
- [ ] **Transactions Collection**: Ledger for sales and escrow status.
- [ ] **Conversations**: Implement chat persistence.
- [x] **Hooks**: Create custom hooks (e.g., `useProducts`, `useUser`). (Done in `hooks/useFirestore.ts`)

**Success Criteria**:
> A product added by a seller appears instantly on the buyer's feed without refresh. ✅

**Migration Documentation**: See [`docs/FIRESTORE_MIGRATION.md`](../FIRESTORE_MIGRATION.md)

---

## 💳 Phase C: Payment Integration (Paystack)
**Goal**: Secure NGN payments with escrow logic.

- [ ] **Backend Setup**: Initialize Cloud Functions for Paystack (keep secrets server-side).
- [ ] **Initialization**: Create endpoint to generate Paystack transaction reference.
- [ ] **Frontend**:
    - [ ] Integrate Paystack Popup/Redirect in `CartView.tsx`.
    - [ ] Handle "Success" and "Cancelled" states.
- [ ] **Webhooks**: Handle Paystack webhooks to update Firestore `transactions`.
- [ ] **Escrow Logic**: Implement status flow (`paid` -> `held` -> `released`).

**Success Criteria**:
> User completes a test payment, and the order status updates to "Paid" in Firestore automatically.

---

## 🖼️ Phase D: Media Storage
**Goal**: Replace mock URLs with real user-uploaded content.

- [ ] **Setup**: Configure Firebase Storage buckets.
- [ ] **Upload Component**: Create a reusable Image Upload UI with progress bar.
- [ ] **Optimization**: Implement client-side resizing before upload (save bandwidth).
- [ ] **Integration**: Connect upload component to `AddProduct` form.

**Success Criteria**:
> Seller uploads a photo from their phone, and it renders in the product card.

---

## 🚀 Phase E: Deployment & Scalability
**Goal**: Production readiness.

- [ ] **Environment Variables**: Audit `.env` usage and security.
- [ ] **Security Rules**: Write Firestore Security Rules (read/write permissions).
- [ ] **Hosting**: Deploy frontend to Firebase Hosting/Vercel.
- [ ] **CI/CD**: Set up GitHub Actions for automated deployment.