# DH Signature

DH-owned Outlook signature platform intended to replace WiseStamp with a premium, tenant-wide Microsoft 365 signature experience.

## What This Repo Is

This monorepo contains the first build scaffold for:

- `apps/admin-web`
  - premium admin UI for signature templates, deployment rules, and live previews
- `apps/api`
  - API for signature assignment, rendering, audit logging, and future Microsoft sync
- `apps/outlook-addin`
  - Outlook compose add-in shell for compose-time signature insertion
- `packages/shared-types`
  - shared data contracts and mock tenant/profile/template data
- `packages/signature-renderer`
  - shared HTML/plain-text signature renderer

## Product Goal

Build a proper DH-managed signature platform where:

- staff see the signature while typing in Outlook
- deployment is tenant-wide
- DH controls templates, branding, links, and social buttons
- signature admins can activate signatures for all users and force a refresh when user details are wrong
- signatures are generated from centrally managed staff data
- fallback enforcement can be added later at the Exchange layer

## Phase 1 Included In This Scaffold

- monorepo structure
- premium admin UI starter
- Microsoft Entra ID login scaffold for the admin app
- shared signature renderer
- mock signature profile/template data
- API endpoint for rendering a signature by email
- admin overview endpoint for tenant controls
- Outlook add-in shell with compose event placeholder
- Outlook manifest starter

## Current Gaps

This is the starting build, not the finished product yet.

Still to do:

- real Microsoft Entra admin role checks
- proper database layer
- tenant/user sync from Microsoft 365
- add-in local dev/build pipeline
- real event-based compose insertion tied to API output
- duplicate prevention for replies/forwards
- Exchange fallback signature enforcement
- analytics and audit log storage

## Local Structure

```text
dh-signature/
  apps/
    admin-web/
    api/
    outlook-addin/
  packages/
    shared-types/
    signature-renderer/
  docs/
```

## Next 4 Build Phases

### Phase 2

- connect admin UI to real API state
- add signature template editor controls
- add tenant settings and social/link management
- add per-user and per-department assignment model

### Phase 3

- add database schema for templates, profiles, branding, assignments, and audit events
- add Microsoft Entra auth for admin access
- add API persistence and audit logging
- add signature preview endpoints for desktop/mobile/reply modes

### Phase 4

- implement real Outlook add-in compose insertion
- support new email, reply, and forward flows
- prevent duplicate signatures
- support sender-aware identity selection

### Phase 5

- add Exchange / Microsoft 365 fallback enforcement
- add rollout controls, deployment health, and mailbox targeting
- add campaign banners, department variants, and scheduling
- add usage analytics and approval/audit surfaces

## Getting Started

Once dependencies are installed:

```bash
npm install
npm run dev:admin
npm run dev:api
```

Admin UI runs on `http://localhost:4177`

API runs on `http://localhost:4188`

### Admin app environment

Create admin app env vars when wiring real Entra auth:

```bash
VITE_ENTRA_CLIENT_ID=your-app-client-id
VITE_ENTRA_TENANT_ID=your-tenant-id
VITE_ENTRA_REDIRECT_URI=http://localhost:4177
```

## Cloudflare Deployment

The current **admin UI** should be deployed as a **Cloudflare Pages** project.

It is **not** a Worker right now.

Use these settings in Cloudflare Pages:

- Project type: `Pages`
- Production branch: `main`
- Root directory: `apps/admin-web`
- Framework preset: `Vite`
- Build command: `npm install && npm run build --workspace @dh-signature/admin-web`
- Build output directory: `dist`

Recommended production env vars for the admin app:

```bash
VITE_ENTRA_CLIENT_ID=your-production-entra-client-id
VITE_ENTRA_TENANT_ID=your-tenant-id
VITE_ENTRA_REDIRECT_URI=https://your-admin-domain
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DH_BUSINESS_LANDLINE=02920 024218
DH_WEBSITE_URL=https://dhwebsiteservices.co.uk
DH_WORKPLACE_URL=https://workplace.dhwebsiteservices.co.uk
DH_BOOKING_URL=https://dhwebsiteservices.co.uk/contact
DH_INSTAGRAM_URL=https://instagram.com/dhwebsiteservices
DH_FACEBOOK_URL=https://facebook.com/dhwebsiteservices
DH_LINKEDIN_URL=https://linkedin.com/company/dhwebsiteservices
DH_WHATSAPP_URL=https://wa.me/442920024218
```

Important:

- the **admin UI** is Pages
- the **live admin API** now runs through Cloudflare Pages Functions inside `apps/admin-web/functions`
- the separate `apps/api` scaffold still exists for later expansion, but the deployed admin app no longer needs a separate backend just to load staff data
- the **Outlook add-in** assets can be hosted from the same admin domain later, but the compose/event logic still needs more build work

## Important Notes

- This repo is intentionally separate from `dh-portal-v2`
- it is meant to become a standalone DH platform product
- design quality matters: this should feel premium, not like a generic internal admin
