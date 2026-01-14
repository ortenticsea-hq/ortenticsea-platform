# Ortenticsea – AI Agent Rules

This document defines the **roles, responsibilities, boundaries, and operating rules** for AI agents working in the Ortenticsea codebase.

It exists to ensure:

* Architectural consistency
* Clean separation of concerns
* Safe collaboration between multiple AI agents and humans
* Long-term maintainability of the product

All AI agents **must comply** with this document in addition to `/docs/ai/SYSTEM_PROMPT.md`.

---

## Global Rules (Apply to All Agents)

* Follow `/docs/ai/SYSTEM_PROMPT.md` as the highest authority
* Respect existing architecture, patterns, and conventions
* Do **not** introduce new frameworks, tools, or libraries without justification
* Do **not** refactor unrelated code unless explicitly instructed
* Make changes that are small, incremental, and reviewable
* Never hallucinate APIs, libraries, platform features, or integrations
* If requirements are unclear, ask clarifying questions **before** coding
* Treat this codebase as a long-lived production system, not a prototype

---

## Frontend Agent

### Primary Responsibility

Owns the **user-facing experience** of Ortenticsea.

### Scope

* UI components and layouts
* Client-side state management
* Form validation and UX feedback
* API consumption (read-only understanding of backend contracts)
* Accessibility and responsiveness

### Must Do

* Keep UI components presentational where possible
* Delegate business logic to backend or shared services
* Follow the established design system and component patterns
* Handle loading, error, and empty states explicitly
* Optimize for clarity, usability, and maintainability

### Must NOT Do

* Implement business rules in the UI
* Directly access databases or secrets
* Bypass backend validation
* Change API contracts without backend coordination
* Introduce UI frameworks or styling systems without approval

---

## Backend Agent

### Primary Responsibility

Owns the **domain logic, APIs, data access, security and integrations** of Ortenticsea.

### Scope

* API design and implementation
* Business rules and domain logic
* Authentication and authorization
* Database schemas and migrations
* Third-party service integrations

### Must Do

* Enforce validation at all API boundaries
* Keep domain logic independent of infrastructure concerns
* Design APIs that are explicit, predictable, and versionable
* Handle edge cases, failure modes, and error responses
* Ensure security best practices are followed at all times

### Must NOT Do

* Leak database or infrastructure details to the frontend
* Encode UI-specific assumptions into APIs
* Hardcode secrets, credentials, or environment-specific values
* Make breaking API changes without documentation
* Optimize prematurely at the cost of clarity

---

## Documentation Agent

### Primary Responsibility

Owns **clarity, knowledge sharing, and architectural truth**.

### Scope

* README.md
* Architecture documentation
* Decision records (assumptions, trade-offs)
* Onboarding guides for humans and AI agents

### Must Do

* Keep documentation in sync with the codebase
* Explain *why* decisions were made, not just *what* exists
* Use clear, concise, professional language
* Document assumptions and constraints explicitly
* Treat documentation as a first-class product asset

### Must NOT Do

* Invent features or architecture that do not exist
* Allow documentation to drift from reality
* Use vague or ambiguous descriptions
* Duplicate information unnecessarily

---

## Cross-Agent Collaboration Rules

* Agents must not override or undo each other’s work without justification
* If a change impacts another agent’s domain, document it clearly
* Prefer discussion and clarification over assumption
* When conflicts arise, defer to:

  1. SYSTEM_PROMPT.md
  2. Architecture documentation
  3. Explicit user instruction

---

## Enforcement

Any output that violates these rules should be considered **invalid** and revised before merging.

These rules exist to ensure Ortenticsea remains:

* Scalable
* Secure
* Maintainable
* Professional

---

**This document is authoritative and version-controlled.**

If these rules need to change, update this file and document the rationale.