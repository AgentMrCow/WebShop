# WebShop

A full-stack e-commerce app with a product catalogue, shopping cart, customer accounts, checkout and an administration dashboard. Built with Next.js, React, NextAuth and Prisma, and deployed on Vercel.

**[Explore the live demo](https://ierg4210-1155174712.vercel.app/)**

## Features

- **Storefront:** browse 40 products across 9 categories, view product details and check stock availability.
- **Shopping cart:** add products, adjust quantities and keep your basket between visits.
- **Customer accounts:** register with email and password, or sign in with Google or GitHub when configured.
- **Orders:** place orders, view order history and cancel eligible orders, with inventory updated automatically.
- **Checkout:** try the PayPal sandbox payment flow, or use demo checkout when PayPal is not configured.
- **Administration:** manage products, categories, customers, inventory and orders from a dedicated dashboard.
- **Product images:** upload and manage images through the administration interface.

The live site is a demonstration store. PayPal uses sandbox payments; purchases are not charged or fulfilled.

## Tech stack

| Layer | Technology |
| --- | --- |
| Application | Next.js App Router, React and TypeScript |
| Interface | Tailwind CSS, Radix UI and shadcn/ui components |
| Authentication | NextAuth with email/password, Google and GitHub providers |
| Data | Prisma with PostgreSQL in production and SQLite for local development |
| Payments | PayPal Sandbox |
| Hosting | Vercel |

## Run locally

Use Node.js 22 and npm.

```sh
git clone https://github.com/AgentMrCow/WebShop.git
cd WebShop
npm ci
npm run setup:local
npm run dev:local
```

Open [localhost:3000](http://localhost:3000), browse the catalogue and register an account to try the order flow. Setup creates the local configuration and SQLite database, then initializes the catalogue. Running setup again preserves your existing data.

To run a local production build:

```sh
npm run build:local
npm run start:local
```

## Deploy on Vercel

Connect the repository to a Vercel project using the **Next.js** framework preset and Node.js 22. Add a PostgreSQL database, then configure the environment variables below in the project settings. The included `vercel.json` installs dependencies, applies migrations, initializes the catalogue and builds the app.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection for the application. `POSTGRES_PRISMA_URL` and `POSTGRES_URL` are also supported. |
| `DIRECT_URL` | Optional direct connection for migrations when using a pooler. `POSTGRES_URL_NON_POOLING` is also supported. |
| `NEXTAUTH_URL` | The deployed website's origin. |
| `NEXTAUTH_SECRET` | A unique authentication secret for each environment. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google sign-in. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Optional GitHub sign-in. |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | Optional PayPal sandbox checkout. |

For Google and GitHub sign-in, set the provider callback URL to your site's origin followed by `/api/auth/callback/google` or `/api/auth/callback/github`. Each provider appears once both of its configuration values are set.

Production and preview deployments should use separate database schemas or databases. Local development uses the SQLite setup above.

The deployment preparation commands are:

```sh
npm run db:deploy
npm run build
```

The catalogue is initialized once. For an existing PostgreSQL database, review its migration baseline before deployment.

## Create an administrator

Website registration creates customer accounts. To create an administrator, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment or local environment file. The password must contain at least 16 characters and fit within 72 UTF-8 bytes.

For local development, run this after `setup:local`:

```sh
npm run admin:create -- --local
```

For a deployed database, also supply `DATABASE_URL`, either through the environment or `.env.production.local`, and run:

```sh
npm run admin:create -- --production
```

The command creates a new account and leaves existing accounts unchanged. Remove the provisioning variables after use.

## Development checks

```sh
npm test
npm run typecheck
npm run check:public
npm run build:local
```

The tests cover input validation, account access and order processing.

## Background

Developed by Nelson Niu for CUHK IERG4210.
