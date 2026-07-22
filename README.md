# REID

**Reliable Email Infrastructure for Developers**

REID is a modern developer-first email platform. Send transactional emails through one simple API — no SMTP complexity.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** NestJS, Prisma, PostgreSQL
- **SMTP:** Brevo (extensible to SES, Mailgun, SMTP2GO, Custom SMTP)
- **Auth:** JWT, bcrypt
- **Monorepo:** Turborepo

## Project Structure

```
reid/
├── apps/
│   ├── api/          # NestJS backend
│   └── dashboard/    # Next.js frontend
├── packages/
│   ├── database/     # Prisma schema & migrations
│   ├── shared/       # Shared types & schemas
│   ├── sdk-js/       # JavaScript SDK
│   ├── ui/           # Shared UI components
│   └── docs/         # Documentation
└── turbo.json
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database
npm run db:seed

# Start development servers
npm run dev
```

### Default Credentials

- **Email:** admin@reid.dev
- **Password:** Admin123!

## API Documentation

Once running, visit `http://localhost:3001/docs` for the Swagger API documentation.

### Send an Email

```bash
curl -X POST http://localhost:3001/api/v1/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "hello@reid.dev",
    "to": ["user@example.com"],
    "subject": "Hello from REID",
    "html": "<h1>Hello World!</h1>"
  }'
```

## Features

- Authentication (Signup, Login, JWT)
- API Key management (Live & Test keys)
- Domain verification (SPF, DKIM, DMARC)
- Email sending with delivery tracking
- Email logs and analytics dashboard
- SMTP abstraction layer (Brevo, SES, Mailgun, Custom)
- Dark-first premium UI
- TypeScript SDK

## License

MIT
