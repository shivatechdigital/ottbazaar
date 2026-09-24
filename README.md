# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # OTTBazaar

  OTTBazaar is a full-stack marketplace for browsing, listing, and purchasing OTT and digital subscription plans. It combines a responsive React storefront with an Express API, Supabase authentication, and a PostgreSQL database.

  The application supports public catalog browsing as well as authenticated workflows such as cart management, wishlists, checkout, order history, reviews, and seller listings.

  Production site: [https://ottbazaar.shivatechdigital.com](https://ottbazaar.shivatechdigital.com)

  ## Table of Contents

  - [Features](#features)
  - [Technology Stack](#technology-stack)
  - [Architecture](#architecture)
  - [Project Structure](#project-structure)
  - [Prerequisites](#prerequisites)
  - [Local Installation](#local-installation)
  - [Environment Variables](#environment-variables)
  - [Supabase Setup](#supabase-setup)
  - [Database Schema](#database-schema)
  - [Authentication Setup](#authentication-setup)
  - [Catalog Seeding](#catalog-seeding)
  - [Available Commands](#available-commands)
  - [Application Routes](#application-routes)
  - [API Endpoints](#api-endpoints)
  - [Production Deployment](#production-deployment)
  - [Updating Production](#updating-production)
  - [Troubleshooting](#troubleshooting)
  - [Security Notes](#security-notes)
  - [Contributing](#contributing)

  ## Features

  ### Customer experience

  - Browse active OTT subscription listings.
  - Search products by title, platform, or plan type.
  - Filter listings by platform, duration, and price.
  - View product details, pricing, availability, and reviews.
  - Save products to a personal wishlist.
  - Add products to a persistent shopping cart.
  - Complete checkout with customer and payment information.
  - View previous orders and purchased items.
  - Create an account and sign in using email and password.
  - Submit ratings and reviews for products.
  - Send messages through the contact form.

  ### Seller experience

  - Create OTT subscription listings.
  - Configure platform, duration, price, available seats, and features.
  - View and manage personal listings from Seller Desk.
  - Edit listing details and availability.
  - Disable or remove listings.

  ### Platform capabilities

  - Supabase authentication and session validation.
  - Protected customer and seller routes.
  - Server-side API access using a secret Supabase key.
  - PostgreSQL schema with foreign keys, checks, indexes, and RLS enabled.
  - Repeat-safe catalog seeding that updates existing products.
  - Responsive storefront for desktop and mobile.
  - Express production server with SPA route fallback.
  - Nginx reverse proxy and HTTPS-ready deployment.
  - PM2 process management for automatic restart and reboot persistence.

  ## Technology Stack

  | Layer | Technology |
  | --- | --- |
  | Frontend | React 19, TypeScript, React Router |
  | Styling | Tailwind CSS 4, custom CSS |
  | Animation | Framer Motion |
  | Icons | Lucide React |
  | Build tool | Vite 7 |
  | Backend | Node.js, Express |
  | Database | Supabase PostgreSQL |
  | Authentication | Supabase Auth |
  | Production process | PM2 |
  | Reverse proxy | Nginx |
  | TLS/SSL | Let's Encrypt and Certbot |

  ## Architecture

  ```text
  Browser
    |
    | HTTPS
    v
  Nginx reverse proxy
    |
    | http://127.0.0.1:3500
    v
  Express server
    |-- Serves the Vite production build from dist/
    |-- Handles /api/* requests
    |
    v
  Supabase
    |-- PostgreSQL database
    |-- Authentication
    |-- REST API
  ```

  The browser uses the publishable Supabase key for authentication. Application data is accessed through the Express API. The server uses the secret key, which must never be exposed in frontend code or committed to Git.

  ## Project Structure

  ```text
  ottbazaar/
  |-- api/                    # Express-compatible API handlers
  |   |-- cart.js
  |   |-- contacts.js
  |   |-- db-client.js
  |   |-- faqs.js
  |   |-- orders.js
  |   |-- platforms.js
  |   |-- products.js
  |   |-- reviews.js
  |   |-- testimonials.js
  |   `-- wishlist.js
  |-- public/
  |   |-- images/             # Product and page imagery
  |   `-- videos/             # Hero/background videos
  |-- scripts/
  |   `-- seed-catalog.js     # Repeat-safe product catalog seed
  |-- src/
  |   |-- components/         # Shared layout and product components
  |   |-- contexts/           # Authentication and toast state
  |   |-- lib/                # Supabase, API, and auth helpers
  |   |-- pages/              # Route-level React pages
  |   |-- App.tsx             # Application routes
  |   |-- main.tsx            # React entry point
  |   `-- types.ts            # Shared TypeScript interfaces
  |-- supabase/
  |   `-- schema.sql          # Complete database schema
  |-- server.js               # Production Express server
  |-- package.json
  |-- vite.config.ts
  `-- README.md
  ```

  ## Prerequisites

  Install or create the following before starting:

  - Node.js 20 or newer.
  - npm 10 or newer.
  - Git.
  - A Supabase project.
  - A Supabase Auth user for seeded seller products.
  - For production: an Ubuntu server, domain name, Nginx, PM2, and Certbot.

  Check installed versions:

  ```bash
  node --version
  npm --version
  git --version
  ```

  ## Local Installation

  1. Clone the repository:

  ```bash
  git clone https://github.com/shivatechdigital/ottbazaar.git
  cd ottbazaar
  ```

  2. Install dependencies:

  ```bash
  npm install
  ```

  3. Create a local `.env` file using the template in the next section.

  4. Create the database schema in Supabase.

  5. Start the frontend development server:

  ```bash
  npm run dev
  ```

  Vite prints the local development URL, normally `http://localhost:5173`.

  The Vite development server is intended for frontend development. To test the complete production server, build and start the application:

  ```bash
  npm run build
  npm start
  ```

  The Express server uses `PORT` when provided and otherwise listens on port `3000`.

  ## Environment Variables

  Create `.env` in the project root:

  ```dotenv
  # Browser-safe Supabase configuration
  VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
  VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY

  # Server-side Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_KEY
  FULLSTACK_PROJECT_REF=YOUR_PROJECT_REF

  # Production server port (optional; defaults to 3000)
  PORT=3500
  ```

  Key mapping from Supabase **Project Settings > API Keys**:

  | Environment variable | Supabase value | Exposure |
  | --- | --- | --- |
  | `VITE_SUPABASE_URL` | Project URL | Browser-safe |
  | `VITE_SUPABASE_ANON_KEY` | Publishable key | Browser-safe |
  | `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Server |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key | Server |
  | `SUPABASE_SERVICE_ROLE_KEY` | Secret key | Server only |
  | `FULLSTACK_PROJECT_REF` | Project ID/reference | Server |
  | `PORT` | Express listen port | Server |

  Important:

  - Never commit `.env`.
  - Never put `SUPABASE_SERVICE_ROLE_KEY` in frontend source code.
  - Never prefix a secret with `VITE_`; Vite embeds all `VITE_*` values in the browser bundle.
  - Rotate a secret key immediately if it appears in Git history, screenshots, logs, or chat.
  - Production and local environments require separate `.env` files unless they intentionally use the same project.

  ## Supabase Setup

  1. Create a Supabase organization and project.
  2. Open **Project Settings > API Keys**.
  3. Copy the project URL, publishable key, and secret key into `.env`.
  4. Open **SQL Editor**.
  5. Create a new query.
  6. Paste the complete contents of `supabase/schema.sql`.
  7. Run the query.
  8. Confirm the tables appear in **Table Editor**.

  The schema file is repeat-safe for table and index creation because it uses `if not exists`.

  ## Database Schema

  The project uses the following tables:

  | Table | Purpose |
  | --- | --- |
  | `platforms` | OTT platform names, colors, categories, and taglines |
  | `products` | Subscription listings and seller information |
  | `cart_items` | Per-user shopping cart rows |
  | `wishlist_items` | Per-user saved products |
  | `orders` | Checkout and customer order records |
  | `order_items` | Product snapshots attached to orders |
  | `reviews` | User ratings and product comments |
  | `contacts` | Contact form submissions |
  | `faqs` | Frequently asked questions |
  | `testimonials` | Homepage customer testimonials |

  Relations are enforced with foreign keys. Quantity, rating, duration, price, and slot values have database checks. Common lookup columns are indexed.

  Row Level Security is enabled on all public tables. Current application data operations run through the trusted backend using the server secret key. Do not expose that key to the browser.

  ## Authentication Setup

  ### Email and password

  Email/password authentication is the primary configured login method.

  In Supabase:

  1. Open **Authentication > Providers > Email**.
  2. Enable the email provider.
  3. Disable **Confirm email** if users must be logged in immediately after signup.

  If **Confirm email** is enabled, Supabase intentionally returns no session until the user confirms the email. Immediate login cannot work in that mode.

  ### Authentication URLs

  In **Authentication > URL Configuration**, configure:

  ```text
  Site URL:
  https://ottbazaar.shivatechdigital.com

  Redirect URL:
  https://ottbazaar.shivatechdigital.com/**
  ```

  Add local URLs when testing redirects locally:

  ```text
  http://localhost:5173/**
  http://localhost:3000/**
  ```

  ### Optional Google authentication

  The repository contains a Supabase Google OAuth helper. To expose Google login in the UI, enable Google in Supabase and connect a Google Cloud OAuth client branded as OTTBazaar.

  Supabase Google callback:

  ```text
  https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
  ```

  Google Cloud configuration:

  - OAuth consent screen app name: `OTTBazaar`
  - Authorized JavaScript origin: `https://ottbazaar.shivatechdigital.com`
  - Authorized redirect URI: the Supabase callback shown above

  The name shown by Google comes from the Google Cloud OAuth consent screen, not from React button text.

  ## Catalog Seeding

  The included seed script inserts the initial OTT catalog and updates matching existing products when rerun. It does not create duplicates for the same seller, platform, and duration.

  ### Create or locate a seller user

  1. Open Supabase **Authentication > Users**.
  2. Create a user or use an existing seller account.
  3. Copy the user UUID.

  Run the seed:

  ```bash
  SEED_SELLER_ID="USER_UUID" npm run seed:catalog
  ```

  On Windows PowerShell:

  ```powershell
  $env:SEED_SELLER_ID="USER_UUID"
  npm run seed:catalog
  ```

  The script currently seeds 18 products across Spotify, SonyLIV, JioHotstar, ZEE5, IPTV, Netflix, Prime Video, Crunchyroll, and YouTube Premium.

  Successful output ends with:

  ```text
  Catalog seed complete: 18 products.
  ```

  Running the command again updates prices, titles, images, and availability for matching products.

  ## Available Commands

  | Command | Description |
  | --- | --- |
  | `npm run dev` | Start Vite development mode with hot reload |
  | `npm run build` | Type-check and create the production bundle |
  | `npm run lint` | Run ESLint across the repository |
  | `npm run preview` | Preview the Vite bundle without Express APIs |
  | `npm run seed:catalog` | Insert or update the default product catalog |
  | `npm start` | Start the Express production server |

  Always run `npm run build` before restarting the production server after frontend changes.

  ## Application Routes

  ### Public routes

  | Route | Page |
  | --- | --- |
  | `/` | Homepage and featured marketplace content |
  | `/shop` | Product catalog, search, and filters |
  | `/shop/:id` | Product details and reviews |
  | `/about` | About OTTBazaar |
  | `/contact` | Contact form |
  | `/faq` | Frequently asked questions |
  | `/login` | Member login and signup |
  | `/admin/login` | Alias of the login page |

  ### Protected routes

  | Route | Page |
  | --- | --- |
  | `/cart` | Authenticated user's cart |
  | `/wishlist` | Authenticated user's wishlist |
  | `/checkout` | Checkout form |
  | `/orders` | Order history |
  | `/sell` | Create a seller listing |
  | `/dashboard` | Seller Desk and listing management |

  Unauthenticated visitors who open protected routes are redirected to login.

  ## API Endpoints

  All endpoints are mounted by `server.js` under `/api`.

  | Endpoint | Methods | Purpose | Authentication |
  | --- | --- | --- | --- |
  | `/api/platforms` | `GET` | List platforms | Public |
  | `/api/products` | `GET`, `POST`, `PUT`, `DELETE` | Browse and manage products | Writes require login |
  | `/api/cart` | `GET`, `POST`, `PUT`, `DELETE` | Manage cart | Required |
  | `/api/wishlist` | `GET`, `POST`, `DELETE` | Manage wishlist | Required |
  | `/api/orders` | `GET`, `POST` | View and create orders | Required |
  | `/api/reviews` | `GET`, `POST` | Read and submit reviews | POST requires login |
  | `/api/contacts` | `POST` | Submit contact form | Public |
  | `/api/faqs` | `GET` | List FAQs | Public |
  | `/api/testimonials` | `GET` | List testimonials | Public |

  Authenticated requests send the Supabase access token:

  ```http
  Authorization: Bearer USER_ACCESS_TOKEN
  Content-Type: application/json
  ```

  The backend validates the token with Supabase before accessing user-specific data.

  ## Production Deployment

  The following example deploys to Ubuntu with Node.js, PM2, Nginx, and HTTPS.

  ### 1. Clone and build

  ```bash
  git clone https://github.com/shivatechdigital/ottbazaar.git
  cd ottbazaar
  npm install
  npm run build
  ```

  Create the production `.env` before starting the server. Set:

  ```dotenv
  PORT=3500
  ```

  ### 2. Run permanently with PM2

  ```bash
  sudo npm install -g pm2
  pm2 start server.js --name ottbazaar
  pm2 save
  pm2 startup
  ```

  Run the `sudo ...` command printed by `pm2 startup`, then save again:

  ```bash
  pm2 save
  pm2 status
  ```

  Useful PM2 commands:

  ```bash
  pm2 status
  pm2 logs ottbazaar
  pm2 restart ottbazaar --update-env
  pm2 stop ottbazaar
  ```

  ### 3. Configure Nginx

  Install Nginx:

  ```bash
  sudo apt update
  sudo apt install nginx -y
  ```

  Create `/etc/nginx/sites-available/ottbazaar`:

  ```nginx
  server {
      listen 80;
      server_name ottbazaar.shivatechdigital.com;

      location / {
          proxy_pass http://127.0.0.1:3500;
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```

  Enable the site:

  ```bash
  sudo ln -s /etc/nginx/sites-available/ottbazaar /etc/nginx/sites-enabled/ottbazaar
  sudo nginx -t
  sudo systemctl reload nginx
  ```

  The DNS `A` record for `ottbazaar.shivatechdigital.com` must point to the server public IP. Cloud firewall/security-group inbound rules must allow TCP ports `80` and `443`.

  ### 4. Enable HTTPS

  ```bash
  sudo apt install certbot python3-certbot-nginx -y
  sudo certbot --nginx -d ottbazaar.shivatechdigital.com
  ```

  Verify automatic renewal:

  ```bash
  sudo certbot renew --dry-run
  ```

  ## Updating Production

  After pushing code to the main branch, update the VM with:

  ```bash
  cd ~/ottbazaar
  git pull --rebase origin main
  npm install
  npm run build
  pm2 restart ottbazaar --update-env
  pm2 status
  ```

  Use `npm install` because dependency changes may update `package-lock.json`.

  Do not run the seed after every deployment. Run it only when catalog defaults changed or a new database is being initialized.

  ## Troubleshooting

  ### `supabaseUrl is required`

  The server did not load `NEXT_PUBLIC_SUPABASE_URL`.

  - Confirm `.env` exists in the project root on the server.
  - Confirm the variable name is exact.
  - Restart PM2 using `--update-env`.

  ```bash
  pm2 restart ottbazaar --update-env
  ```

  ### `getaddrinfo ENOTFOUND ...supabase.co`

  The Supabase project hostname is invalid, unavailable, paused, or deleted.

  ```bash
  getent hosts YOUR_PROJECT_REF.supabase.co
  curl -I https://YOUR_PROJECT_REF.supabase.co
  ```

  A `404` response from the root Supabase URL is normal and confirms connectivity.

  ### Marketplace fails to load

  Test APIs directly:

  ```bash
  curl -i http://127.0.0.1:3500/api/platforms
  curl -i http://127.0.0.1:3500/api/products
  curl -i http://127.0.0.1:3500/api/testimonials
  ```

  Then inspect logs:

  ```bash
  pm2 logs ottbazaar
  ```

  ### `Missing script: seed:catalog`

  The server checkout is outdated:

  ```bash
  git pull --rebase origin main
  npm install
  npm run
  ```

  ### Seed command hangs or fails

  - Confirm the schema was executed.
  - Confirm the Supabase project is reachable.
  - Confirm `SEED_SELLER_ID` exists in **Authentication > Users**.
  - Confirm the server `.env` contains the current secret key.

  ### User signs up but is not logged in

  Disable **Confirm email** under Supabase email provider settings. When confirmation is enabled, Supabase does not issue a session immediately.

  Also rebuild and restart production after changing frontend code:

  ```bash
  npm run build
  pm2 restart ottbazaar
  ```

  Hard-refresh the browser with `Ctrl+F5` if an old bundle is cached.

  ### Cart says unauthorized or invalid token

  - Sign out and sign in again.
  - Confirm frontend and backend `.env` values use the same Supabase project.
  - Clear stale browser storage when switching Supabase projects.
  - Check `pm2 logs ottbazaar` for the backend response.

  ### Domain works on port 3500 but not HTTPS

  - Confirm the DNS record points to the correct public IP.
  - Confirm Nginx configuration uses the exact subdomain.
  - Confirm ports 80 and 443 are allowed by the cloud firewall.
  - Run `sudo nginx -t` before reloading Nginx.
  - Check `sudo systemctl status nginx`.

  ### Application stops when SSH closes

  The application was started with `npm start` instead of PM2. Start and save it with:

  ```bash
  pm2 start server.js --name ottbazaar
  pm2 save
  ```

  ## Security Notes

  - `.env`, `.env.*`, dependencies, and build output are ignored by Git.
  - Publishable keys may be used in the browser; secret keys may not.
  - Rotate any key that has been publicly exposed.
  - Keep RLS enabled even though current data access runs through the backend.
  - Validate all authenticated actions on the server, not only in React.
  - Use HTTPS in production so credentials and access tokens are encrypted in transit.
  - Do not log access tokens, refresh tokens, passwords, or secret keys.
  - Restrict cloud firewall access to required ports.
  - Keep Node.js, npm dependencies, Ubuntu packages, Nginx, and PM2 updated.
  - Review `npm audit` output before applying automated major-version fixes.

  ## Contributing

  1. Create a branch from `main`.
  2. Make a focused change.
  3. Run validation:

  ```bash
  npm run lint
  npm run build
  ```

  4. Test affected public and authenticated workflows.
  5. Commit without including `.env`, credentials, generated logs, or local editor files.
  6. Open a pull request describing the behavior changed and validation performed.

  ## License

  No open-source license is currently declared. Unless a license is added, all rights remain with the repository owner.
