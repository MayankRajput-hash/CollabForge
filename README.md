# CollabForge

CollabForge is a React and Vite application for discovering projects, matching with collaborators, managing project workspaces, and messaging teammates.

## Local development

```sh
npm install
npm run dev
```

Without Supabase settings, the app uses browser-local storage. Local data is not shared with other people or devices and should only be used for development or demos.

## Supabase setup

1. Create a Supabase project.
2. Apply [`supabase/migrations/20261111_collaboration_system.sql`](./supabase/migrations/20261111_collaboration_system.sql) to its SQL editor or migration runner. It provisions profiles and the email-free `public_profiles` view, project workspace fields, requests and messages, Realtime publication, row-level policies, and atomic request acceptance.
3. If your Supabase project already has a `profiles` table or `public_profiles` view, compare its schema and view columns with the migration before applying it.
4. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the project URL and publishable/anon key. Never put a Supabase service-role/secret key in a `VITE_` variable.
5. In Supabase Authentication, configure the allowed site and redirect URLs for the deployed domain, including `/profile` and `/update-password`.
6. Deploy the site and set the same two public environment variables in the hosting provider.

The browser client intentionally uses only the public key. Database policies are required: do not disable row-level security or expose a service-role key to the browser.

## Validation and production build

```sh
npm run lint
npm run build
npm run preview
```

Application pages are loaded on demand, so the landing page does not download all dashboard, messaging, and account screens up front.
