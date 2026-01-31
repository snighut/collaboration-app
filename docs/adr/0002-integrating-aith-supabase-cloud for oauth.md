
# ADR 0002: Integrating Auth with Supabase Cloud for OAuth

## Context

We are building an app targeting up to 10,000 monthly active users (MAUs). A key requirement is to offload OAuth sign-up and authentication to a cloud provider, ideally for free or minimal cost. The 2026 landscape offers several options, with Supabase, Clerk, and Firebase as leading contenders.

## Supabase for OAuth

- **Free Tier Generosity:** As of 2026, Supabase's free plan supports up to **50,000 MAUs** for authentication, which comfortably covers our 10k MAU goal.
- **Bundled Services:** Supabase offers Auth, Database (PostgreSQL), and Storage in a single platform, simplifying integration and management.
- **PostgreSQL Integration:** Auth is tightly integrated with PostgreSQL and supports Row Level Security (RLS), allowing fine-grained access control using JWTs.
- **UI Considerations:** Supabase provides a basic auth-ui library, but most production apps will want to build custom UI components for sign-up/login flows.
- **Project Pausing:** On the free tier, projects are paused after 7 days of inactivity. For a live app with 10k MAUs, this is not a concern, but it may affect development environments.
- **Email Limits:** The built-in SMTP for auth-related emails (welcome, password reset, etc.) has a soft limit. For high email volume, connecting a custom SMTP provider (e.g., Resend, SendGrid) is recommended.

## Alternatives

- **Clerk:**
	- Best for teams wanting drop-in, professional-looking auth UI components with minimal frontend work.
	- Free tier is competitive, but advanced B2B features (Organizations, RBAC) are often gated behind paid plans.

- **Firebase:**
	- Strongest for mobile-heavy apps (iOS/Android) and those needing deep Google ecosystem integration (e.g., push notifications).
	- Free tier is generous, but pricing and feature set are more mobile-centric.

## Decision

**Supabase is the best fit for our needs**:

- We plan to use PostgreSQL and want seamless integration between auth and our database.
- The free tier easily supports our 10k MAU target.
- We are comfortable building our own auth UI or using Supabase's basic components.
- We accept the need to monitor email limits and possibly add a custom SMTP provider as we scale.

## Consequences

- We will use Supabase Auth for OAuth and user management.
- We will monitor project activity to avoid free tier pausing during development.
- We will plan for a custom SMTP provider if email volume grows.

## 2026 Market Note

Supabase remains the leader for bundled Auth + DB + Storage on the free tier. Clerk and Firebase are strong alternatives for specific use cases (frontend speed, mobile focus, or advanced B2B auth features).
