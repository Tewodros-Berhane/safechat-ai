# SafeChat.AI

SafeChat.AI is a modern Next.js application for real-time, AI-assisted messaging. It pairs a polished chat experience with guardrails like flagged-message workflows, friend controls, notifications, and presence so teams can keep conversations safe without slowing users down.

## Features
- Real-time direct messaging with message read receipts, online/offline presence, and a responsive chat UI.
- Account system powered by NextAuth (credentials), Prisma, and PostgreSQL with roles, profile editing, and avatar upload support.
- Friend requests and user search with privacy-aware profiles (private users require friendship before chat).
- Notification center with unread counts plus password reset emails via Nodemailer/Gmail.
- Moderation-ready data model: toxicity scores, flags, audit logs, and moderation logs persisted for review.
- Socket.io server route for live presence updates and in-app events.

## Tech Stack
- Framework: Next.js 16 (App Router + API routes), React 19, TypeScript.
- UI: Tailwind CSS 4, Radix UI primitives, Lucide icons, Sonner toasts.
- State & realtime: Zustand for client state, Socket.io for presence and live updates.
- Auth & data: NextAuth (JWT sessions), Prisma ORM with PostgreSQL.
- Email: Nodemailer with Gmail for password resets.

## Project Structure
- `app/` – App Router pages (marketing homepage, chat, notifications, profile) and API routes for auth, chats, friends, notifications, and user management.
- `pages/api/socket.ts` – Socket.io server endpoint for realtime presence and updates.
- `components/` – Shared UI components and providers (e.g., realtime).
- `stores/` – Zustand stores for chats, friends, notifications, and user data.
- `lib/` – Prisma client, mailer, socket helpers, presence utilities, and misc helpers.
- `prisma/` – Prisma schema and migrations.

## Getting Started
Prerequisites: Node.js 18+, PostgreSQL database, and a Gmail account for mail delivery.

1) Install dependencies
```bash
npm install
```

2) Configure environment  
Create a `.env.local` file with the required secrets:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
NEXTAUTH_SECRET="generate_a_strong_secret"
EMAIL_USER="your_gmail_address"
EMAIL_PASS="your_gmail_app_password"
NEXT_PUBLIC_BASE_URL="http://localhost:3000" # used in password reset links
```

3) Apply database migrations
```bash
npx prisma migrate dev
```

4) Run the development server
```bash
npm run dev
```
Visit `http://localhost:3000`.

## Scripts
- `npm run dev` – Start the Next.js dev server.
- `npm run build` – Create a production build.
- `npm run start` – Run the production server.
- `npm run lint` – Lint the codebase.

## Notes on Realtime & Auth
- Realtime presence and events are served from `pages/api/socket.ts` at the `/_next` API layer. The client registers the authenticated user to receive presence and notification events.
- NextAuth uses JWT sessions with credential login; cookie names switch between `next-auth.session-token` (dev) and `__Secure-next-auth.session-token` (production) based on `NODE_ENV`.

## Deployment Considerations
- Ensure the `NEXTAUTH_SECRET`, `DATABASE_URL`, and mail credentials are set in your hosting environment.
- Run `npx prisma migrate deploy` during deployment to sync the schema.
- For production email, use a dedicated SMTP provider or Gmail app passwords (not your primary password).

## License
This project is licensed under the MIT License — see `LICENSE` for details.
