# EcoPoints

A gamified recycling rewards platform where users earn points for recycling waste and redeem them for real-world rewards.

Built with **Next.js 16**, **MongoDB**, **NextAuth.js**, and **shadcn/ui**.

---

## Features

- **Points system** — earn points by recycling waste at partner locations
- **QR code scanning** — scan QR codes at recycling stations to log activity
- **Rewards catalog** — redeem points for discounts, products, and services
- **Authentication** — email/password sign-up and sign-in via NextAuth.js
- **Dark / light theme** — system-aware with manual toggle
- **i18n** — multi-language support (Russian, English, and more)

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Framework | Next.js 16 (App Router)                         |
| Database  | MongoDB (via official driver)                   |
| Auth      | NextAuth.js v4 with MongoDB adapter             |
| UI        | shadcn/ui + Radix UI + Tailwind CSS v4          |
| Forms     | React Hook Form + Zod                           |
| Charts    | Recharts                                        |
| Language  | TypeScript                                      |

---

## Project Structure

```
EcoPoints/
├── app/                        # Next.js App Router
│   ├── api/                    # ── BACKEND ──────────────────
│   │   ├── auth/[...nextauth]/ #   NextAuth route handler
│   │   └── register/           #   User registration endpoint
│   ├── auth/                   # ── FRONTEND ─────────────────
│   │   ├── login/              #   Login page
│   │   ├── sign-up/            #   Sign-up page
│   │   ├── sign-up-success/    #   Success confirmation
│   │   ├── error/              #   Auth error page
│   │   └── callback/           #   OAuth callback
│   ├── dashboard/              #   Protected dashboard
│   │   ├── page.tsx            #   Main dashboard
│   │   ├── qr/                 #   QR scanner page
│   │   └── rewards/            #   Rewards catalog
│   ├── layout.tsx              #   Root layout + providers
│   ├── page.tsx                #   Landing page
│   └── globals.css
│
├── components/                 # ── FRONTEND ─────────────────
│   ├── ui/                     #   shadcn/ui primitives
│   ├── auth/                   #   Sign-up form
│   ├── dashboard-*.tsx         #   Dashboard section components
│   ├── header.tsx / footer.tsx #   Layout components
│   └── *-section.tsx           #   Landing page sections
│
├── hooks/                      # ── FRONTEND ─────────────────
│   ├── use-language.ts         #   Language switching hook
│   ├── use-mobile.ts           #   Mobile breakpoint hook
│   └── use-toast.ts            #   Toast notification hook
│
├── lib/                        # ── SHARED ───────────────────
│   ├── server/                 # Server-only utilities
│   │   ├── mongodb.ts          #   MongoDB client singleton
│   │   ├── auth.ts             #   NextAuth configuration
│   │   └── points.ts           #   Points balance queries
│   ├── languages.ts            #   i18n translations
│   └── utils.ts                #   Tailwind class helper (cn)
│
├── middleware.ts               # ── BACKEND ──────────────────
│   (route protection — redirects unauthenticated users)
│
├── public/                     # Static assets
└── docs/                       # Extended documentation
    ├── FRONTEND.md
    └── BACKEND.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
# Clone the repository
git clone https://github.com/seledka32/EcoPoints.git
cd EcoPoints

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local — see Environment Variables section below
```

### Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/ecopoints
AUTH_SECRET=replace-me-with-a-long-random-string
```

Generate a secure `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Run

```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
```

---

## Documentation

- [Frontend Guide](docs/FRONTEND.md) — pages, components, hooks, theming, i18n
- [Backend Guide](docs/BACKEND.md) — API routes, database schema, authentication

---

## License

MIT
